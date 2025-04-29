import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase Config
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
const db = getDatabase(app);

// Password hashing utilities
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const saltedPassword = password + salt;
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(saltedPassword));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateUserId() {
  // Generate a 20-character alphanumeric ID
  return 'user_' + Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
}

// SIGN UP
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  const signupMessage = document.getElementById("signupMessage");

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    
    if (password.length < 6) {
      signupMessage.textContent = "Password must be at least 6 characters!";
      signupMessage.className = "text-red-500 text-center";
      signupMessage.classList.remove("hidden");
      return;
    }

    try {
      // Check if username exists in the username index
      const usernameRef = ref(db, "usernames/" + username);
      const usernameSnapshot = await get(usernameRef);

      if (usernameSnapshot.exists()) {
        signupMessage.textContent = "Username already exists!";
        signupMessage.className = "text-red-500 text-center";
        signupMessage.classList.remove("hidden");
        return;
      }

      // Generate random user ID and salt
      const userId = generateUserId();
      const salt = generateSalt();
      const hashedPassword = await hashPassword(password, salt);

      // Store user data under random ID
      const userRef = ref(db, "users/" + userId);
      await set(userRef, {
        email,
        username,
        passwordHash: hashedPassword,
        salt: salt,
        createdAt: new Date().toISOString()
      });

      // Create username to ID mapping for lookup
      await set(usernameRef, userId);

      // Success message
      signupMessage.textContent = "Sign up successful! Redirecting...";
      signupMessage.className = "text-green-500 text-center";
      signupMessage.classList.remove("hidden");

      setTimeout(() => {
        window.location.href = "../index.html?signup=success";
      }, 2000);

    } catch (error) {
      console.error("Signup error:", error);
      signupMessage.textContent = "Error during signup. Please try again.";
      signupMessage.className = "text-red-500 text-center";
      signupMessage.classList.remove("hidden");
    }
  });
}

// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  const loginMessage = document.getElementById("loginMessage");

  // Load saved login credentials
  window.addEventListener("DOMContentLoaded", () => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      document.getElementById("username").value = savedUsername;
      document.getElementById("remember").checked = true;
    }
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const remember = document.getElementById("remember").checked;

    try {
      // First look up the user ID from username index
      const usernameRef = ref(db, "usernames/" + username);
      const usernameSnapshot = await get(usernameRef);

      if (!usernameSnapshot.exists()) {
        loginMessage.textContent = "User not found.";
        loginMessage.className = "text-red-500 text-center";
        loginMessage.classList.remove("hidden");
        return;
      }

      const userId = usernameSnapshot.val();
      
      // Now fetch user details using the ID
      const userRef = ref(db, "users/" + userId);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      // Verify password
      const hashedPassword = await hashPassword(password, userData.salt);
      if (hashedPassword !== userData.passwordHash) {
        loginMessage.textContent = "Incorrect password.";
        loginMessage.className = "text-red-500 text-center";
        loginMessage.classList.remove("hidden");
        return;
      }

      // Save username if 'Remember me' is checked (don't store password)
      if (remember) {
        localStorage.setItem("rememberedUsername", username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      // Set session
      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("currentUser", username);
      sessionStorage.setItem("userId", userId);

      loginMessage.textContent = "Login successful!";
      loginMessage.className = "text-green-500 text-center";
      loginMessage.classList.remove("hidden");

      setTimeout(() => {
        window.location.href = "pages/dashboard.html";
      }, 1500);

    } catch (error) {
      console.error("Login error:", error);
      loginMessage.textContent = "Error during login. Please try again.";
      loginMessage.className = "text-red-500 text-center";
      loginMessage.classList.remove("hidden");
    }
  });
}
    const eyeButton = document.getElementById("eyeButton");
    const passwordInput = document.getElementById("password");

    eyeButton.addEventListener("click", function() {
      if (passwordInput.type === "password") {
        passwordInput.type = "text"; 
        eyeButton.textContent = "🙈"; 
      } else {
        passwordInput.type = "password"; 
        eyeButton.textContent = "👁️";
      }
    });