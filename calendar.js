const{createClient} = window.supabase;
const supabaseURL = "https://pjenzaldwxejuyyeppyp.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZW56YWxkd3hlanV5eWVwcHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTAwODgsImV4cCI6MjA4NDQ4NjA4OH0.MKWunjeuxDrVor09ImwL-QsCXfkErCwKO_4JHybJpUU";
supabase = createClient(supabaseURL, supabaseKey);
console.log("I made it here")

let allAssignments = [];

async function loadCalendarTasks() {
    const { data, error } = await supabase
        .from('Assignments')
        .select('id, title, due_date, completed');

    if (!error) {
        allAssignments = data;
        renderCalendar(); // Only render after data is loaded
    }
}

// Replace your initial renderCalendar() call with this:
loadCalendarTasks();

function showTasksForDay(dateStr) {
    const sidebarList = document.getElementById("day-assignment-list");
    const sidebarTitle = document.getElementById("selected-date-title");

    // Update the title to show which date is selected
    sidebarTitle.innerText = `Assignments for ${dateStr}`;

    // Filter assignments for the selected date
    const tasks = allAssignments.filter(a => a.due_date === dateStr);

    // Clear the current list
    sidebarList.innerHTML = "";

    if (tasks.length > 0) {
        tasks.forEach(task => {
            const li = document.createElement("li");
            li.className = `sidebar-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <span>${task.title}</span>
                <small>${task.completed ? '✓ Done' : '○ Pending'}</small>
            `;
            sidebarList.appendChild(li);
        });
    } else {
        sidebarList.innerHTML = "<li>No assignments due today.</li>";
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
const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(), // getting first day of month
        lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(), // getting last date of month
        lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(), // getting last day of month
        lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); // getting last date of previous month
    let liTag = "";
    for (let i = firstDayofMonth; i > 0; i--) { // creating li of previous month last days
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }
    for (let i = 1; i <= lastDateofMonth; i++) { // creating li of all days of current month
        /*// adding active class to li if the current day, month, and year matched
        let isToday = i === date.getDate() && currMonth === new Date().getMonth()
        && currYear === new Date().getFullYear() ? "active" : "";
        liTag += `<li class="${isToday}">${i}</li>`;*/
        // 1. Format the date string to match your Supabase format (YYYY-MM-DD)
        const dateString = `${currYear}-${String(currMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        // 2. Check for assignments on this day
        const dayAssignments = allAssignments.filter(asm => asm.due_date === dateString);
        let assignmentDots = "";
        dayAssignments.forEach(asm => {
            const dotClass = asm.completed ? "dot completed" : "dot";
            assignmentDots += `<span class="${dotClass}"></span>`;
        });

        // 3. Check if it's today
        let isToday = i === date.getDate() && currMonth === new Date().getMonth()
        && currYear === new Date().getFullYear() ? "active" : "";

        // 4. ADD DATA ATTRIBUTE AND CLICK LISTENER HERE
        liTag += `<li class="${isToday}" data-date="${dateString}" onclick="showTasksForDay('${dateString}')">
                ${i}
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
