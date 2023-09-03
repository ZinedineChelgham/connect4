
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('idForm');
    if (form) {

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const username = document.querySelector("#username").value;
            const email = document.querySelector("#email").value;
            const password = document.querySelector("#password").value;
            const passwordConfirm = document.querySelector("#passwordConfirm").value;

            if (username == null || username === "" || email == null || email === "" || password == null || password === "" || passwordConfirm == null || passwordConfirm === "") {
                displayToast("All fields has to be filled", "warning")
                return false;
            }

            if(username.length < 3 || username.length > 10){
                displayToast("Username must be between 3 and 10 characters", "warning")
                return false;
            }

            if (password !== passwordConfirm) {
                displayToast("Passwords do not match", "warning");
                return false;
            }

            //check to see if the email is valid
            const emailRegex = /\S+@\S+\.\S+/;
            if (!emailRegex.test(email)) {
                displayToast("Please enter a valid email address", "warning");
                return false;
            }

            if (password.length < 6 ) {
                displayToast("Your password must be more than 5 characters", "warning");
                return false;
            }

            const data = {username, email, password};

            const options = {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            };

            fetch("/api/signup", options)
                .then(response => {
                    if (!response.ok) {
                        displayToast("An error occurred", "error");
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    displayToast("You are now registered!", "success")
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.currentUser));
                    wait(300).then(() => window.location = '/');

                })
                .catch(error => {
                    console.error("Error:", error);
                    displayToast("An error occurred", "error");
                });
        });
    } else {
        console.log("pas de bouton signin")
    }
});

function userNameLenVerif(){
    const username = document.querySelector("#username");
    username.addEventListener('blur', event => {
        if (username.value.length < 3 || username.value.length > 10) {
            displayToast('Username must be between 3 and 10 characters', "warning");
        }
    })

}


