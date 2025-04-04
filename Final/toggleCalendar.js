// Function to toggle the visibility of the weather widget
function toggleCalendar() {
    const widget = document.getElementById("calendarWidget");
    widget.classList.toggle("open");
}// Function to toggle the visibility of the weather widget
function toggleWeather() {
    const widget = document.getElementById("weatherWidget");
    widget.classList.toggle("open");
}

// Function to add a notification with timestamp from Firebase
function addNotification(type, timestamp) {
    // Create notification message
    let message = "";
    const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (type === "automatic") {
        message = `Automatic watering triggered at ${time}.`;
    } else if (type === "manual") {
        message = `Manual watering triggered at ${time}.`;
    }

    // Create a new list item
    const notificationItem = document.createElement("li");
    notificationItem.innerHTML = `<span>${message}</span>`;

    // Add the notification to the list
    const notificationList = document.getElementById("notificationList");
    notificationList.insertBefore(notificationItem, notificationList.firstChild);

    // Show the notification bar if it's hidden
    const notificationBar = document.getElementById("notificationBar");
    if (!notificationBar.classList.contains("open")) {
        notificationBar.classList.add("open");
    }

    // Auto hide the notification bar after 5 seconds
    setTimeout(() => {
        notificationBar.classList.remove("open");
    }, 5000); // Hide after 5 seconds
}

// Listen for Firebase updates on automatic watering trigger
onValue(automaticTriggerRef, (snapshot) => {
    const timestamp = snapshot.val();
    if (timestamp) {
        addNotification("automatic", timestamp);
    }
});

// Listen for Firebase updates on manual watering trigger
onValue(manualTriggerRef, (snapshot) => {
    const timestamp = snapshot.val();
    if (timestamp) {
        addNotification("manual", timestamp);
    }
});
// Function to trigger automatic watering and update Firebase
function triggerAutomaticWatering() {
    const timestamp = new Date().toISOString(); // Get current timestamp
    set(automaticTriggerRef, timestamp); // Set the timestamp in Firebase
}

// Function to trigger manual watering and update Firebase
function triggerManualWatering() {
    const timestamp = new Date().toISOString(); // Get current timestamp
    set(manualTriggerRef, timestamp); // Set the timestamp in Firebase
}

// Example of calling the functions to simulate watering
// triggerAutomaticWatering(); // Uncomment to test automatic watering
// triggerManualWatering(); // Uncomment to test manual watering
