// Firebase imports
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";

// Firebase configuration (use your actual Firebase credentials)
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

// Sign-up form submission
document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the form from reloading the page

    // Get email and password from the form
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validate the input
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    // Create a new user
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // User created successfully
            const user = userCredential.user;
            console.log("User signed up:", user);

            // // Optionally, send a verification email if needed
            // user.sendEmailVerification().then(() => {
            //     console.log("Verification email sent!");
            // });

            // Redirect to the login page or show a confirmation
            window.location.href = "logsign.html";  // Redirect to login page
        })
        .catch((error) => {
            // Handle errors (e.g., email already in use)
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Sign-up error:", errorCode, errorMessage);
            alert("Error: " + errorMessage);
        });
});
