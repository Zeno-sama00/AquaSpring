import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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
const db = getDatabase(app);

// State variables
let selectedPictureFile = null; // Tracks unsaved picture changes
let pendingRemovePicture = false; // Tracks remove picture requests
let currentProfilePictureUrl = null; // Track current picture URL

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

// Get current user ID from session
const currentUserId = sessionStorage.getItem("userId");
if (!currentUserId) {
    window.location.href = "../index.html";
}

// Load user data
async function loadUserData() {
    try {
        const userRef = ref(db, "users/" + currentUserId);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
            console.log("No user data found");
            return;
        }

        const userData = snapshot.val();
        currentProfilePictureUrl = userData.profilePicture; // Store current URL
        // Load basic user info
        document.getElementById("name").value = userData.name || "";
        document.getElementById("username").value = userData.username || "";
        document.getElementById("email").value = userData.email || "";
        
        // Load profile picture from local storage or default
        loadProfilePicture();
        
    } catch (error) {
        console.error("Error loading user data:", error);
        document.getElementById("profilePicture").src = '../images/person.png';
    }
}

function loadProfilePicture() {
    const profileImg = document.getElementById("profilePicture");
    const localPicture = localStorage.getItem('profilePicture');
    
    // Use cached image if available
    if (localPicture && isValidImage(localPicture)) {
        profileImg.src = localPicture;
        updateSidebarProfilePicture(localPicture);
    } else {
        profileImg.src = '../images/person.png';
        updateSidebarProfilePicture('../images/person.png');
    }
}

// Image handling utilities
function isValidImage(imageData) {
    return imageData.startsWith('data:image') || 
           imageData.endsWith('.png') || 
           imageData.endsWith('.jpg') || 
           imageData.endsWith('.jpeg');
}

// Profile picture functions
async function updateProfilePicture(file) {
    const pictureLoader = document.getElementById("pictureLoader");
    const changePictureBtn = document.getElementById("changePictureBtn");
    
    try {
        pictureLoader.classList.remove("hidden");
        changePictureBtn.disabled = true;

        // Process image and get Base64 for storage
        const base64Image = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error("Failed to read image file"));
            reader.readAsDataURL(file);
        });

        // Store in local storage
        localStorage.setItem('profilePicture', base64Image);
        
        // Update UI immediately
        document.getElementById("profilePicture").src = base64Image;
        updateSidebarProfilePicture(base64Image);
        
        return base64Image;
        
    } catch (error) {
        console.error("Upload failed:", error);
        // Revert to previous image
        const previousImage = localStorage.getItem('profilePicture') || '../images/person.png';
        document.getElementById("profilePicture").src = previousImage;
        updateSidebarProfilePicture(previousImage);
        throw error;
    } finally {
        pictureLoader.classList.add("hidden");
        changePictureBtn.disabled = false;
    }
}

async function removeProfilePicture() {
    const removePictureLoader = document.getElementById("removePictureLoader");
    const removePictureBtn = document.getElementById("removePictureBtn");
    
    try {
        removePictureLoader.classList.remove("hidden");
        removePictureBtn.disabled = true;

        // Remove from local storage
        localStorage.removeItem('profilePicture');
        
        // Update UI immediately
        document.getElementById("profilePicture").src = '../images/person.png';
        updateSidebarProfilePicture('../images/person.png');
        
        return true;
    } catch (error) {
        console.error("Remove failed:", error);
        // Revert to previous image
        const previousImage = localStorage.getItem('profilePicture') || '../images/person.png';
        document.getElementById("profilePicture").src = previousImage;
        updateSidebarProfilePicture(previousImage);
        throw error;
    } finally {
        removePictureLoader.classList.add("hidden");
        removePictureBtn.disabled = false;
    }
}

