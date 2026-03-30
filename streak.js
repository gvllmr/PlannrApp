// Ensure your 'supabase' client is initialized before this script runs
let streak = 0;
let lastUpdate = null;

const streakCountEl = document.getElementById('streak-count');
const button = document.getElementById('complete-task-btn');

async function syncStreak() {
    try {
        // 1. Get the current logged-in user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error("User not logged in:", authError);
            return;
        }

        // 2. Fetch data from your specific table
        const { data, error } = await supabase
            .from('PlannrInfo')
            .select('streak, last_update')
            .eq('id', user.id) // Assuming 'id' is your Primary Key linked to Auth
            .single();

        if (error) {
            console.error("Error fetching PlannrInfo:", error.message);
            return;
        }

        if (data) {
            streak = data.streak || 0;
            lastUpdate = data.last_update;

            // Check if they missed a day
            await checkStreakReset(user.id);
            updateUI();
        }
    } catch (err) {
        console.error("Unexpected error in syncStreak:", err);
    }
}

async function checkStreakReset(userId) {
    if (!lastUpdate) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Safety check for date format
    const lastDate = new Date(lastUpdate + 'T00:00:00');
    lastDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays >= 2) {
        streak = 0;
        const { error } = await supabase
            .from('PlannrInfo')
            .update({ streak: 0 })
            .eq('id', userId);

        if (!error) alert("Streak reset to 0! You missed a day.");
    }
}

button.addEventListener('click', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please sign in first!");

    const todayStr = new Date().toISOString().split('T')[0];

    if (lastUpdate === todayStr) {
        alert("You've already studied today! Come back tomorrow to increase your streak.");
        return;
    }

    streak++;
    lastUpdate = todayStr;

    // Update Supabase
    const { error } = await supabase
        .from('PlannrInfo')
        .update({
            streak: streak,
            last_update: lastUpdate
        })
        .eq('id', user.id);

    if (error) {
        console.error("Update failed:", error.message);
        alert("Could not save streak. Check console.");
    } else {
        updateUI();
        alert("Great job! Streak updated.");
    }
    if (!error) {
        getUpcomingAlerts(); // Refresh alerts to remove the task they just finished!
    }
});

function updateUI() {
    if (streakCountEl) streakCountEl.textContent = streak;
}

syncStreak();