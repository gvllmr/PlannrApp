//initalize Supabase
console.log("Checking StreakManager availability:", typeof StreakManager);
let allAssignments = [];



async function fetchAssignments() {
    const container = document.getElementById("container");

    if (!container) return;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        container.innerHTML = "<p style='margin-left: 20px;'>Please log in to see your assignments.</p>";
        return;
    }

    const { data, error } = await supabase
        .from("Assignments")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });

    if (error) {
        console.error("Error fetching assignments:", error);
        container.innerHTML = "<p>Error loading assignments.</p>";
        return;
    }

    if (user) {
        // Check for missed assignments from yesterday to reset streak
        StreakManager.checkForReset(user.id);
    }

    // FIX 1: Use 'data' (the variable from Supabase) instead of 'assignments'
    allAssignments = data;

    if (allAssignments.length === 0) {
        container.innerHTML = "<p>No assignments found! Add one to get started.</p>";
        return;
    }

    // Initial render
    renderAssignments(allAssignments);
}


// FIX 3: Move Sort Listener outside so it only gets created ONCE
document.getElementById("sortOrder")?.addEventListener("change", (e) => {
    const sortBy = e.target.value;
    const sortedList = [...allAssignments].sort((a, b) => {
        const valA = (a[sortBy] || "").toString().toLowerCase();
        const valB = (b[sortBy] || "").toString().toLowerCase();
        return valA < valB ? -1 : (valA > valB ? 1 : 0);
    });
    renderAssignments(sortedList);
});

async function deleteAssignment(id, element) {
    // Optional: Ask for confirmation
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    const { error } = await supabase
        .from("Assignments")
        .delete()
        .eq("id", id); // Matches the ID of the assignment

    if (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete assignment.");
    } else {
        // Remove the element from the UI immediately
        element.remove();
        console.log("Deleted successfully");
    }
}

async function toggleTaskComplete(taskId, isCompleted) {
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Update the assignment status in Supabase
    const { error } = await supabase
        .from('Assignments')
        .update({ completed: isCompleted })
        .eq('id', taskId);

    if (!error && isCompleted) {
        // 2. TRIGGER THE STREAK HERE
        // This is where the magic happens!
        await StreakManager.handleTaskCompletion(user.id);

        console.log("Task completed and streak checked!");
    }
}

async function undoComplete(taskId) {
    try {
        const { error } = await supabase
            .from('Assignments')
            .update({ completed: false }) // Set it back to false
            .eq('id', taskId);

        if (error) throw error;

        console.log("Task marked as incomplete.");
    } catch (error) {
        console.error("Undo failed:", error.message);
    }
}

let undoTimeout;

// Run the function when the page loads
fetchAssignments();


/*post it not layout */

