//initalize Supabase
const{createClient} = window.supabase;
const supabaseURL = "https://pjenzaldwxejuyyeppyp.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZW56YWxkd3hlanV5eWVwcHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTAwODgsImV4cCI6MjA4NDQ4NjA4OH0.MKWunjeuxDrVor09ImwL-QsCXfkErCwKO_4JHybJpUU";
supabase = createClient(supabaseURL, supabaseKey);
console.log("I made it here")

async function fetchAssignments() {
    const container = document.getElementById("container");

    // 1. Get the current logged-in user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        container.innerHTML = "<p style=\"margin-left: 180px;\">Please log in to see your assignments.</p>";
        return;
    }

    // 2. Fetch data from the "Assignments" table
    const { data: assignments, error } = await supabase
        .from("Assignments")
        .select("*")
        .eq("user_id", user.id) // Filter by the user's ID
        .order("due_date", { ascending: true });

    if (error) {
        console.error("Error fetching assignments:", error);
        container.innerHTML = "<p style=\"margin-left: 180px;\">Error loading assignments.</p>";
        return;
    }

    // 3. Check if there are no assignments
    if (assignments.length === 0) {
        container.innerHTML = "<p style=\"margin-left: 180px;\">No assignments found! Add one to get started.</p>";
        return;
    }

    // 4. Build the HTML list
    container.innerHTML = ""; // Clear the loading message
    assignments.forEach(task => {
        const div = document.createElement("div");
        div.className = `assignment-card ${task.completed ? 'completed' : ''}`;
        // Apply padding directly via JS
        div.style.padding = "180px";
        div.style.marginBottom = "15px";
        div.style.border = "1px solid #eee";
        div.innerHTML = `
        <h3 style="${task.completed ? 'text-decoration: line-through;' : ''}">${task.title}</h3>
        <p><strong>Subject:</strong> ${task.subject}</p>
        <p><strong>Due:</strong> ${task.due_date}</p>
        <div class="card-actions">
            ${!task.completed ? `<button class="complete-btn" data-id="${task.id}">Done</button>` : '<span>✅ Finished</span>'}
            <button class="delete-btn" data-id="${task.id}">Delete</button>
        </div>
        <hr>
    `;

        // Complete Button Logic
        const completeBtn = div.querySelector(".complete-btn");
        if (completeBtn) {
            completeBtn.addEventListener("click", () => toggleComplete(task.id, true));
            completeBtn.addEventListener("click", async (e) => {
                const btn = e.currentTarget;
                btn.disabled = true; // Prevent double-taps
                await toggleComplete(task.id, true);
                handleCompleteAction(task.id, div, btn);
            });
        }

        // Delete Button Logic
        const deleteBtn = div.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", () => deleteAssignment(task.id, div));

        container.appendChild(div);



        // Add your event listeners here...

    });
}

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

async function toggleComplete(id, element) {
    try {
        const { data, error } = await supabase
            .from('Assignments')
            .update({ completed: true })
            .eq('id', id); // Ensure the ID matches the row you want to change

        if (error) throw error;

        console.log("Assignment updated successfully:", data);

        // Optional: Refresh your UI or remove the item from the 'pending' list
        // location.reload();
    } catch (error) {
        console.error("Error updating assignment:", error.message);
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

/*async function handleCompleteAction(taskId, taskElement, b) {
    // 1. Visually hide the task immediately for a "snappy" feel
    taskElement.style.opacity = "0.5";

    // 2. Show the Toast
    const toast = document.getElementById("undo-toast");
    const undoBtn = document.getElementById("undo-action-btn");
    toast.classList.remove("hidden");

    // 3. Set a timer (5 seconds)
    undoTimeout = setTimeout(async () => {
        // This runs if the user DOES NOT click undo
        await toggleComplete(taskId, true);
        //taskElement.remove(); // Remove from the "Pending" list
        toast.classList.add("hidden");
    }, 5000);

    // 4. Set up the Undo Button click
    undoBtn.onclick = () => {
        clearTimeout(undoTimeout); // Stop the database update
        undoComplete(taskId)
        taskElement.style.opacity = "1"; // Restore the task
        toast.classList.add("hidden");   // Hide the toast
        console.log("Action undone!");
        undoTimeout = null; // Reset the tracker
        // Restore the UI
        taskElement.style.display = "block"; // Or "block", matching your CSS
        toast.classList.add("hidden");
        b.disabled = false
        console.log("Undo successful - ready to click again.");
    };
}*/

async function handleCompleteAction(taskId, taskElement, b) {
    taskElement.classList.add("completed");
    if (undoTimeout) clearTimeout(undoTimeout);

    const toast = document.getElementById("undo-toast");
    const undoBtn = document.getElementById("undo-action-btn");

    // 1. "Soft" Complete: Gray it out visually

    toast.classList.remove("hidden");

    undoTimeout = setTimeout(async () => {
        // 2. Finalize in Supabase
        await toggleComplete(taskId, true);
        toast.classList.add("hidden");
        undoTimeout = null;
        // Task stays on page because we don't call .remove()
    }, 5000);

    undoBtn.onclick = () => {
        clearTimeout(undoTimeout); // Stop the database update
        undoComplete(taskId);
        taskElement.classList.remove("completed");
        toast.classList.add("hidden");   // Hide the toast
        console.log("Action undone!");
        undoTimeout = null; // Reset the tracker
        // Restore the UI
        taskElement.style.display = "block"; // Or "block", matching your CSS
        toast.classList.add("hidden");
        b.disabled = false
        console.log("Undo successful - ready to click again.");
    };
}

// Run the function when the page loads
fetchAssignments();