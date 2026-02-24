const{createClient} = window.supabase;
const supabaseURL = "https://pjenzaldwxejuyyeppyp.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZW56YWxkd3hlanV5eWVwcHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTAwODgsImV4cCI6MjA4NDQ4NjA4OH0.MKWunjeuxDrVor09ImwL-QsCXfkErCwKO_4JHybJpUU";
supabase = createClient(supabaseURL, supabaseKey);
console.log("I made it here")

/*async function addAssignment(t, s, d) {
    // 1. Get the currently logged-in user
    const {data: userData, error: userErr} = await supabase.auth.getUser();
    if(userErr || !userData?.user){
        console.log("No active session or failed to get user", userErr);
        return;
    }
    const userID = userData.user.id; // <- this grabs the unique user id
    console.log("Unique user ID: ", userID);
        // 2. Insert the assignment with the user's ID
        const { error } = await supabase
            .from('Assignments')
            .insert([
                {
                    title: t,
                    subject: s,
                    due_date: d,
                    user_id: userID.id // Links it to the current user
                }
            ]);

        if (error) {
            console.error('Error adding assignment:', error);
        } else {
            console.log('Assignment saved successfully!');
            window.location.href = 'assignments.html';
        }
}*/

const insertAssignmentBtn = document.getElementById("insertAssignmentBtn");

insertAssignmentBtn?.addEventListener("click", async () => {
    // 1. Get input values
    const title = document.getElementById("title").value;
    const subject = document.getElementById("subject").value;
    const dueDate = document.getElementById("dueDate").value;
    const errorDisplay = document.getElementById("error-msg");

    // 2. Get the current user
    const { data: userData, error: userErr } = await supabase.auth.getUser();

    if (userErr || !userData?.user) {
        console.error("User not authenticated:", userErr);
        errorDisplay.textContent = "You must be logged in to add assignments.";
        return;
    }

    const userID = userData.user.id;

    // 3. Insert into Supabase
    // We include user_id so the assignment is linked to the person who created it
    const { error: insertError } = await supabase
        .from("Assignments")
        .insert([
            {
                title: title,
                subject: subject,
                due_date: dueDate,
                user_id: userID // Make sure this column name matches your DB
            }
        ]);

    // 4. Handle the result
    if (insertError) {
        console.log("Full Error Object:", insertError);
        // Look for "message", "details", or "hint" in the console
        errorDisplay.textContent = insertError.message;
    } else {
        // Success! Redirect the user
        window.location.href = 'assignments.html';
    }
});



// Run the function when the page loads