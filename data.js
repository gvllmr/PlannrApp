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