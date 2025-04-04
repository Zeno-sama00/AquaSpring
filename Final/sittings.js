// const firebaseConfig = {
//     apiKey: "AIzaSyB7suhiWl51plHqP9vsIj1pYIcM2LhL1l4",
//     authDomain: "aquaspring-548cc.firebaseapp.com",
//     databaseURL: "https://aquaspring-548cc-default-rtdb.asia-southeast1.firebasedatabase.app",
//     projectId: "aquaspring-548cc",
//     storageBucket: "aquaspring-548cc.appspot.com",
//     messagingSenderId: "748261447813",
//     appId: "1:748261447813:web:f5d21e6d6341ab0c9731ec",
//     measurementId: "G-4E06WD4Y9P"
//   };
document.addEventListener("DOMContentLoaded", function () {
    const profilePreview = document.getElementById("profilePreview");
    const userName = document.getElementById("userName");
    const userImgUpload = document.getElementById("userImgUpload");

    // Default values if nothing is in localStorage
    const defaultImage = "Images/person.png";
    const defaultName = "Esther Howard";
    const defaultRole = "ADMIN";

    // Load user profile data from localStorage
    function loadUserProfile() {
        // Get user data from localStorage or use defaults
        const savedImage = localStorage.getItem("userImg") || defaultImage;
        const savedName = localStorage.getItem("userName") || defaultName;
        const savedRole = localStorage.getItem("userRole") || defaultRole;

        // Set profile image and name
        if (profilePreview) {
            profilePreview.src = savedImage;
        }

        if (userName) {
            userName.textContent = savedName;
        }

        // Update the user profile in the other section (if exists)
        const profileDiv = document.querySelector(".user-profile");
        if (profileDiv) {
            profileDiv.querySelector("h2").textContent = savedName;
            profileDiv.querySelector(".badge").textContent = savedRole;
            profileDiv.querySelector("img").src = savedImage;
        }

        // Populate form fields with saved values
        const userNameInput = document.getElementById("userNameInput");
        const userRoleInput = document.getElementById("userRoleInput");
        if (userNameInput) {
            userNameInput.value = savedName;
        }
        if (userRoleInput) {
            userRoleInput.value = savedRole;
        }
    }

    // Load the user profile when the page loads
    loadUserProfile();

    // Handle image preview
    if (userImgUpload) {
        userImgUpload.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    profilePreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle saving changes
    const saveButton = document.getElementById("saveSettings");
    if (saveButton) {
        saveButton.addEventListener("click", function () {
            const newName = document.getElementById("userNameInput").value;
            const newRole = document.getElementById("userRoleInput").value;

            // Save data to localStorage
            localStorage.setItem("userName", newName);
            localStorage.setItem("userRole", newRole);

            // Save image as base64 (if image is set)
            if (profilePreview.src.startsWith("data:image")) {
                localStorage.setItem("userImg", profilePreview.src);
            }

            // Update profile in the other section of the page
            const profileDiv = document.querySelector(".user-profile");
            if (profileDiv) {
                profileDiv.querySelector("h2").textContent = newName;
                profileDiv.querySelector(".badge").textContent = newRole;
                profileDiv.querySelector("img").src = profilePreview.src;
            }

            alert("Profile Updated!");
        });
    }
});
