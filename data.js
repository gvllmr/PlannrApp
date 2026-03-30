//import { createClient} from 'npm:@supabase/supabase-js@2'
//initialize supabase
const{createClient} = window.supabase;
const supabaseURL = "https://pjenzaldwxejuyyeppyp.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZW56YWxkd3hlanV5eWVwcHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTAwODgsImV4cCI6MjA4NDQ4NjA4OH0.MKWunjeuxDrVor09ImwL-QsCXfkErCwKO_4JHybJpUU";
supabase = createClient(supabaseURL, supabaseAnonKey);
//fetch and display user data
const profileDataDiv = document.getElementById("profile-data");
const name = document.getElementById("username");
let session = null;


//get the current open session from supabase
async function getSession(){
    session = await supabase.auth.getSession();
    return session;

}

//call the async get Session function

getSession().then(session => {
    console.log(session);
}).catch(error => {
    console.log('Error fetching session: ' , error);
});

//grabs the current user and then gets out data from supabase
async function getUserProfile(users){
    const{data: {user}} = await supabase.auth.getUser();
    console.log('Auth Event ', user);
    const{data: userProfile, error} = await supabase.from('PlannrInfo').select('*').eq('id', users);
    console.log('Auth Event:', userProfile);
    if(error){
        console.log('Error fetching user data: ', error);
        return null;
    }

    return userProfile;
}

//get everything and put it on the page
async function fetchProfile(){
    const {data:userData, error: userErr} = await supabase.auth.getUser();
    if (userErr || !userData?.user){
        console.log('No active session or failed to get user.', userErr);
        return;
    }
    const userId = userData.user.id; // <-- this grabs the unique user id
    console.log('Unique user ID: ', userId);
    const {data: userProfile, error} = await supabase
        .from('PlannrInfo')
        .select('first_name, last_name, city, email, streak')
        .eq('id', userId)
        .maybeSingle();
    if(userProfile){
        profileDataDiv.innerHTML = `<p><strong> Hello, </strong> ${userProfile.first_name ?? ''}</p>` +
            `<p><strong> Email:</strong> ${userProfile.email ?? ''}</p>`;

    }else{
        profileDataDiv.innerHTML = '<p> Profile data not found. </p>';
    }
}


fetchProfile().catch((error) =>{
    console.log(error)
})

async function loadDashboardNotifications() {
    const alertContainer = document.getElementById("urgent-alerts");

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 2. Fetch uncompleted assignments
    const { data: assignments, error } = await supabase
        .from("Assignments")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", false);

    if (error || !assignments) {
        alertContainer.innerHTML = "<p>Could not load alerts.</p>";
        return;
    }

    // 3. Filter for "Due Soon" (Next 48 Hours)
    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + (48 * 60 * 60 * 1000));

    const upcoming = assignments.filter(task => {
        const dueDate = new Date(task.due_date);
        return dueDate >= now && dueDate <= fortyEightHoursFromNow;
    });

    // 4. Render Notifications
    if (upcoming.length === 0) {
        alertContainer.innerHTML = `
            <div class="alert alert-success">
                🎉 High five! No assignments due in the next 48 hours.
            </div>`;
    } else {
        alertContainer.innerHTML = ""; // Clear loader
        upcoming.forEach(task => {
            const alertDiv = document.createElement("div");
            alertDiv.className = "alert alert-warning d-flex justify-content-between align-items-center shadow-sm";
            alertDiv.innerHTML = `
                <div>
                    <strong>⚠️ Upcoming ${task.type}:</strong> ${task.title} 
                    <br><small class="text-muted">Due: ${task.due_date}</small>
                </div>
                <a href="assignments.html" class="btn btn-sm btn-outline-dark">View</a>
            `;
            alertContainer.appendChild(alertDiv);
        });
    }
}

// Run on page load
loadDashboardNotifications();

async function getUpcomingAlerts() {
    const alertBox = document.getElementById("urgent-alerts");
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch only incomplete tasks
    const { data: assignments } = await supabase
        .from("Assignments")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", false);

    const now = new Date();
    const fortyEightHours = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

    const dueSoon = assignments.filter(task => {
        const dueDate = new Date(task.due_date);
        const timeDiff = dueDate - now;
        return timeDiff > 0 && timeDiff <= fortyEightHours;
    });

    if (dueSoon.length === 0) {
        alertBox.innerHTML = "<p class='text-success mb-0'>✅ All caught up! No urgent deadlines.</p>";
        return;
    }

    alertBox.innerHTML = dueSoon.map(task => `
        <div class="alert alert-warning py-2 mb-2 d-flex justify-content-between align-items-center">
            <span><strong>${task.type}:</strong> ${task.title}</span>
            <span class="badge bg-dark">${task.due_date}</span>
        </div>
    `).join('');
}

document.addEventListener("DOMContentLoaded", async () => {
    // 1. First, make sure we have a user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // 2. Call your notification function
        getUpcomingAlerts();

        // 3. Call your other dashboard functions (Profile, Streak, etc.)
        fetchProfile();
    } else {
        // Optional: Redirect to login if no user is found
        window.location.href = "logout.html";
    }
});