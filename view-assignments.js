//initalize Supabase
const{createClient} = window.supabase;
const supabaseURL = "https://pjenzaldwxejuyyeppyp.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZW56YWxkd3hlanV5eWVwcHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTAwODgsImV4cCI6MjA4NDQ4NjA4OH0.MKWunjeuxDrVor09ImwL-QsCXfkErCwKO_4JHybJpUU";
supabase = createClient(supabaseURL, supabaseKey);
console.log("I made it here")

let allAssignments = [];



async function fetchAssignments() {
    const container = document.getElementById("container");
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

    // FIX 1: Use 'data' (the variable from Supabase) instead of 'assignments'
    allAssignments = data;

    if (allAssignments.length === 0) {
        container.innerHTML = "<p>No assignments found! Add one to get started.</p>";
        return;
    }

    // Initial render
    renderAssignments(allAssignments);
}

// FIX 2: Move renderAssignments OUTSIDE fetchAssignments so it's a clean helper
/*function renderAssignments(assignmentsList) {
    const container = document.getElementById("container");
    container.innerHTML = "";

    assignmentsList.forEach(task => {
        const typeColors = {
            'Test': '#ff4d4d',
            'Quiz': '#ffa500',
            'Homework': '#4da6ff',
            'Project': '#9933ff',
            'Other': '#808080'
        };

        const badgeColor = typeColors[task.type] || '#808080';
        const div = document.createElement("div");

        // Use 'is_completed' to match your database column name
        div.className = `assignment-card ${task.completed ? 'completed' : ''}`;

        // Note: 180px padding is very large; 20px is usually standard!
        div.style.padding = "20px";
        div.style.marginLeft = "180px";
        div.style.marginBottom = "15px";
        div.style.border = "1px solid #eee";

        div.innerHTML = `
            <h3>${task.title} <span class="badge" style="background-color: ${badgeColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${task.type}</span></h3>
            <p><strong>Subject:</strong> ${task.subject}</p>
            <p><strong>Due:</strong> ${task.due_date}</p>
            <div class="card-actions">
                ${!task.completed ? `<button class="complete-btn">Done</button>` : '<span>✅ Finished</span>'}
                <button class="delete-btn">Delete</button>
            </div>
        `;

        // Logic for buttons
        const completeBtn = div.querySelector(".complete-btn");
        if (completeBtn) {
            completeBtn.onclick = () => toggleComplete(task.id, task.completed);
        }

        const deleteBtn = div.querySelector(".delete-btn");
        deleteBtn.onclick = () => deleteAssignment(task.id, div);

        container.appendChild(div);
    });
} */

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