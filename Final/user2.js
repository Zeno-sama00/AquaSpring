// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Firebase configuration (use your own Firebase project configuration)
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
const auth = getAuth(app);

// Handle the login form submission
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent page refresh on form submission

    // Get the email and password from the input fields
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Perform input validation
    if (!email || !password) {
        alert("Please fill in both fields.");
        return;
    }

    console.log("Attempting to sign in with:", email);

    // Sign in with Firebase Authentication
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Successfully signed in
            const user = userCredential.user;
            console.log("User signed in:", user);
            // Redirect to the dashboard page upon successful login
            window.location.href = "Dashburd.html";  // Update to your actual dashboard URL
        })
        .catch((error) => {
            // Handle errors
            const errorCode = error.code;
            const errorMessage = error.message;

            console.error("Login error:", errorCode, errorMessage);

            // Provide feedback for common errors
            if (errorCode === 'auth/user-not-found') {
                alert("No user found with this email.");
            } else if (errorCode === 'auth/wrong-password') {
                alert("Incorrect password. Please try again.");
            } else {
                alert("Error: " + errorMessage);
            }
        });
});
