document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('idForm');
    if (form) {

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            const email = document.querySelector("#email").value;
            const password = document.querySelector("#password").value;

            if (email == null || email === "" || password == null || password === "") {
                alert("All fileds has to be filled");
                return false;
            }

            const data = {email, password};

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            };

            console.log("dans login.js" + options);

            fetch("/api/login", options)
                .then(res => {
                    if (!res.ok) {
                        displayToast("An error occurred", "error");
                        throw new Error("Network response was not ok");
                    }
                    return res.json();
                })
                .then(response => {
                    if (response.token) {
                        displayToast("You are now logged in!", "success");
                        localStorage.setItem("token", response.token);
                        localStorage.setItem("user", JSON.stringify(response.currentUser));
                        wait(300).then(() => window.location = '/')
                    } else {
                        displayToast("The username or the password is not correct", "error");
                    }
                })
                .catch(error => {
                    displayToast("The email or the password is not correct", "error");
                    console.error("Error:", error)
                });


        });

    } else {
        console.log("pas de bouton login")
    }
});