// User data update functions
async function updateUserName(newName) {
    try {
        const userRef = ref(db, `users/${currentUserId}`);
        await update(userRef, { name: newName });
        localStorage.setItem('username', newName);
        updateSidebarName(newName);
        return true;
    } catch (error) {
        console.error("Error updating name:", error);
        throw error;
    }
}
async function updateUserusername(newUsername) {
    try {
        const userRef = ref(db, `users/${currentUserId}`);
        await update(userRef, { username: newUsername });
        return true;
    } catch (error) {
        console.error("Error updating email:", error);
        throw error;
    }
}
async function updateUserEmail(newEmail) {
    try {
        const userRef = ref(db, `users/${currentUserId}`);
        await update(userRef, { email: newEmail });
        return true;
    } catch (error) {
        console.error("Error updating email:", error);
        throw error;
    }
}

async function updateUserPassword(currentPassword, newPassword) {
    try {
        const userRef = ref(db, `users/${currentUserId}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        
        const currentHashedPassword = await hashPassword(currentPassword, userData.salt);
        if (currentHashedPassword !== userData.passwordHash) {
            throw new Error("Current password is incorrect");
        }
        
        const newSalt = generateSalt();
        const newHashedPassword = await hashPassword(newPassword, newSalt);
        
        await update(userRef, {
            passwordHash: newHashedPassword,
            salt: newSalt
        });
        
        return true;
    } catch (error) {
        console.error("Error updating password:", error);
        throw error;
    }
}

// UI Helper functions
function showPictureError(message) {
    const pictureError = document.getElementById("pictureError");
    pictureError.textContent = message;
    pictureError.style.display = 'block';
    setTimeout(() => pictureError.style.display = 'none', 3000);
}

function showPictureSuccess(message) {
    const pictureSuccess = document.getElementById("pictureSuccess");
    pictureSuccess.textContent = message;
    pictureSuccess.style.display = 'block';
    setTimeout(() => pictureSuccess.style.display = 'none', 3000);
}

function showNameSuccess(message) {
    const nameSuccess = document.getElementById("nameSuccess");
    nameSuccess.textContent = message;
    nameSuccess.style.display = 'block';
    setTimeout(() => nameSuccess.style.display = 'none', 3000);
}

function showEmailSuccess(message) {
    const emailSuccess = document.getElementById("emailSuccess");
    emailSuccess.textContent = message;
    emailSuccess.style.display = 'block';
    setTimeout(() => emailSuccess.style.display = 'none', 3000);
}

function showPasswordSuccess(message) {
    const passwordSuccess = document.getElementById("passwordSuccess");
    passwordSuccess.textContent = message;
    passwordSuccess.style.display = 'block';
    setTimeout(() => passwordSuccess.style.display = 'none', 3000);
}

function hideAllMessages() {
    document.querySelectorAll('.success-message, .error-message').forEach(el => {
        el.style.display = 'none';
    });
}

// Sidebar update functions
function updateSidebarProfilePicture(imageSrc) {
    const sidebar = document.querySelector('sidebar-component');
    if (sidebar && sidebar.updateProfilePicture) {
        sidebar.updateProfilePicture(imageSrc);
    }
    
    // Also dispatch storage event in case other components are listening
    window.dispatchEvent(new Event('storage'));
}

function updateSidebarName(newName) {
    localStorage.setItem('username', newName);
    const sidebar = document.querySelector('sidebar-component');
    if (sidebar && sidebar.updateUsername) {
        sidebar.updateUsername(newName);
    }
}

// Validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    await loadUserData();
    
    // Profile Picture Elements
    const profilePicture = document.getElementById('profilePicture');
    const changePictureBtn = document.getElementById('changePictureBtn');
    const removePictureBtn = document.getElementById('removePictureBtn');
    const fileInput = document.getElementById('fileInput');
    
    // Change Picture Button
    changePictureBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // File Input Change Handler
    fileInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            if (!file.type.match('image.*')) {
                showPictureError("Please select an image file");
                return;
            }
            
            if (file.size > 2 * 1024 * 1024) {
                showPictureError("Image must be smaller than 2MB");
                return;
            }
            selectedPictureFile = file; // Store for saving
            pendingRemovePicture = false; // Clear remove flag
            // Preview the image
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById("profilePicture").src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Remove Picture Button
    removePictureBtn.addEventListener('click', function() {
        // Show default image preview
        document.getElementById("profilePicture").src = '../images/person.png';
        // Set flags for removal
        pendingRemovePicture = true;
        selectedPictureFile = null;
        // Hide any previous errors
        document.getElementById("pictureError").style.display = 'none';
    });
    
    document.getElementById('saveAllBtn').addEventListener('click', async function() {
        const saveAllLoader = document.getElementById("saveAllLoader");
        const saveAllBtn = document.getElementById("saveAllBtn");
        
        try {
            // Show loading state and reset messages
            saveAllLoader.classList.remove('hidden');
            saveAllBtn.disabled = true;
            hideAllMessages();
            
            let hasChanges = false;
            
            // Track picture changes separately
            let pictureChanged = false;
    
            // 1. Handle Profile Picture Changes FIRST
            if (pendingRemovePicture || selectedPictureFile) {
                try {
                    if (pendingRemovePicture) {
                        await removeProfilePicture();
                        showPictureSuccess("Profile picture removed successfully!");
                        hasChanges = true;
                        pictureChanged = true;
                    } else if (selectedPictureFile) {
                        await updateProfilePicture(selectedPictureFile);
                        showPictureSuccess("Profile picture updated successfully!");
                        hasChanges = true;
                        pictureChanged = true;
                    }
                    
                    // Reset states after operation
                    selectedPictureFile = null;
                    pendingRemovePicture = false;
                } catch (error) {
                    console.error("Profile picture error:", error);
                    showPictureError(error.message || "Error updating profile picture");
                    throw error;
                }
            }
    
            // 2. Handle Name Update
            const nameInput = document.getElementById('name');
            const newName = nameInput.value.trim();
            const currentName = (await get(ref(db, `users/${currentUserId}`))).val().name || '';
            if (newName && newName !== currentName) {
                await updateUserName(newName);
                showNameSuccess("Name updated successfully!");
                hasChanges = true;
            }
    
            // 3. Handle Username Update
            const newUsernameInput = document.getElementById('newUsername');
            const newUsername = newUsernameInput.value.trim();
            const currentUsername = (await get(ref(db, `users/${currentUserId}`))).val().username || '';
            
            if (newUsername && newUsername !== currentUsername) {
                try {
                    // Validate username format
                    if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUsername)) {
                        throw new Error("Username must be 3-20 characters (letters, numbers, underscores)");
                    }
                    
                    // Check if username exists (except for current user)
                    const usernameSnapshot = await get(ref(db, `usernames/${newUsername}`));
                    if (usernameSnapshot.exists() && usernameSnapshot.val() !== currentUserId) {
                        throw new Error("Username is already taken");
                    }
                    
                    // Update username in transaction
                    await runTransaction(ref(db), async (transaction) => {
                        // Update user document
                        transaction.update(ref(db, `users/${currentUserId}`), { 
                            username: newUsername 
                        });
                        
                        // Update usernames collection
                        transaction.set(ref(db, `usernames/${newUsername}`), currentUserId);
                        
                        // Remove old username if it existed
                        if (currentUsername) {
                            transaction.delete(ref(db, `usernames/${currentUsername}`));
                        }
                    });
                    
                    // Update UI and show success
                    document.getElementById('username').value = newUsername;
                    newUsernameInput.value = '';
                    showUsernameSuccess("Username updated successfully!");
                    hasChanges = true;
                    
                    // Add visual indicator
                    const usernameField = document.getElementById('username');
                    usernameField.classList.add('success-highlight');
                    setTimeout(() => {
                        usernameField.classList.remove('success-highlight');
                    }, 2000);
                    
                } catch (error) {
                    showUsernameError(error.message);
                    throw error;
                }
            }
    
            // 4. Handle Email Update
            const newEmailInput = document.getElementById('newEmail');
            const newEmail = newEmailInput.value.trim();
            const currentEmail = document.getElementById('email').value;
            if (newEmail && newEmail !== currentEmail) {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
                    showEmailError("Please enter a valid email address");
                    throw new Error("Invalid email format");
                }
                
                await updateUserEmail(newEmail);
                showEmailSuccess("Email updated successfully!");
                document.getElementById('email').value = newEmail;
                newEmailInput.value = '';
                hasChanges = true;
            }
    
            // 5. Handle Password Update
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (currentPassword || newPassword || confirmPassword) {
                if (!currentPassword || !newPassword || !confirmPassword) {
                    showPasswordError("All password fields are required");
                    throw new Error("Missing password fields");
                }
                
                if (newPassword.length < 6) {
                    showPasswordError("Password must be at least 6 characters");
                    throw new Error("Password too short");
                }
                
                if (newPassword !== confirmPassword) {
                    showPasswordMismatch("Passwords don't match");
                    throw new Error("Passwords don't match");
                }
                
                await updateUserPassword(currentPassword, newPassword);
                showPasswordSuccess("Password updated successfully!");
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
                hasChanges = true;
            }
    
            // Special case: If only picture was changed/removed
            if (!hasChanges && pictureChanged) {
                hasChanges = true;
            }
    
            if (!hasChanges) {
                showToast("No changes were made");
            }
    
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            saveAllLoader.classList.add('hidden');
            saveAllBtn.disabled = false;
        }
    });
    
    // Helper functions
    function showUsernameSuccess(message) {
        const successElement = document.getElementById('usernameSuccess');
        successElement.textContent = message;
        successElement.style.display = 'block';
        setTimeout(() => successElement.style.display = 'none', 5000);
    }
    
    function showUsernameError(message) {
        const errorElement = document.getElementById('usernameError');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => errorElement.style.display = 'none', 5000);
    }
    
    function hideAllMessages() {
        document.querySelectorAll('.success-message, .error-message').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    function showToast(message) {
        // Implement your toast notification system here
        console.log(message);
    }
    // Helper functions
    function showNoChangesMessage() {
        const noChangesMessage = document.createElement('div');
        noChangesMessage.className = 'success-message';
        noChangesMessage.textContent = "No changes detected";
        noChangesMessage.style.display = 'block';
        document.getElementById('saveAllBtn').parentNode.insertBefore(noChangesMessage, document.getElementById('saveAllBtn').nextSibling);
        setTimeout(() => noChangesMessage.style.display = 'none', 3000);
    }
    
    function showPasswordMismatch(message) {
        document.getElementById("passwordMismatch").textContent = message;
        document.getElementById("passwordMismatch").style.display = 'block';
        setTimeout(() => document.getElementById("passwordMismatch").style.display = 'none', 3000);
    }
    
    // Sidebar collapse handling
    const sidebar = document.querySelector('sidebar-component');
    if (sidebar && sidebar.shadowRoot.querySelector('.collapsed')) {
        document.body.classList.add('collapsed');
    }
    
    sidebar.shadowRoot.querySelector('.toggle-btn').addEventListener('click', function() {
        document.body.classList.toggle('collapsed');
    });
});

// Add this code in the DOMContentLoaded event listener, after loading user data

// Password toggle functionality
function setupPasswordToggle(passwordInputId, eyeButtonId) {
    const eyeButton = document.getElementById(eyeButtonId);
    const passwordInput = document.getElementById(passwordInputId);
  
    eyeButton.addEventListener("click", function() {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeButton.textContent = "🙈";
      } else {
        passwordInput.type = "password";
        eyeButton.textContent = "👁️";
      }
    });
  }
  
  // Set up toggle for all password fields
  setupPasswordToggle("currentPassword", "currentPasswordEye");
  setupPasswordToggle("newPassword", "newPasswordEye");
  setupPasswordToggle("confirmPassword", "confirmPasswordEye");

  