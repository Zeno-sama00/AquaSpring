import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  update,
  get,
  remove,
  child,
  serverTimestamp,
  onChildAdded
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7suhiWl51plHqP9vsIj1pYIcM2LhL1l4",
  authDomain: "aquaspring-548cc.firebaseapp.com",
  databaseURL: "https://aquaspring-548cc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aquaspring-548cc",
  storageBucket: "aquaspring-548cc.firebasestorage.app",
  messagingSenderId: "748261447813",
  appId: "1:748261447813:web:f5d21e6d6341ab0c9731ec",
  measurementId: "G-4E06WD4Y9P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startProduction');
  const endBtn = document.getElementById('endProduction');
  const prodStatus = document.getElementById('productionStatus');

  const startModal = document.getElementById('prodModal');
  const prodInput = document.getElementById('prodNameInput');
  const cancelStartBtn = document.getElementById('cancelProdBtn');
  const confirmStartBtn = document.getElementById('confirmProdBtn');

  const endModal = document.getElementById('endProdModal');
  const cancelEndBtn = document.getElementById('cancelEndBtn');
  const confirmEndBtn = document.getElementById('confirmEndBtn');

  const messageList = document.querySelector('.message-list');
  let currentProductionId = null;

  // Function to format the timestamp to readable time
  const formatReadableTime = (dateObj) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return `${dateObj.toLocaleDateString(undefined, options)} at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`;
  };

  // Function to get the formatted timestamp for logging
  const getFormattedTimestamp = () => {
    const now = new Date();
    return `[${now.toLocaleTimeString('en-US')}]`;
  };

  const logUpdate = async (message, timestamp = new Date().toISOString()) => {
    const updateRef = push(ref(database, 'updates')); 

    const conciseTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const formattedMessage = `[${conciseTime}] : ${message}`;
  
    await set(updateRef, {
      message: formattedMessage,
      timestamp
    });
  };
  

  // Append to message list without bolding "Production"
  const appendToMessageList = (message, timestamp) => {
    const li = document.createElement('li');
    const small = document.createElement('small');

    li.textContent = message + ' - ';
    small.textContent = formatReadableTime(new Date(timestamp)); // Format the time here too
    li.appendChild(small);
    messageList.prepend(li);
  };

  const listenForUpdates = () => {
    const updatesRef = ref(database, 'updates');
    onChildAdded(updatesRef, (snapshot) => {
      const { message, timestamp } = snapshot.val();
      appendToMessageList(message, timestamp);
    });
  };

  // 🔁 Check for active production on load
  async function checkActiveProduction() {
    const snapshot = await get(ref(database, 'activeProduction'));
    if (snapshot.exists()) {
      const activeProd = snapshot.val();
      currentProductionId = activeProd.id;

      const prodSnapshot = await get(ref(database, `productions/${currentProductionId}`));
      if (prodSnapshot.exists()) {
        const prodData = prodSnapshot.val();
        prodStatus.textContent = `Production Started: ${prodData.name}`;
        startBtn.disabled = true;
        endBtn.disabled = false;
      }
    }
  }

  // 🌱 Start Production
  startBtn.addEventListener('click', () => {
    startModal.style.display = 'flex';
    prodInput.focus();
  });

  cancelStartBtn.addEventListener('click', () => {
    startModal.style.display = 'none';
    prodInput.value = '';
  });

  confirmStartBtn.addEventListener('click', async () => {
    const prodName = prodInput.value.trim();
    if (!prodName) {
      alert('Please enter a production name');
      return;
    }

    const now = new Date();
    const startDate = now.toISOString();

    const newProdRef = push(ref(database, 'productions'));
    const prodId = newProdRef.key;

    await set(newProdRef, {
      name: prodName,
      startDate: startDate,
      status: "active"
    });

    await set(ref(database, 'activeProduction'), {
      id: prodId
    });

    prodStatus.textContent = `Production Started: ${prodName}`;
    currentProductionId = prodId;
    startBtn.disabled = true;
    endBtn.disabled = false;
    startModal.style.display = 'none';
    prodInput.value = '';

    logUpdate(`Production "${prodName}" has started`);
  });

  // 🔚 End Production
  endBtn.addEventListener('click', () => {
    endModal.style.display = 'flex';
  });

  cancelEndBtn.addEventListener('click', () => {
    endModal.style.display = 'none';
  });

  confirmEndBtn.addEventListener('click', async () => {
    if (!currentProductionId) {
      alert("No active production to end");
      return;
    }

    const now = new Date();
    const endDate = now.toISOString();

    const prodRef = ref(database, `productions/${currentProductionId}`);
    const prodSnapshot = await get(prodRef);
    const prodName = prodSnapshot.val().name;

    await update(prodRef, {
      endDate: endDate,
      status: "ended"
    });

    await set(ref(database, 'activeProduction'), null);

    prodStatus.textContent = "No Production Started";
    startBtn.disabled = false;
    endBtn.disabled = true;
    currentProductionId = null;
    endModal.style.display = 'none';

    logUpdate(`Production "${prodName}" has ended`);
  });

  // ❌ Close Modals
  window.addEventListener('click', (event) => {
    if (event.target === startModal) {
      startModal.style.display = 'none';
    }
    if (event.target === endModal) {
      endModal.style.display = 'none';
    }
  });

  prodInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      confirmStartBtn.click();
    }
  });

  // ✅ Run this on load
  checkActiveProduction();
  listenForUpdates();
});

