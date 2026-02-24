//initalize Supabase
const{createClient} = window.supabase;
const supabaseURL = "https://pjenzaldwxejuyyeppyp.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZW56YWxkd3hlanV5eWVwcHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTAwODgsImV4cCI6MjA4NDQ4NjA4OH0.MKWunjeuxDrVor09ImwL-QsCXfkErCwKO_4JHybJpUU";
supabase = createClient(supabaseURL, supabaseKey);
console.log("I made it here")

//login
const loginBtn = document.getElementById("loginBtn");
loginBtn?.addEventListener("click", async() => {
    console.log("Log in clicked")
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const{error, session} = await supabase.auth.signInWithPassword({email, password});

    if(error){
        document.getElementById("error-msg").textContent = error.message;
    } else {
        window.location.href = 'display.html';
    }
});

const signupBtn = document.getElementById("signupBtn");
//add the click listener to the signup button
signupBtn?.addEventListener("click", async() => {
    //grab the info from the signup page and store it
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const city = document.getElementById("city").value;
    const{signupError, user} = await supabase.auth.signUp({email, password});
    //console.log the error
    if(signupError){
        document.getElementById("error-msg").textContent = signupError.message;
    } else {
        const {insertError} = await supabase.from("PlannrInfo").insert([{
            first_name: firstName, last_name: lastName, city: city, email: email, streak: 0
        }]);

        if (insertError) {
            document.getElementById("error-msg").textContent = insertError.message;
        } else {
            window.location.href = 'display.html';
        }
    }
})


const updateBtn = document.getElementById("updateBtn");
updateBtn?.addEventListener("click", async() => {
    const newFirstName = document.getElementById("newFirstName").value;
    const newLastName = document.getElementById("newLastName").value;
    const newCity = document.getElementById("newCity").value;

    const {data: userData, error: userErr} = await supabase.auth.getUser();
    if(userErr || !userData?.user){
        console.log("No active session or failed to get user", userErr);
        return;
    }
    const userID = userData.user.id; // <- this grabs the unique user id
    console.log("Unique user ID: ", userID);

    const {updateError} = await supabase.from("PlannrInfo").update([{
            first_name: newFirstName, last_name: newLastName, city: newCity
        }]).eq('id', userID)
    ;

    if (updateError) {
        document.getElementById("error-msg").textContent = updateError.message;
    } else {
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