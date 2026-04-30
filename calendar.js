const{createClient} = window.supabase;
const supabaseURL = "https://pjenzaldwxejuyyeppyp.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZW56YWxkd3hlanV5eWVwcHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTAwODgsImV4cCI6MjA4NDQ4NjA4OH0.MKWunjeuxDrVor09ImwL-QsCXfkErCwKO_4JHybJpUU";
supabase = createClient(supabaseURL, supabaseKey);
console.log("I made it here")

let allAssignments = [];

async function loadCalendarTasks() {
    const { data, error } = await supabase
        .from('Assignments')
        .select('*');

    if (!error) {
        allAssignments = data;
        renderCalendar();

        // --- ADD THIS SECTION ---
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // Automatically load today's tasks into the sidebar
        showTasksForDay(todayStr);
        // ------------------------
    }
}

// Replace your initial renderCalendar() call with this:
loadCalendarTasks();

function showTasksForDay(dateStr) {
    const sidebarList = document.getElementById("day-assignment-list");
    const sidebarTitle = document.getElementById("selected-date-title");

    sidebarTitle.innerText = `Due: ${dateStr}`;
    const tasks = allAssignments.filter(a => a.due_date === dateStr);
    sidebarList.innerHTML = "";

    if (tasks.length > 0) {
        tasks.forEach(task => {
            const li = document.createElement("li");
            li.className = "list-group-item bg-transparent border-bottom py-3 px-0";

            const strikeClass = task.completed ? "text-decoration-line-through text-muted" : "";
            const btnText = task.completed ? "Undo" : "Done";
            const btnClass = task.completed ? "btn-outline-secondary" : "btn-bd-primary";
            const indicatorColor = task.color || "#25bff1";

            li.innerHTML = `
        <div class="d-flex align-items-start gap-3 w-100">
            <div class="mt-2 color-indicator" style="width: 12px; height: 12px; border-radius: 50%; background-color: ${task.completed ? '#d3d3d3' : indicatorColor}; flex-shrink: 0;"></div>
            
            <div class="flex-grow-1" style="min-width: 0;">
                <div class="d-flex justify-content-between align-items-center mb-1 gap-2">
                    <span class="task-title-text fw-bold ${strikeClass}" title="${task.title}" style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${task.title}
                    </span>
                    <small class="text-muted fw-bold type-label flex-shrink-0" style="font-size: 0.7rem; text-transform: uppercase;">
                        ${task.type}
                    </small>
                </div>
                
                <div class="d-flex justify-content-between align-items-center gap-2">
                    <span class="text-muted small" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${task.subject}
                    </span>
                    <button class="btn btn-sm ${btnClass} py-0 px-3 toggle-btn flex-shrink-0" style="border-radius: 20px; font-size: 0.75rem; height: 24px;">
                        ${btnText}
                    </button>
                </div>
            </div>
        </div>
    `;

            const btn = li.querySelector(".toggle-btn");
            const titleSpan = li.querySelector(".task-title-text");
            const indicator = li.querySelector(".color-indicator");

            btn.addEventListener("click", async () => {
                // Toggle the state
                task.completed = !task.completed;

                // VISUAL TRANSITION LOGIC
                if (task.completed) {
                    titleSpan.classList.add("text-decoration-line-through", "text-muted");
                    indicator.style.backgroundColor = "#d3d3d3"; // Turn dot grey
                    btn.innerText = "Undo";
                    btn.className = "btn btn-sm btn-outline-secondary py-0 px-3 toggle-btn";
                } else {
                    titleSpan.classList.remove("text-decoration-line-through", "text-muted");
                    indicator.style.backgroundColor = indicatorColor; // Restore dot color
                    btn.innerText = "Done";
                    btn.className = "btn btn-sm btn-bd-primary py-0 px-3 toggle-btn";
                }

                // 1. Sync with Supabase
                const { error } = await supabase
                    .from('Assignments')
                    .update({ completed: task.completed })
                    .eq('id', task.id);

                if (error) console.error("Sync Error:", error);

                // 2. Refresh the Calendar dots immediately
                if (typeof renderCalendar === "function") {
                    renderCalendar();
                }
            });

            sidebarList.appendChild(li);
        });
    } else {
        sidebarList.innerHTML = '<div class="py-4 text-center text-muted">No assignments due today.</div>';
    }
}



