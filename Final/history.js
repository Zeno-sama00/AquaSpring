// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, update, onValue, remove} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { formatTimestamp } from './dateUtils.js';  // Correct path to dateUtils.js




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


const productionsRef = ref(db, 'productions');
// Function to calculate duration between start and end date
function getDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start); // Get difference in milliseconds
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
    return `${diffDays} days`;
}

// Get all production data from Firebase and dynamically generate history cards
onValue(productionsRef, (snapshot) => {
    const productionsContainer = document.getElementById("productionsContainer");

    if (snapshot.exists()) {
        const productions = snapshot.val();
        
        // Convert the production data into an array and sort by startDate in descending order
        const sortedProductions = Object.keys(productions)
            .map(key => ({
                id: key,
                ...productions[key]
            }))
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Sort by startDate in descending order

        // Clear previous history cards
        productionsContainer.innerHTML = '';

        // Loop through each sorted production and create a history card for it
        sortedProductions.forEach(productionData => {
            const historyCard = document.createElement("div");
            historyCard.classList.add("historyCard");

            // Set the content of the history card
            historyCard.innerHTML = `
                <div class="historyCard-header">
                    <h4>Production: ${productionData.productionName}</h4>
                </div>
                <div class="historyCard-body">
                    <p><strong>Start Date:</strong> ${formatTimestamp(productionData.startDate) || "No data"}</p>
                    <p><strong>End Date:</strong> ${productionData.endDate ? formatTimestamp(productionData.endDate) : "No data"}</p>
                    <p><strong>Status:</strong> ${productionData.endDate ? "Completed" : "Ongoing"}</p>
                    <p><strong>Duration:</strong> ${productionData.endDate ? getDuration(productionData.startDate, productionData.endDate) : "N/A"}</p>
                </div>
                  <div class="historyCard-footer">
                    <button class="viewDetailsBtn" data-id="${productionData.id}">View Details</button>
                    <button class="deleteProductionBtn" data-id="${productionData.id}">Delete Production</button>
                </div>
            `;

            // Append the history card to the container
            productionsContainer.appendChild(historyCard);
        });
    } else {
        productionsContainer.innerHTML = "<p>No production data available</p>";
    }
});
// Event listener for View Details and Delete Production
document.getElementById("productionsContainer").addEventListener("click", function(event) {
    console.log("Clicked Element:", event.target);  // Log the clicked element

    // View Details Button Clicked
    if (event.target && event.target.classList.contains("viewDetailsBtn")) {
        const productionId = event.target.getAttribute("data-id");
        console.log('View Details for productionId:', productionId);

        // Fetch details from Firebase and display in a modal or popup
        const productionRef = ref(db, 'productions/' + productionId);
        get(productionRef).then((snapshot) => {
            if (snapshot.exists()) {
                const productionData = snapshot.val();
                const details = `
                    <h3>Production: ${productionData.productionName}</h3>
                    <p><strong>Start Date:</strong> ${formatTimestamp(productionData.startDate)}</p>
                    <p><strong>End Date:</strong> ${productionData.endDate ? formatTimestamp(productionData.endDate) : 'Not yet completed'}</p>
                    <p><strong>Status:</strong> ${productionData.endDate ? 'Completed' : 'Ongoing'}</p>
                    <p><strong>Duration:</strong> ${productionData.endDate ? getDuration(productionData.startDate, productionData.endDate) : 'N/A'}</p>
                `;
                alert(details);  // Replace with your modal display
            }
        });
    }

    // Delete Production Button Clicked
    if (event.target && event.target.classList.contains("deleteProductionBtn")) {
        const productionId = event.target.getAttribute("data-id");
        console.log('Delete Production for productionId:', productionId);

        if (confirm("Are you sure you want to delete this production?")) {
            // Remove the production from Firebase
            const productionRef = ref(db, 'productions/' + productionId);
            remove(productionRef)
                .then(() => {
                    alert('Production deleted successfully');
                    event.target.closest('.historyCard').remove();  // Remove the card from the UI
                })
                .catch((error) => {
                    console.error("Error deleting production: ", error);
                    alert('Error deleting production.');
                });
        }
    }
});