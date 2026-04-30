const resetBtn = document.querySelector("#resetbtn");
const progressbarNumber = document.querySelector(".progressbar-number");
const pomodoroBtn = document.getElementById("pomodorobtn");
const shortbrkBtn = document.getElementById("shortbrkbtn");
const longbrkBtn = document.getElementById("longbrkbtn");
const pomCount = document.querySelector(".pomdoro-count");

const toggleBtn = document.getElementById('togglebtn');
let isRunning = false;

toggleBtn.classList.add('btn-start-style');

let pomdoroCount = 0;
const pomodorountilLongbrk = 4;
const pomodorotimer = 1500; /* 25 minutes = 1500*/
const shortbreaktimer = 300; /* 5 minutes*/
const longbreaktimer = 900; /* 20 minutes*/
let timerValue = pomodorotimer;
let multipliervalue = 360 / timerValue;
let progressInterval;
let pomodoroType = "POMODORO";

pomodoroBtn.addEventListener("click", () => {
    setTimeType("POMODORO");
});
shortbrkBtn.addEventListener("click", () => {
    setTimeType("SHORTBREAK");
});
longbrkBtn.addEventListener("click", () => {
    setTimeType("LONGBREAK");
});
resetBtn.addEventListener("click", () => {
    isRunning = false;
    toggleBtn.innerText = "Start";
    toggleBtn.classList.remove('btn-pause-style');
    toggleBtn.classList.add('btn-start-style');
    resetTimer();
});

toggleBtn.addEventListener('click', () => {
    isRunning = !isRunning;

    if (isRunning) {
        startTimer();
        toggleBtn.innerText = "Pause";
        // Remove ALL blue classes and add red
        toggleBtn.classList.remove('btn-primary', 'btn-start');
        toggleBtn.classList.add('btn-pause');
    } else {
        pauseTimer();
        toggleBtn.innerText = "Start";
        // Remove red class and add blue back
        toggleBtn.classList.remove('btn-pause');
        toggleBtn.classList.add('btn-start');
    }
});

function startTimer() {
    // Safety check: clear any existing interval before starting a new one
    clearInterval(progressInterval);

    progressInterval = setInterval(() => {
        timerValue--;
        setProgressInfo();

        if (timerValue <= 0) {
            clearInterval(progressInterval);
            isRunning = false; // Reset toggle state
            toggleBtn.innerText = "Start";
            toggleBtn.classList.replace('btn-pause-style', 'btn-start-style');

            handleTimerCompletion(); // Separate logic for clean code
        }
    }, 1000);
}

function setProgressInfo() {
    // Update the text in the h1
    progressbarNumber.textContent = `${FormatNumbertoString(timerValue)}`;

    // Logic for updating the title tag (browser tab) so you can see time while away
    document.title = `${FormatNumbertoString(timerValue)} - Plannr`;
}

function FormatNumbertoString(number) {
    const minutes = Math.trunc(number / 60).toString()
        .padStart(2, "0");
    const seconds = Math.trunc(number % 60).toString()
        .padStart(2, "0");
    return `${minutes}:${seconds}`;
}

function pauseTimer() {
    clearInterval(progressInterval);
    toggleBtn.classList.replace('btn-start-style', 'btn-pause-style');

}

function setTimeType(type) {
    pomodoroType = type;

    clearInterval(progressInterval);
    isRunning = false;
    toggleBtn.innerText = "Start";

    // UI Cleanup for Toggle Button
    toggleBtn.classList.remove('btn-pause', 'btn-pause-style');
    toggleBtn.classList.add('btn-start', 'btn-start-style');

    // Button Group Active States
    pomodoroBtn.classList.toggle("active", type === "POMODORO");
    shortbrkBtn.classList.toggle("active", type === "SHORTBREAK");
    longbrkBtn.classList.toggle("active", type === "LONGBREAK");

    // CRITICAL: If we are switching TO a long break,
    // we must ensure the button is visible.
    if (type === "LONGBREAK") {
        longbrkBtn.classList.remove('d-none');
    }

    resetTimer();
}

function resetTimer() {
    clearInterval(progressInterval);
    timerValue =
        pomodoroType === "POMODORO"
            ? pomodorotimer
            : pomodoroType === "SHORTBREAK"
                ? shortbreaktimer
                : longbreaktimer;
    multipliervalue = 360 / timerValue;
    setProgressInfo();
}

function handleTimerCompletion() {
    if (pomodoroType === "POMODORO") {
        pomdoroCount++;

        // Use a standard selector if pomCount isn't behaving
        if (pomCount) {
            pomCount.style.display = "block";
            pomCount.textContent = `Pomodoro Count: ${pomdoroCount}`;
        }

        if (pomdoroCount % pomodorountilLongbrk === 0) {
            // 1. Reveal the button
            longbrkBtn.classList.remove('d-none');
            longbrkBtn.style.display = "inline-block"; // Force display if d-none fails

            // 2. Switch to long break
            alert("Time for a long break!");
            setTimeType("LONGBREAK");
        } else {
            alert("Pomodoro finished! Take a short break.");
            setTimeType("SHORTBREAK");
        }
    } else {
        setTimeType("POMODORO");
    }
}