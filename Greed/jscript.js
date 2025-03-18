// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ======= REAL-TIME SOIL MOISTURE LEVEL ======= //
const moistureRef = ref(db, "sensorData/soilMoisture");

// Listen for real-time updates on soil moisture
onValue(moistureRef, (snapshot) => {
    const moistureLevel = snapshot.val();
    updateProgressBar(moistureLevel);
});

// Function to update circular progress bar
function updateProgressBar(value) {
    const progressCircle = document.getElementById("progress-circle");
    const progressText = document.getElementById("progress-text");

    if (progressCircle && progressText) {
        const percentage = Math.min(100, Math.max(0, value));
        const offset = 314 - (percentage / 100) * 314;
        progressCircle.style.strokeDashoffset = offset;
        progressText.textContent = `${percentage}%`;
    }
}

// ======= REAL-TIME NPK LEVELS & GRAPH ======= //
const npkRef = ref(db, "sensorData/npkLevels");

// Get the canvas element
const canvas = document.getElementById("npkChart");
if (!canvas) {
    console.error("Canvas element for Chart.js not found!");
}
const ctx = canvas.getContext("2d");

// Create the Chart.js instance
const npkChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            { label: "Nitrogen (N)", borderColor: "red", data: [], fill: false },
            { label: "Phosphorus (P)", borderColor: "blue", data: [], fill: false },
            { label: "Potassium (K)", borderColor: "green", data: [], fill: false },
            { label: "Soil Moisture", borderColor: "purple", data: [], fill: false }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: { title: { display: true, text: "Time" } },
            y: { title: { display: true, text: "Levels" }, min: 0, max: 100 }
        }
    }
});

// Function to update the chart
function updateChart(time, nitrogen, phosphorus, potassium, moisture) {
    const maxDataPoints = 10; // Keep the last 10 readings

    if (npkChart.data.labels.length > maxDataPoints) {
        npkChart.data.labels.shift();
        npkChart.data.datasets.forEach((dataset) => dataset.data.shift());
    }

    npkChart.data.labels.push(time);
    npkChart.data.datasets[0].data.push(nitrogen);
    npkChart.data.datasets[1].data.push(phosphorus);
    npkChart.data.datasets[2].data.push(potassium);
    npkChart.data.datasets[3].data.push(moisture);
    npkChart.update();
}

// Listen for real-time updates from Firebase
onValue(npkRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const time = new Date().toLocaleTimeString();
        updateChart(time, data.nitrogen, data.phosphorus, data.potassium, data.soilMoisture);
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const calendarDays = document.getElementById("calendarDays");
    const monthYear = document.getElementById("monthYear");
    const prevMonth = document.getElementById("prevMonth");
    const nextMonth = document.getElementById("nextMonth");
    const weekdaysRow = document.getElementById("weekdaysRow"); // Added reference for weekday header

    let currentDate = new Date();

    function renderCalendar() {
        calendarDays.innerHTML = "";
        
        // Get first and last day of the current month
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        monthYear.textContent = firstDay.toLocaleString("default", { month: "long", year: "numeric" });

        // Add weekday headers (if not already in HTML)
        weekdaysRow.innerHTML = "";
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        weekdays.forEach(day => {
            const weekdayElement = document.createElement("div");
            weekdayElement.classList.add("weekday");
            weekdayElement.textContent = day;
            weekdaysRow.appendChild(weekdayElement);
        });

        // Add empty slots for days before the 1st of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            const emptySlot = document.createElement("div");
            emptySlot.classList.add("empty");
            calendarDays.appendChild(emptySlot);
        }

        // Add actual days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dayElement = document.createElement("div");
            dayElement.classList.add("day");
            dayElement.textContent = i;

            // Highlight the current day
            if (
                i === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()
            ) {
                dayElement.classList.add("current-day");
            }

            calendarDays.appendChild(dayElement);
        }
    }

    prevMonth.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonth.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
});


