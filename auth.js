//initalize Supabase
const{createClient} = window.supabase;
const supabaseURL = "https://pjenzaldwxejuyyeppyp.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZW56YWxkd3hlanV5eWVwcHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTAwODgsImV4cCI6MjA4NDQ4NjA4OH0.MKWunjeuxDrVor09ImwL-QsCXfkErCwKO_4JHybJpUU";
supabase = createClient(supabaseURL, supabaseKey);
console.log("I made it here")

//login
const loginBtn = document.getElementById("loginBtn");
loginBtn?.addEventListener("click", async(e) => {
    e.preventDefault();
    console.log("Log in clicked")
    const email = document.getElementById("floatingInput").value;
    const password = document.getElementById("floatingPassword").value;
    const{error, session} = await supabase.auth.signInWithPassword({email, password});

    if(error){
        document.getElementById("error-msg").textContent = error.message;
    } else {
        window.location.href = 'display.html';
    }
});

const signupBtn = document.getElementById("signupBtn");
signupBtn?.addEventListener("click", async (d) => {
    d.preventDefault();
    const errorDisplay = document.getElementById("error-msg");

    const email = document.getElementById("floatingInput").value.trim();
    const password = document.getElementById("floatingPassword").value;
    const firstName = document.getElementById("floatingFirstName").value.trim();
    const lastName = document.getElementById("floatingLastName").value.trim();

    // --- VALIDATION START ---
    if (!email || !password || !firstName || !lastName) {
        errorDisplay.textContent = "All fields are required.";
        return;
    }

    // Basic Email Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorDisplay.textContent = "Please enter a valid email address.";
        return;
    }

    if (password.length < 6) {
        errorDisplay.textContent = "Password must be at least 6 characters long.";
        return;
    }

    if (firstName.length > 50 || lastName.length > 50) {
        errorDisplay.textContent = "Names must be under 50 characters.";
        return;
    }
    // --- VALIDATION END ---

    errorDisplay.textContent = ""; // Clear errors

    const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (signupError) {
        errorDisplay.textContent = signupError.message;
        return;
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
        errorDisplay.textContent = "Email already registered. Please log in.";
        return;
    }

    // Use an object {}, not an array [{}], for single inserts/updates
    const { error: insertError } = await supabase.from("PlannrInfo").insert({
        id: data.user.id, // Good practice: ensure the ID matches the Auth ID
        first_name: firstName,
        last_name: lastName,
        email: email,
        streak: 0
    });

    if (insertError) {
        errorDisplay.textContent = insertError.message;
    } else {
        window.location.href = 'display.html';
    }
});


const updateBtn = document.getElementById("updateBtn");
updateBtn?.addEventListener("click", async() => {
    const newFirstName = document.getElementById("newFirstName").value.trim();
    const newLastName = document.getElementById("newLastName").value.trim();
    const errorDisplay = document.getElementById("error-msg");

    // --- VALIDATION START ---
    // 1. Check if empty
    if (!newFirstName || !newLastName) {
        errorDisplay.textContent = "Both fields are required.";
        return;
    }

    // 2. Check for length (e.g., max 50 characters)
    const maxLength = 50;
    if (newFirstName.length > maxLength || newLastName.length > maxLength) {
        errorDisplay.textContent = `Names cannot exceed ${maxLength} characters.`;
        return;
    }
    // --- VALIDATION END ---

    // If validation passes, proceed with the UI update and Supabase call
    updateBtn.disabled = true;
    updateBtn.innerText = "Updating...";
    errorDisplay.textContent = ""; // Clear previous errors

    const {data: userData, error: userErr} = await supabase.auth.getUser();
    if(userErr || !userData?.user){
        console.log("No active session or failed to get user", userErr);
        return;
    }
    const userID = userData.user.id; // <- this grabs the unique user id
    console.log("Unique user ID: ", userID);

    const {updateError} = await supabase.from("PlannrInfo").update([{
            first_name: newFirstName, last_name: newLastName
        }]).eq('id', userID)
    ;

    if (updateError) {
        document.getElementById("error-msg").textContent = updateError.message;
    } else {
        updateBtn.innerText = "Success!";
        setTimeout(() => { window.location.href = 'display.html'; }, 1000);
        window.location.href = 'display.html';
    }
})

const finishedBtn = document.getElementById("finishedBtn");
finishedBtn?.addEventListener("click", async() => {
    const {data: userData, error: userErr} = await supabase.auth.getUser();
    if(userErr || !userData?.user){
        console.log("No active session or failed to get user", userErr);
        return;
    }
    const userID = userData.user.id; // <- this grabs the unique user id
    console.log("Unique user ID: ", userID);
    const {updateError} = await supabase.from("PlannrInfo").update([{
        streak: userData.user.streak + 1
    }]).eq('id', userID)
    ;

    if (updateError) {
        document.getElementById("error-msg").textContent = updateError.message;
    } else {
        window.location.href = 'display.html';
    }

})