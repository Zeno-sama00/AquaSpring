// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, update, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { formatTimestamp } from './dateUtils.js';


// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB7suhiWl51plHqP9vsIj1pYIcM2LhL1l4",
    authDomain: "aquaspring-548cc.firebaseapp.com",
    databaseURL: "https://aquaspring-548cc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "aquaspring-548cc",
    storageBucket: "aquaspring-548cc.appspot.com",
    messagingSenderId: "748261447813",
    appId: "1:748261447813:web:f5d21e6d6341ab0c9731ec",
    measurementId: "G-4E06WD4Y9P"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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
            y: { title: { display: true, text: "Levels" }, min: 0, max: 999 }
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

// Fetch and display weather data from OpenWeatherMap
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

        displayWeather(data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        document.getElementById("forecast").innerHTML = "<p>⚠️ Failed to load weather data.</p>";
    }
}

// Function to display weather data
function displayWeather(data) {
    const cityName = document.getElementById("city-name");
    const forecastContainer = document.getElementById("forecast");

    cityName.textContent = `Today's Weather - ${new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`;

    let forecastHTML = "";
    for (let i = 0; i < 6; i++) { // Show next 6 time slots
        let item = data.list[i];
        let date = new Date(item.dt_txt);
        let formattedDate = date.toLocaleDateString([], { weekday: "short", month: "long", day: "numeric" });
        let time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        let temp = Math.round(item.main.temp);
        let icon = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
        let rainChance = item.pop ? `${Math.round(item.pop * 100)}% Rain Chance` : "☀️ No Rain Expected";

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

// $(document).ready(function() {
//     let startDate = null;
//     let endDate = null;
//     let productionName = null;
//     let formattedStartDate = null; 
//     if (!productionName) {
//         productionName = localStorage.getItem("productionName");
//     }
//     // Initialize the calendar
//     $('#calendar').fullCalendar({
//         editable: true,
//         droppable: true,
//         defaultView: 'month',
//         events: function(start, end, timezone, callback) {
//             let events = [];
//             if (startDate) {
//                 events.push({
//                     title: 'Start Date', // Title for start planting event
//                     start: startDate,
//                     className: 'planted-day', // Custom class for planting start date
//                     eventType: 'start' // Add eventType to distinguish start and end events
//                 });
//             }
//             if (endDate) {
//                 events.push({
//                     title: 'End Date', // Title for end planting event
//                     start: endDate,
//                     className: 'end-day', // Custom class for planting end date
//                     eventType: 'end' // Add eventType to distinguish start and end events
//                 });
//             }
//             callback(events);
//         },

//         // Enable tooltips to show full title on hover
//         eventRender: function(event, element) {
//             element.attr('title', event.title);

//             // Remove all inner content except the title (no extra 'p' tags)
//             element.find('.fc-title').text(event.title);
//         },

//         // Make events clickable to show full event details in modal
//         eventClick: function(event, jsEvent, view) {
//             let eventDetails = '<p><strong>Production:</strong> ' + productionName + '</p>';
//             if (event.eventType === 'start') {
//                 eventDetails += '<p><strong>Start Date:</strong> ' + event.start.format('YYYY-MM-DD HH:mm:ss') + '</p>';
//             } else if (event.eventType === 'end') {
//                 eventDetails += '<p><strong>End Date:</strong> ' + event.start.format('YYYY-MM-DD HH:mm:ss') + '</p>';
//             }

//             // Show event details in the modal when clicked
//             $('#eventDetails').html(eventDetails);

//             // Open the modal
//             $('#eventModal').modal('show');
//         }
//     });

//     // Start Planting Button functionality
//     $('#startPlantingBtn').click(function() {
//         // Prompt for production name
//         productionName = prompt("Please enter a production name (e.g., plant type or batch):");

//         if (productionName) {
//             localStorage.setItem("productionName", productionName);

//             // Capture the current date as the start date
//             startDate = new Date().toISOString(); // Convert to string format //new
//             const formattedStartDate = formatTimestamp(startDate);  // Format the date //bago
//             endDate = null;  // Reset end date in case of new planting session
//             const productionRef = ref(db, "productions/" + productionName);
//             update(productionRef, { productionName, startDate, endDate: null });


//             // Mark the start date on the calendar
//             $('#calendar').fullCalendar('refetchEvents'); // Refresh calendar to display new event
//             document.getElementById('productionTitle').textContent = productionName;
//             // Disable Start button and enable End button
//             $(this).prop('disabled', true);
//             $('#endPlantingBtn').prop('disabled', false);
//         } else {
//             alert("Production name is required to start planting.");
//         }
//     });

//     // End Planting Button functionality
//     $('#endPlantingBtn').click(function() {
//         // Ask for confirmation before ending the planting
//         if (confirm("Are you sure you want to end the planting session for '" + productionName + "'?")) {
//             // Capture the current date as the end date
//             endDate = new Date().toISOString(); // Convert to string format //new
//             const productionRef = ref(db, "productions/" + productionName);
//             update(productionRef, {
//                 endDate: endDate // Update only the end date
//             });
    


//             // Mark the end date on the calendar
//             $('#calendar').fullCalendar('refetchEvents'); // Refresh calendar to display new event
//             localStorage.removeItem("productionName"); // Clear productionName from localStorage //new

//             // Reset variables and UI
//             productionName = null; //new
//             document.getElementById('productionTitle').textContent = "No Production Started";
//             // Disable End button after session ends
//             $(this).prop('disabled', true);
//             $('#startPlantingBtn').prop('disabled', false); // Re-enable the Start button //new
//         }
//     });
//     const productionRef = ref(db, "productions");
//     onValue(productionRef, (snapshot) => {
//         if (snapshot.exists()) {
//             console.log(snapshot.val()); //new
//         } else {
//             console.log("No production data available"); //new
//         }
//     });
// });
$(document).ready(function() {
    let startDate = null;
    let endDate = null;
    let productionName = null;
    let formattedStartDate = null; 

    // Check if productionName is stored in localStorage
    productionName = localStorage.getItem("productionName");
    
    // If productionName exists, load the production info from Firebase
    if (productionName) {
        const productionRef = ref(db, "productions/" + productionName);
        onValue(productionRef, (snapshot) => {
            const productionData = snapshot.val();
            if (productionData) {
                startDate = productionData.startDate;
                endDate = productionData.endDate;
                formattedStartDate = formatTimestamp(startDate);
                // If endDate is still null, set status as ongoing
                if (endDate) {
                    $('#endPlantingBtn').prop('disabled', true);
                    $('#startPlantingBtn').prop('disabled', true); // Disable Start Planting button after starting
                } else {
                    $('#startPlantingBtn').prop('disabled', true); // Disable Start if already started
                    $('#endPlantingBtn').prop('disabled', false); // Enable End Planting if ongoing
                }
                // Update UI with production info
                document.getElementById('productionTitle').textContent = productionName;
                $('#calendar').fullCalendar('refetchEvents'); // Refresh calendar
            }
        });
    }

    // Initialize the calendar
    $('#calendar').fullCalendar({
        editable: true,
        droppable: true,
        defaultView: 'month',
        events: function(start, end, timezone, callback) {
            let events = [];
            if (startDate) {
                events.push({
                    title: 'Start Date', // Title for start planting event
                    start: startDate,
                    className: 'planted-day', // Custom class for planting start date
                    eventType: 'start' // Add eventType to distinguish start and end events
                });
            }
            if (endDate) {
                events.push({
                    title: 'End Date', // Title for end planting event
                    start: endDate,
                    className: 'end-day', // Custom class for planting end date
                    eventType: 'end' // Add eventType to distinguish start and end events
                });
            }
            callback(events);
        },

        // Enable tooltips to show full title on hover
        eventRender: function(event, element) {
            element.attr('title', event.title);

            // Remove all inner content except the title (no extra 'p' tags)
            element.find('.fc-title').text(event.title);
        },

        // Make events clickable to show full event details in modal
        eventClick: function(event, jsEvent, view) {
            let eventDetails = '<p><strong>Production:</strong> ' + productionName + '</p>';
            if (event.eventType === 'start') {
                eventDetails += '<p><strong>Start Date:</strong> ' + event.start.format('YYYY-MM-DD HH:mm:ss') + '</p>';
            } else if (event.eventType === 'end') {
                eventDetails += '<p><strong>End Date:</strong> ' + event.start.format('YYYY-MM-DD HH:mm:ss') + '</p>';
            }

            // Show event details in the modal when clicked
            $('#eventDetails').html(eventDetails);

            // Open the modal
            $('#eventModal').modal('show');
        }
    });

    // Start Planting Button functionality
    $('#startPlantingBtn').click(function() {
        // Prompt for production name if not already set
        if (!productionName) {
            productionName = prompt("Please enter a production name (e.g., plant type or batch):");
            if (!productionName) {
                alert("Production name is required to start planting.");
                return;
            }
        }
        
        // Save production name to localStorage
        localStorage.setItem("productionName", productionName);

        // Capture the current date as the start date
        startDate = new Date().toISOString(); // Convert to string format //new
        formattedStartDate = formatTimestamp(startDate);  // Format the date //bago
        endDate = null;  // Reset end date in case of new planting session

        const productionRef = ref(db, "productions/" + productionName);
        update(productionRef, { productionName, startDate, endDate: null });

        // Mark the start date on the calendar
        $('#calendar').fullCalendar('refetchEvents'); // Refresh calendar to display new event

        document.getElementById('productionTitle').textContent = productionName;

        // Disable Start button and enable End button
        $(this).prop('disabled', true);
        $('#endPlantingBtn').prop('disabled', false);
    });

    // End Planting Button functionality
    $('#endPlantingBtn').click(function() {
        // Ask for confirmation before ending the planting
        if (confirm("Are you sure you want to end the planting session for '" + productionName + "'?")) {
            // Capture the current date as the end date
            endDate = new Date().toISOString(); // Convert to string format

            const productionRef = ref(db, "productions/" + productionName);
            update(productionRef, {
                endDate: endDate // Update only the end date
            });

            // Mark the end date on the calendar
            $('#calendar').fullCalendar('refetchEvents'); // Refresh calendar to display new event
            localStorage.removeItem("productionName"); // Clear productionName from localStorage

            // Reset variables and UI
            productionName = null; // Reset productionName
            document.getElementById('productionTitle').textContent = "No Production Started";

            // Disable End button after session ends
            $(this).prop('disabled', true);
            $('#startPlantingBtn').prop('disabled', false); // Re-enable the Start button
        }
    });

    // Firebase listener to log production data on changes
    const productionRef = ref(db, "productions");
    onValue(productionRef, (snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val()); // Log production data in console
        } else {
            console.log("No production data available");
        }
    });
});
