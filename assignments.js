    const{createClient} = window.supabase;
    const supabaseURL = "https://pjenzaldwxejuyyeppyp.supabase.co"
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZW56YWxkd3hlanV5eWVwcHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTAwODgsImV4cCI6MjA4NDQ4NjA4OH0.MKWunjeuxDrVor09ImwL-QsCXfkErCwKO_4JHybJpUU";
    supabase = createClient(supabaseURL, supabaseKey);
    console.log("I made it here")


    const insertAssignmentBtn = document.getElementById("insertAssignmentBtn");

    insertAssignmentBtn?.addEventListener("click", async (e) => {
        e.preventDefault();

        // 1. Grab values and trim whitespace
        const title = document.getElementById("title").value.trim();
        const subject = document.getElementById("subject").value.trim();
        const description = document.getElementById('description').value.trim();
        const dueDate = document.getElementById("dueDate").value;

        // --- VALIDATION START ---
        // Check if fields are empty
        if (!title || !subject || !dueDate) {
            alert("Please fill in the title, subject, and due date.");
            return;
        }

        // Check subject length
        if (subject.length > 24) {
            alert("Subject must be 24 characters or less.");
            return;
        }
        // --- VALIDATION END ---

        insertAssignmentBtn.disabled = true;
        insertAssignmentBtn.innerText = "Saving...";

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { error: insertError } = await supabase
                .from("Assignments")
                .insert({
                    title: title,
                    subject: subject,
                    description: description,
                    due_date: dueDate,
                    user_id: user.id,
                    type: document.getElementById("taskType").value,
                    color: document.getElementById('selectedColor').value
                });

            if (insertError) throw insertError;
            window.location.href = 'assignments.html';

        } catch (err) {
            console.error("Submission failed:", err);
            alert(err.message || "Failed to save assignment.");
            insertAssignmentBtn.disabled = false;
            insertAssignmentBtn.innerText = "Save Assignment";
        }
    });

    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', function() {
            // 1. Remove 'active' class from all swatches
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));

            // 2. Add 'active' class to the clicked one
            this.classList.add('active');

            // 3. Update the hidden input value
            const color = this.getAttribute('data-color');
            document.getElementById('selectedColor').value = color;
        });
    });
    // Run the function when the page loads