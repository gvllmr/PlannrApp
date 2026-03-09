const{createClient} = window.supabase;
const supabaseURL = "https://pjenzaldwxejuyyeppyp.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZW56YWxkd3hlanV5eWVwcHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTAwODgsImV4cCI6MjA4NDQ4NjA4OH0.MKWunjeuxDrVor09ImwL-QsCXfkErCwKO_4JHybJpUU";
supabase = createClient(supabaseURL, supabaseKey);
console.log("I made it here")


const insertAssignmentBtn = document.getElementById("insertAssignmentBtn");

insertAssignmentBtn?.addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    const subject = document.getElementById("subject").value;
    const dueDate = document.getElementById("dueDate").value;

    // 1. Capture the dropdown value
    const taskType = document.getElementById("taskType").value;

    const { data: userData } = await supabase.auth.getUser();
    const userID = userData.user.id;

    // 2. Add 'type' to your insert object
    const { error: insertError } = await supabase
        .from("Assignments")
        .insert([
            {
                title: title,
                subject: subject,
                due_date: dueDate,
                user_id: userID,
                type: taskType // Ensure this matches your column name
            }
        ]);

    if (insertError) {
        console.error(insertError);
    } else {
        window.location.href = 'assignments.html';
    }
});


// Run the function when the page loads