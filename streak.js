// Ensure your 'supabase' client is initialized before this script runs
const StreakManager = {
    // We don't define streakCountEl at the top anymore.
    // We fetch it inside the functions to ensure the DOM is ready.

    async handleTaskCompletion(userId) {
        console.log("Step 1: Function triggered for ID:", userId);
        const today = new Date().toLocaleDateString('en-CA');

        try {
            // 1. Fetch current data
            const { data: info, error: fetchError } = await supabase
                .from('PlannrInfo')
                .select('streak, last_update')
                .eq('id', userId)
                .maybeSingle();

            if (fetchError) throw fetchError;
            console.log("Step 2: Current DB Data:", info);

            let currentStreak = info?.streak || 0;
            let lastUpdate = info?.last_update || null;

            // 2. Logic Check
            if (lastUpdate === today) {
                console.log("Step 3: User already completed a task today. No increase needed.");
                return;
            }

            currentStreak++;
            console.log("Step 3: New calculated streak:", currentStreak);

            // 3. The Save Operation
            const { error: upsertError } = await supabase
                .from('PlannrInfo')
                .upsert({
                    id: userId,
                    streak: currentStreak,
                    last_update: today
                }, { onConflict: 'id' }); // Explicitly tell Supabase to match on 'id'

            if (upsertError) throw upsertError;

            console.log("Step 4: Save successful!");
            this.updateUI(currentStreak, today);

        } catch (err) {
            console.error("STREAK FAILURE:", err.message);
            alert("Database Error: " + err.message); // This will pop up if Supabase rejects the save
        }
    },

    async checkForReset(userId) {
        const { data: info } = await supabase
            .from('PlannrInfo')
            .select('last_update, streak')
            .eq('id', userId)
            .maybeSingle();

        if (!info?.last_update || info.streak === 0) return;

        const lastDate = new Date(info.last_update + 'T00:00:00'); // Ensure local time parsing
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        lastDate.setHours(0, 0, 0, 0);

        const diffTime = today - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // If more than 1 day has passed, reset
        if (diffDays > 1) {
            await supabase
                .from('PlannrInfo')
                .update({ streak: 0 })
                .eq('id', userId);
            return true; // Indicates a reset happened
        }
        return false;
    },

    updateUI(streak, lastUpdate) {
        // Fetching elements locally so they are never null when the function runs
        const streakCountEl = document.getElementById('streak-count');
        const streakStatusEl = document.getElementById('streak-status');
        const streakDisplay = document.getElementById('streak-display');
        const today = new Date().toLocaleDateString('en-CA');

        if (streakCountEl) streakCountEl.textContent = streak ?? 0;

        if (streakStatusEl) {
            if (lastUpdate === today) {
                streakStatusEl.textContent = "Today's goal met!";
                streakStatusEl.className = "text-success small fw-bold";
                if (streakDisplay) streakDisplay.style.opacity = "1";
            } else {
                streakStatusEl.textContent = "Complete a task to keep your streak!";
                streakStatusEl.className = "text-warning small fw-bold";
                if (streakDisplay) streakDisplay.style.opacity = "0.5";
            }
        }
    },

    async init() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Check for resets
        await this.checkForReset(user.id);

        // 2. Fetch fresh data
        const { data: info } = await supabase
            .from('PlannrInfo')
            .select('streak, last_update')
            .eq('id', user.id)
            .maybeSingle();

        // 3. Sync UI
        if (info) {
            this.updateUI(info.streak, info.last_update);
        }

        // 4. Attach event listener to the button if it exists on THIS page
        const btn = document.getElementById('complete-task-btn');
        if (btn) {
            // Use an arrow function so 'this' still refers to StreakManager
            btn.onclick = () => this.handleTaskCompletion(user.id);
        }
    }
};

// Start the manager ONLY when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => StreakManager.init());
} else {
    StreakManager.init();
}