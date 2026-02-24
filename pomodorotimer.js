const startBtn = document.querySelector("#startbtn");
const stopBtn = document.querySelector("#pausebtn");
const resetBtn = document.querySelector("#resetbtn");
const progressbar = document.querySelector(".progressbar");
const progressbarNumber = document.querySelector(".progressbar .progressbar-number");
const pomodoroBtn = document.getElementById("pomodorobtn");
const shortbrkBtn = document.getElementById("shortbrkbtn");
const longbrkBtn = document.getElementById("longbrkbtn");
const pomCount = document.querySelector(".pomdoro-count");

let pomdoroCount = 0;
const pomodorountilLongbrk = 4;
const pomodorotimer = 1500; /* 25 minutes*/
const shortbreaktimer = 300; /* 5 minutes*/
const longbreaktimer = 900; /* 20 minutes*/
let timerValue = pomodorotimer;
let multipliervalue = 360 / timerValue;
let progressInterval;
let pomodoroType = "POMODORO";

startBtn.addEventListener("click", () => {
    startTimer();
    startBtn.disabled = true;
});
stopBtn.addEventListener("click", () => {
    pauseTimer();
    startBtn.disabled = false;
});
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
    resetTimer();
    startBtn.disabled = false;
});

function startTimer() {
    progressInterval = setInterval(() => {
        timerValue--;
        console.log(timerValue);
        setProgressInfo();
        if (timerValue === 0) {
            clearInterval(progressInterval);
            pomdoroCount++;
            pomCount.style.display = "block";
            pomCount.style.color = "white";
            pomCount.style.fontSize = "30px";
            pomCount.textContent = `Pomodoro Count ${pomdoroCount}`;
            if (pomdoroCount % pomodorountilLongbrk === 0) {
                longbrkBtn.style.display = "flex";
            }
            setTimeType(pomodoroType);
        }
    }, 1000);
}

function setProgressInfo() {
    progressbarNumber.textContent = `${FormatNumbertoString(timerValue)}`;
    progressbar.style.background = `conic-gradient(rgb(243, 72, 109) ${
        timerValue * multipliervalue
    }deg,crimson 0deg)`;
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
}

function setTimeType(type) {
    pomodoroType = type;
    if (type === "POMODORO") {
        pomodoroBtn.classList.add("active");
        shortbrkBtn.classList.remove("active");
        longbrkBtn.classList.remove("active");
    } else if (type === "SHORTBREAK") {
        pomodoroBtn.classList.remove("active");
        shortbrkBtn.classList.add("active");
        longbrkBtn.classList.remove("active");
    } else {
        pomodoroBtn.classList.remove("active");
        shortbrkBtn.classList.remove("active");
        longbrkBtn.classList.add("active");
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