document.addEventListener('DOMContentLoaded', () => {
    // Clear Log Button
    const clearLogBtn = document.getElementById('clearLogBtn');
    const messageList = document.querySelector('.message-list');
  
    clearLogBtn.addEventListener('click', () => {
      // Clear all log entries
      messageList.innerHTML = '';
    });
  
    // Function to append new log to the list
    const appendToMessageList = (message, timestamp) => {
      const li = document.createElement('li');
      const small = document.createElement('small');
  
      li.textContent = message + ' - ';
      small.textContent = formatReadableTime(new Date(timestamp)); // Format the time here too
      li.appendChild(small);
      messageList.prepend(li);
    };
  
  });
  const ctx = document.getElementById('multiLineChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
      datasets: [
        {
          label: 'Nitrogen',
          data: [65, 59, 80, 81, 56],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: false,
          tension: 0.4
        },
        {
          label: 'Phosphorus',
          data: [28, 48, 40, 19, 86],
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: false,
          tension: 0.4
        },
        {
          label: 'Potassium',
          data: [18, 48, 77, 9, 100],
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    const weatherDropdown = document.querySelector('.weather-dropdown');
    const weatherHeader = document.getElementById('weatherHeader');
    const weatherToggle = document.getElementById('weatherToggle');
    const weatherContent = document.getElementById('weatherContent');
    const closeIcon = document.getElementById('closeIcon');
    const menuIcon = document.getElementById('menuIcon');
    const dashboardContainer = document.querySelector('.dashboard-container');
  
    let isExpanded = true;
  
    weatherDropdown.style.position = 'fixed';
    weatherDropdown.style.top = '0';
    weatherDropdown.style.left = '55%';
    weatherDropdown.style.transform = 'translateX(-50%)';
    weatherDropdown.style.zIndex = '1000';
    weatherDropdown.style.backgroundColor = 'transparent';
    weatherDropdown.style.width = '100%';
    weatherDropdown.style.maxWidth = '80%';
  
    setTimeout(updateLayout, 50);  
  
    weatherHeader.addEventListener('click', function(e) {
      if (!e.target.closest('.weather-toggle-btn')) {
        toggleWeather();
      }
    });
  
    weatherToggle.addEventListener('click', toggleWeather);
  
    function toggleWeather() {
      isExpanded = !isExpanded;
      updateLayout();
    }
  
    function updateLayout() {
      if (isExpanded) {
        weatherContent.style.display = 'block';
        closeIcon.style.display = 'inline-block';
        menuIcon.style.display = 'none';
  
        const headerHeight = weatherHeader.offsetHeight;
        const contentHeight = weatherContent.scrollHeight;
        const totalHeight = headerHeight + contentHeight;
  
        dashboardContainer.style.marginTop = `${totalHeight}px`;
      } else {
        weatherContent.style.display = 'none';
        closeIcon.style.display = 'none';
        menuIcon.style.display = 'inline-block';
  
        dashboardContainer.style.marginTop = `${weatherHeader.offsetHeight + 10}px`;
      }
    }
  
    window.addEventListener('resize', function() {
      updateLayout();
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    const clearLogBtn     = document.getElementById('clearLogBtn');
    const modal10         = document.getElementById('modal-10');
    const cancelBtn       = document.getElementById('cancelDeleteBtn');
    const confirmBtn      = document.getElementById('confirmDeleteBtn');
    const db              = getDatabase(); // assumes you’ve already initialized app elsewhere
  
    // Show modal
    clearLogBtn.addEventListener('click', () => {
      modal10.classList.add('show');
    });
  
    // Hide modal on cancel
    cancelBtn.addEventListener('click', () => {
      modal10.classList.remove('show');
    });
  
    // On confirm, delete & hide
    confirmBtn.addEventListener('click', () => {
      const updatesRef = ref(db, 'updates');
      remove(updatesRef)
        .then(() => {
          alert('Updates log cleared!');
        })
        .catch(err => {
          console.error('Error clearing updates:', err);
          alert('Failed to clear updates');
        })
        .finally(() => {
          modal10.classList.remove('show');
        });
    });
  });