function renderAssignments(assignmentsList) {
    const container = document.getElementById("container");
    if (!container) return;
    container.innerHTML = "";

    assignmentsList.forEach(task => {
        const div = document.createElement("div");
        const isDoneClass = task.completed ? 'completed' : '';
        div.className = `post-it ${isDoneClass}`;

        // Apply user-selected color
        div.style.backgroundColor = task.color || "#fffd91";
        div.style.color = "#000000";

        div.innerHTML = `
    <div class="post-it-content">
        <span class="type-badge badge-${task.type}">${task.type}</span>
        
        <h3 class="assignment-title" title="${task.title}">${task.title}</h3>
        
        
        <p class="assignment-subject"><strong>Subject:</strong> ${task.subject}</p>
        <button class="btn btn-sm btn-link p-0 text-decoration-none view-notes-btn" style="color: #555;">
            📄 Edit Notes
        </button>
    </div>
    <div class="post-it-footer">
        <p class="due-date">📅 ${task.due_date}</p>
        <div class="card-actions" style="margin-top: 15px; display: flex; gap: 10px; align-items: center;">
    ${!task.completed
            ? `<button class="complete-btn" data-id="${task.id}">
             <svg width="16" height="16" style="fill: currentColor; margin-right: 5px;">
                <use xlink:href="#check2"></use>
             </svg>
             Done
           </button>`
            : '<span class="status-badge">✅ Finished</span>'
        }
    <button class="delete-btn" data-id="${task.id}">🗑️</button>
</div>
    </div>
`;

        // VIEW/EDIT NOTES LOGIC
        const viewNotesBtn = div.querySelector(".view-notes-btn");
        viewNotesBtn.onclick = () => {
            openDescriptionModal(task);
        };

        // ... rest of your existing button logic (completeBtn and deleteBtn) ...
        const completeBtn = div.querySelector(".complete-btn");
        if (completeBtn) {
            completeBtn.onclick = async () => {
                // 1. Disable the button immediately to prevent double-clicks
                completeBtn.disabled = true;
                completeBtn.innerText = "Saving...";

                try {
                    // 2. Call your existing Supabase logic (passing true for isCompleted)
                    await toggleTaskComplete(task.id, true);

                    // 3. Update the local task object so the UI stays in sync
                    task.completed = true;

                    // 4. Re-render the list to reflect the "✅ Finished" state
                    // OR manually update the DOM for a smoother transition:
                    div.classList.add('completed');
                    const actionContainer = div.querySelector(".card-actions");
                    actionContainer.innerHTML = `<span>✅ Finished</span><button class="delete-btn">🗑️</button>`;

                    // Re-attach the delete logic to the new button since we replaced the innerHTML
                    actionContainer.querySelector(".delete-btn").onclick = () => deleteAssignment(task.id, div);

                } catch (err) {
                    console.error("Failed to complete task:", err);
                    alert("Something went wrong updating the task.");
                    completeBtn.disabled = false;
                    completeBtn.innerText = "Done";
                }
            };
        }
        const deleteBtn = div.querySelector(".delete-btn");
        deleteBtn.onclick = () => deleteAssignment(task.id, div);

        container.appendChild(div);
    });
}

function openDescriptionModal(task) {
    const modalTitle = document.getElementById("modalTitle");
    modalTitle.innerText = task.title;
    const modal = new bootstrap.Modal(document.getElementById('descriptionModal'));
    const titleEl = document.getElementById('modalTitle');
    const descInput = document.getElementById('modalDescription');
    const colorInput = document.getElementById('modalSelectedColor');
    const saveBtn = document.getElementById('saveDescriptionBtn');
    const swatches = document.querySelectorAll('#modalColorPalette .color-swatch');

    // 1. Populate existing data
    titleEl.innerText = `Details: ${task.title}`;
    descInput.value = task.description || "";
    colorInput.value = task.color || "#fffd91";

    // 2. Highlight the currently saved color in the palette
    swatches.forEach(s => {
        s.classList.remove('active');
        if (s.getAttribute('data-color') === colorInput.value) {
                s.classList.add('active');
        }

        // Add click listener for swatches inside the modal
        s.onclick = function() {
            swatches.forEach(sw => sw.classList.remove('active'));
            this.classList.add('active');
            colorInput.value = this.getAttribute('data-color');
        };
    });

    // 3. Handle Save
    saveBtn.onclick = async () => {
        const newDescription = descInput.value;
        const newColor = colorInput.value;

        const { error } = await supabase
            .from("Assignments")
            .update({
                description: newDescription,
                color: newColor
            })
            .eq("id", task.id);

        if (error) {
            alert("Error saving changes: " + error.message);
        } else {
            // Update local data in the master list
            task.description = newDescription;
            task.color = newColor;

            // --- NEW LOGIC TO PRESERVE SORT ---
            const sortDropdown = document.getElementById("sortOrder");
            const currentSort = sortDropdown ? sortDropdown.value : "due_date";

            const sortedList = [...allAssignments].sort((a, b) => {
                const valA = (a[currentSort] || "").toString().toLowerCase();
                const valB = (b[currentSort] || "").toString().toLowerCase();
                return valA < valB ? -1 : (valA > valB ? 1 : 0);
            });

            // Render the sorted list instead of the raw allAssignments
            renderAssignments(sortedList);
            // ----------------------------------

            modal.hide();
            console.log("Assignment updated and sort preserved!");
        }
    };

    modal.show();
}

function applyCurrentSortAndRender() {
    const sortBy = document.getElementById("sortOrder")?.value || "due_date";
    const sortedList = [...allAssignments].sort((a, b) => {
        const valA = (a[sortBy] || "").toString().toLowerCase();
        const valB = (b[sortBy] || "").toString().toLowerCase();
        return valA < valB ? -1 : (valA > valB ? 1 : 0);
    });
    renderAssignments(sortedList);
}