const NUM_BUTTONS = 4; // Change this to 2–6
const exclusiveMode = document.getElementById("exclusiveToggle");
const buttonsDiv = document.getElementById("buttons");
const statsDiv = document.getElementById("stats");

let timers = Array(NUM_BUTTONS).fill(0);
let active = Array(NUM_BUTTONS).fill(false);
let startTimes = Array(NUM_BUTTONS).fill(null);
let history = [];

function createButtons() {
  for (let i = 0; i < NUM_BUTTONS; i++) {
    const btn = document.createElement("button");
    btn.textContent = `Speaker ${i + 1}`;
    btn.dataset.index = i;
    btn.onclick = toggleTimer;
    buttonsDiv.appendChild(btn);
  }
}

function toggleTimer(e) {
  const i = parseInt(e.target.dataset.index);

  if (exclusiveMode.checked) {
    stopAllTimers();
  }

  if (active[i]) {
    // Stop timer
    timers[i] += Date.now() - startTimes[i];
    active[i] = false;
    startTimes[i] = null;
    history.push({ index: i, time: Date.now(), action: "stop" });
  } else {
    // Start timer
    active[i] = true;
    startTimes[i] = Date.now();
    history.push({ index: i, time: Date.now(), action: "start" });
  }

  updateStats();
}

function stopAllTimers() {
  for (let i = 0; i < NUM_BUTTONS; i++) {
    if (active[i]) {
      timers[i] += Date.now() - startTimes[i];
      active[i] = false;
      startTimes[i] = null;
      history.push({ index: i, time: Date.now(), action: "stop" });
    }
  }
}

function updateStats() {
  const total = timers.reduce((a, b) => a + b, 0);
  statsDiv.innerHTML = "<h2>Stats</h2>";
  timers.forEach((t, i) => {
    const percent = total ? ((t / total) * 100).toFixed(1) : 0;
    statsDiv.innerHTML += `Speaker ${i + 1}: ${percent}%<br>`;
  });
}

createButtons();