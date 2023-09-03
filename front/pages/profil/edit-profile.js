document.addEventListener("DOMContentLoaded", function() {
    const user = JSON.parse(localStorage.getItem("user"));

// add event listener to save profile button
    const saveBtn = document.getElementById("save-profile-btn");
    saveBtn.addEventListener("click", function (event) {
        event.preventDefault(); // prevent form submission
        const oldMail = user.email;

        // validate form fields and save changes
        const newUsername = document.getElementById("username").value;
        const newEmail = document.getElementById("email").value;
        const newPassword = document.getElementById("password").value;
        const confirmNewPassword = document.getElementById("confirm-password").value;

        if (newPassword !== confirmNewPassword) {
            alert("Passwords do not match!");
            return;
        }else{
            user.username = newUsername;
            user.email = newEmail;
            user.password = newPassword;
        }

        fetch('/api/' + oldMail, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then(response => response.json())
            .then(updatedUser => {
                console.log('User updated:', updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                alert("Profile updated!");
                window.location.href = "/pages/profil/profile.html";
            })
            .catch(error => {
                console.error('Error updating user:', error);
            });
        // save changes to database and redirect user back to profile page
        // replace the alert below with code to save changes to the database
    });
});