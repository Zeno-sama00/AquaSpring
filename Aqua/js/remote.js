import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  update,
  get,
  serverTimestamp,
  onValue
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7suhiWl51plHqP9vsIj1pYIcM2LhL1l4",
  authDomain: "aquaspring-548cc.firebaseapp.com",
  databaseURL: "https://aquaspring-548cc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aquaspring-548cc",
  storageBucket: "aquaspring-548cc.appspot.com",
  messagingSenderId: "748261447813",
  appId: "1:748261447813:web:f5d21e6d6341ab0c9731ec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM Elements
const pumpControlBtn = document.getElementById("pumpControlBtn");
const pumpState = document.getElementById("pumpState");
const timerSeconds = document.getElementById("timerSeconds");
const pumpTimer = document.getElementById("pumpTimer");
const updatesLog = document.getElementById("updatesLog");
const noProductionModal = document.getElementById("noProductionModal");

// System State
let pumpRunning = false;
let timerInterval;
let secondsRunning = 0;
let currentProductionId = null;

// ========================
// Core Functions
// ========================

/**
 * Shows modal when no active production exists
 */
function showNoProductionModal() {
  if (noProductionModal) {
    noProductionModal.style.display = "block";
    document.querySelector(".close-xd").onclick = () => {
      noProductionModal.style.display = "none";
    };
  }
}

/**
 * Finds or creates active production
 */
async function initializeProduction() {
  try {
    const productionsRef = ref(database, 'productions');
    const snapshot = await get(productionsRef);
    
    // Find first active production
    let activeProd = null;
    snapshot.forEach((child) => {
      if (child.val().status === "active") {
        activeProd = child.key;
      }
    });

    if (!activeProd) {
      showNoProductionModal();
      return false;
    }

    currentProductionId = activeProd;
    await initializeLogsStructure();
    return true;

  } catch (error) {
    console.error("Production init error:", error);
    return false;
  }
}

/**
 * Creates logs/day1 structure if missing
 */
async function initializeLogsStructure() {
  const logsRef = ref(database, `productions/${currentProductionId}/logs`);
  const logsSnapshot = await get(logsRef);

  if (!logsSnapshot.exists()) {
    await set(logsRef, {
      day1: {
        date: new Date().toLocaleDateString(),
        waterPump: {
          manual: {},
          auto: "none"
        }
      }
    });
  }
}

/**
 * Handles pump start/stop events
 */
async function handlePumpControl() {
  if (!currentProductionId && !await initializeProduction()) {
    return;
  }

  pumpRunning = !pumpRunning;
  const now = new Date();
  const timestamp = now.toLocaleString();

  // UI Updates
  pumpState.textContent = pumpRunning ? "ON" : "OFF";
  pumpState.className = pumpRunning ? "font-semibold text-green-500" : "font-semibold text-red-500";
  pumpControlBtn.querySelector(".button_top").textContent = pumpRunning ? "Stop Watering" : "Start Watering";

  // Timer Logic
  if (pumpRunning) {
    startTimer();
    await logWateringEvent("start", now);
  } else {
    stopTimer();
    await logWateringEvent("stop", now);
  }

  // Activity Log
  const logItem = document.createElement("li");
  logItem.textContent = `[${timestamp}] ${pumpRunning ? "Watering started" : `Watering stopped after ${secondsRunning}s`}`;
  updatesLog.appendChild(logItem);
  updatesLog.scrollTop = updatesLog.scrollHeight;
}

/**
 * Logs watering events to Firebase
 */
async function logWateringEvent(action, timestamp) {
  const dayKey = await getCurrentDayKey();
  const timeStr = timestamp.toTimeString().substring(0, 8); // HH:MM:SS

  if (action === "start") {
    const sessionsRef = ref(database, 
      `productions/${currentProductionId}/logs/${dayKey}/waterPump/manual`);
    
    const sessions = await get(sessionsRef);
    const newIndex = sessions.exists() ? Object.keys(sessions.val()).length : 0;
    
    await update(sessionsRef, {
      [newIndex]: {
        type: "manual",
        start: timeStr
      }
    });
  } 
  else {
    const sessionsRef = ref(database, 
      `productions/${currentProductionId}/logs/${dayKey}/waterPump/manual`);
    
    const sessions = await get(sessionsRef);
    const lastIndex = Object.keys(sessions.val()).length - 1;
    
    await update(ref(database, 
      `productions/${currentProductionId}/logs/${dayKey}/waterPump/manual/${lastIndex}`), {
      end: timeStr
    });
  }
}

/**
 * Gets current day key (day1, day2...)
 */
async function getCurrentDayKey() {
  const logsRef = ref(database, `productions/${currentProductionId}/logs`);
  const snapshot = await get(logsRef);
  return snapshot.exists() ? `day${Object.keys(snapshot.val()).length}` : "day1";
}

// ========================
// Timer Functions
// ========================

function startTimer() {
  secondsRunning = 0;
  updateTimerDisplay();
  pumpTimer.style.display = 'inline';
  timerInterval = setInterval(() => {
    secondsRunning++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  pumpTimer.style.display = 'none';
}

function updateTimerDisplay() {
  timerSeconds.textContent = secondsRunning;
}

// ========================
// Initialization
// ========================

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize production and logs
  await initializeProduction();

  // Set up pump control
  pumpControlBtn.addEventListener("click", handlePumpControl);

  // Load existing logs
  if (currentProductionId) {
    const logsRef = ref(database, `productions/${currentProductionId}/logs`);
    onValue(logsRef, (snapshot) => {
      console.log("Current logs:", snapshot.val());
    });
  }
});