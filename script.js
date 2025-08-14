const NUM_SPEAKERS = 4; // Adjust as needed
const exclusiveToggle = document.getElementById("exclusiveToggle");
const buttonsDiv = document.getElementById("buttons");
const statsDiv = document.getElementById("stats");

let timers = Array(NUM_SPEAKERS).fill(0);
let active = Array(NUM_SPEAKERS).fill(false);
let startTimes = Array(NUM_SPEAKERS).fill(null);
let buttons = [];
let eventLog = []; // JSON-style history

function formatTime(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function createButtons() {
  for (let i = 0; i < NUM_SPEAKERS; i++) {
    const btn = document.createElement("button");
    btn.dataset.index = i;
    btn.classList.add("inactive");
    buttons.push(btn);
    buttonsDiv.appendChild(btn);
  }
  updateButtonLabels();
}

function toggleTimer(e) {
  const i = parseInt(e.target.dataset.index);

  if (exclusiveToggle.checked) {
    stopAllTimers();
  }

  if (active[i]) {
    // Stop timer
    timers[i] += Date.now() - startTimes[i];
    active[i] = false;
    startTimes[i] = null;
    eventLog.push({ speaker: i, action: "stop", timestamp: Date.now() });
  } else {
    // Start timer
    active[i] = true;
    startTimes[i] = Date.now();
    eventLog.push({ speaker: i, action: "start", timestamp: Date.now() });
  }
updateChart();
  updateStats();
  updateButtonLabels();
}

function stopAllTimers() {
  for (let i = 0; i < NUM_SPEAKERS; i++) {
    if (active[i]) {
      timers[i] += Date.now() - startTimes[i];
      active[i] = false;
      startTimes[i] = null;
      eventLog.push({ speaker: i, action: "stop", timestamp: Date.now() });
    }
  }
  updateChart();
}

function updateStats() {
  const total = timers.reduce((a, b) => a + b, 0);
  statsDiv.innerHTML = "<h2>Stats</h2>";
  timers.forEach((t, i) => {
    const percent = total ? ((t / total) * 100).toFixed(1) : 0;
    statsDiv.innerHTML += `Speaker ${i + 1}: ${percent}%<br>`;
  });
}

function updateButtonLabels() {
  for (let i = 0; i < NUM_SPEAKERS; i++) {
    let elapsed = timers[i];
    if (active[i]) {
      elapsed += Date.now() - startTimes[i];
    }
    buttons[i].textContent = `Speaker ${i + 1} – ${formatTime(elapsed)}`;
    buttons[i].className = active[i] ? "active" : "inactive";
  }
}

// Update button labels every second
setInterval(updateButtonLabels, 1000);

createButtons();

const ctx = document.getElementById("timelineChart").getContext("2d");

let timelineChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [], // timestamps
    datasets: Array(NUM_SPEAKERS).fill().map((_, i) => ({
      label: `Speaker ${i + 1}`,
      data: [],
      backgroundColor: `hsl(${i * 60}, 70%, 50%)`,
      stack: "speakers"
    }))
  },
  options: {
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute"
        },
        title: {
          display: true,
          text: "Time"
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: "Speaking"
        },
        ticks: {
          callback: () => ""
        }
      }
    }
  }
});
function updateChart() {
  // Clear previous data
  timelineChart.data.labels = [];
  timelineChart.data.datasets.forEach(ds => ds.data = []);

  for (let i = 0; i < eventLog.length - 1; i++) {
    const e1 = eventLog[i];
    const e2 = eventLog[i + 1];

    if (e1.action === "start" && e2.action === "stop" && e1.speaker === e2.speaker) {
      const start = new Date(e1.timestamp);
      const end = new Date(e2.timestamp);
      timelineChart.data.labels.push(start);

      timelineChart.data.datasets[e1.speaker].data.push({
        x: start,
        y: 1,
        x2: end
      });
    }
  }

  timelineChart.update();
}