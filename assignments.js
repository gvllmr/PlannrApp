    const{createClient} = window.supabase;
    const supabaseURL = "https://pjenzaldwxejuyyeppyp.supabase.co"
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZW56YWxkd3hlanV5eWVwcHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTAwODgsImV4cCI6MjA4NDQ4NjA4OH0.MKWunjeuxDrVor09ImwL-QsCXfkErCwKO_4JHybJpUU";
    supabase = createClient(supabaseURL, supabaseKey);
    console.log("I made it here")


    const insertAssignmentBtn = document.getElementById("insertAssignmentBtn");

    insertAssignmentBtn?.addEventListener("click", async () => {
        // 1. Disable the button and optionally change the text
        insertAssignmentBtn.disabled = true;
        const originalText = insertAssignmentBtn.innerText;
        insertAssignmentBtn.innerText = "Saving...";

        const title = document.getElementById("title").value;
        const subject = document.getElementById("subject").value;
        const description = document.getElementById('description').value;
        const dueDate = document.getElementById("dueDate").value;
        const selectedColor = document.getElementById('selectedColor').value;
        const taskType = document.getElementById("taskType").value;

        try {
            const { data: userData } = await supabase.auth.getUser();
            const userID = userData.user.id;

            const { error: insertError } = await supabase
                .from("Assignments")
                .insert([
                    {
                        title: title,
                        subject: subject,
                        description: description,
                        due_date: dueDate,
                        user_id: userID,
                        type: taskType,
                        color: selectedColor
                    }
                ]);

            if (insertError) {
                console.error(insertError);
                // 2. Re-enable if there is an error so they can try again
                insertAssignmentBtn.disabled = false;
                insertAssignmentBtn.innerText = originalText;
            } else {
                window.location.href = 'assignments.html';
            }
        } catch (err) {
            console.error("System error:", err);
            // Re-enable on system crash
            insertAssignmentBtn.disabled = false;
            insertAssignmentBtn.innerText = originalText;
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