const daysTag = document.querySelector(".days"),
    currentDate = document.querySelector(".current-date"),
    prevNextIcon = document.querySelectorAll(".icons span");
// getting new date, current year and month
let date = new Date(),
    currYear = date.getFullYear(),
    currMonth = date.getMonth();
// storing full name of all months in array
const months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

const typeColors = {
    "Homework": "#d1bc00",
    "Quiz": "#ffa500",
    "Test": "#ff4d4d",
    "Project": "#0099cc",
    "Other": "#6c757d"
};

const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(), // getting first day of month
        lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(), // getting last date of month
        lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(), // getting last day of month
        lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); // getting last date of previous month
    let liTag = "";
    for (let i = firstDayofMonth; i > 0; i--) { // creating li of previous month last days
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }
    for (let i = 1; i <= lastDateofMonth; i++) {
        // 1. Format the date string (YYYY-MM-DD)
        const dateString = `${currYear}-${String(currMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        // 2. Filter assignments for this day
        const dayAssignments = allAssignments.filter(asm => asm.due_date === dateString);

        let assignmentDots = "";
        dayAssignments.forEach(asm => {
            // DEBUG: Look at the console to see what the 'asm' object actually contains
            console.log("Full Assignment Object:", asm);
            console.log("What is asm.type?", asm.type);

            const typeColors = {
                "Homework": "#d1bc00",
                "Quiz": "#ffa500",
                "Test": "#ff4d4d",
                "Project": "#0099cc",
                "Other": "#6c757d"
            };

            // Use a variable that checks both possible cases (case sensitivity)
            // or defaults to a visible color if something is wrong
            let taskType = asm.type || "Other";

            // Attempt to match
            let dotColor = typeColors[taskType];

            // If still undefined, it might be a casing issue (e.g., "homework" vs "Homework")
            if (!dotColor) {
                // Try to match lowercase if the first attempt failed
                const lowerType = taskType.toLowerCase();
                const foundKey = Object.keys(typeColors).find(key => key.toLowerCase() === lowerType);
                dotColor = typeColors[foundKey] || "#25bff1"; // Brand blue as the final safety net
            }

            const finalColor = asm.completed ? "#ccc" : dotColor;

            assignmentDots += `<span class="dot" style="background-color: ${finalColor} !important;"></span>`;
        });

        // 3. Check if it's today
        let isToday = i === date.getDate() && currMonth === new Date().getMonth()
        && currYear === new Date().getFullYear() ? "active" : "";

        // 4. Build the final <li>
        liTag += `<li class="${isToday}" data-date="${dateString}" onclick="showTasksForDay('${dateString}')">
                    <span class="day-number">${i}</span>
                    <div class="task-dots">${assignmentDots}</div>
                  </li>`;
    }
    for (let i = lastDayofMonth; i < 6; i++) { // creating li of next month first days
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`
    }
    currentDate.innerText = `${months[currMonth]} ${currYear}`; // passing current mon and yr as currentDate text
    daysTag.innerHTML = liTag;
}
renderCalendar();
prevNextIcon.forEach(icon => { // getting prev and next icons
    icon.addEventListener("click", () => { // adding click event on both icons
        // if clicked icon is previous icon then decrement current month by 1 else increment it by 1
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;
        if(currMonth < 0 || currMonth > 11) { // if current month is less than 0 or greater than 11
            // creating a new date of current year & month and pass it as date value
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear(); // updating current year with new date year
            currMonth = date.getMonth(); // updating current month with new date month
        } else {
            date = new Date(); // pass the current date as date value
        }
        renderCalendar(); // calling renderCalendar function
    });
});

const todayBtn = document.querySelector(".today-btn");

todayBtn.addEventListener("click", () => {
    const now = new Date();
    currYear = now.getFullYear();
    currMonth = now.getMonth();

    // Re-render the calendar to show the current month
    renderCalendar();

    // Update the sidebar to show today's tasks
    const todayStr = now.toISOString().split('T')[0];
    showTasksForDay(todayStr);
});

const getLocalSquadDate = (dateObj) => {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
};

// Use it in your Today button:
todayBtn.addEventListener("click", () => {
    const now = new Date();
    currYear = now.getFullYear();
    currMonth = now.getMonth();
    renderCalendar();

    const todayStr = getLocalSquadDate(now); // Use helper
    showTasksForDay(todayStr);
});