async function getWeather() {
    const apiKey = "ed3b158f56d73941aa20954dbd8f33f1";
    const city = "Manila"; 
    let url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.cod !== "200") {
            console.error("Failed to fetch weather data.");
            document.getElementById("forecast").innerHTML = "<p>⚠️ Failed to load weather data.</p>";
            return;
        }

        displayWeather(data, city);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        document.getElementById("forecast").innerHTML = "<p>⚠️ Failed to load weather data.</p>";
    }
}

function displayWeather(data) {
    const cityName = document.getElementById("city-name");
    const forecastContainer = document.getElementById("forecast");

    cityName.textContent = `Today's Weather - ${new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`;

    let forecastHTML = "";
    for (let i = 0; i < 6; i++) { // Show next 6 time slots
        let item = data.list[i];
        let date = new Date(item.dt_txt);
        let formattedDate = date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
        let time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        let temp = Math.round(item.main.temp);
        let icon = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
        let rainChance = item.weather[0].main.toLowerCase().includes("rain") ? "🌧️ Rain Expected" : "☀️ Sunny";

        forecastHTML += `
            <div class="forecast-item">     
            
               <span class="temp">${temp}°C</span>
                <img src="${icon}" alt="Weather icon">
                 
                <span class="rain">${rainChance}</span>
                <span class="date">${formattedDate}</span>
                <span class="time">${time}</span>
            </div>
        `;
    }

    forecastContainer.innerHTML = forecastHTML;
}

// Load the weather on page load
getWeather();


document.addEventListener("DOMContentLoaded", function () {
    const newProductionBtn = document.getElementById("newProductionBtn");
    const newProductionPopup = document.getElementById("newProductionPopup");
    const calendarPopup = document.getElementById("calendarPopup");
    const nextStepBtn = document.getElementById("nextStepBtn");
    const confirmProductionBtn = document.getElementById("confirmProductionBtn");
    const closePopup = document.getElementById("closePopup");
    const closeCalendarPopup = document.getElementById("closeCalendarPopup");
    const productionTitle = document.getElementById("productionTitle");

    let productionName = "";

    // Open "New Production" Popup
    newProductionBtn.addEventListener("click", () => {
        
        newProductionPopup.style.display = "block";
    });

    // Close "New Production" Popup
    closePopup.addEventListener("click", () => {
        newProductionPopup.style.display = "none";
    });

    // Move to Calendar Popup
    nextStepBtn.addEventListener("click", () => {
        productionName = document.getElementById("productionName").value;
        if (productionName.trim() === "") {
            alert("Please enter a production name.");
            return;
        }
        newProductionPopup.style.display = "none";
        calendarPopup.style.display = "block";
    });

    // Close Calendar Popup
    closeCalendarPopup.addEventListener("click", () => {
        calendarPopup.style.display = "none";
    });

    // Confirm Production Start
    confirmProductionBtn.addEventListener("click", () => {
        const startDate = document.getElementById("startDate").value;

        if (startDate) {
            productionTitle.textContent = `Production: ${productionName} (Started on ${startDate})`;
            calendarPopup.style.display = "none";
        } else {
            alert("Please select a start date.");
        }
    });

    // End Production Button Click
    confirmEndProduction.addEventListener("click", () => {
        productionTitle.textContent = "No Production Started";
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const endProductionBtn = document.getElementById("endProductionBtn");
    const endProductionModal = document.getElementById("endProductionModal");
    const confirmEndProduction = document.getElementById("confirmEndProduction");
    const cancelEndProduction = document.getElementById("cancelEndProduction");

    endProductionBtn.addEventListener("click", function (event) {
        event.preventDefault(); // Prevents unwanted page behavior
        endProductionModal.style.display = "flex"; // Show the confirmation modal
    });

    cancelEndProduction.addEventListener("click", function () {
        endProductionModal.style.display = "none"; // Hide the modal if user cancels
    });

    confirmEndProduction.addEventListener("click", function () {
        endProductionModal.style.display = "none"; // Close the modal
        setTimeout(() => {
            alert("Production has ended."); // Simulate ending production
        }, 100); // Small delay to ensure smooth transition

        // Here, add the logic to reset production if needed
        // Example: document.getElementById("productionName").textContent = "No Active Production";
    });
});