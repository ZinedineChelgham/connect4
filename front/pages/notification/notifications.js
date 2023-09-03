document.addEventListener("DOMContentLoaded", function() {
    let userConnected = JSON.parse(localStorage.getItem("user"));

    console.log(userConnected);

    const notificationsList = document.getElementById("notifications-list");
    const searchInput = document.getElementById("searchNotification");
    const searchButton = document.querySelector("button");

    function displayNotification(idNotif, userConnected, notificationsList) {
        console.log("dans displayNotification")
        const li = document.createElement("li");

        fetch('/api/notifications/' + idNotif)
            .then(response => response.json())
            .then(notifsFound => {
                if (notifsFound) {
                    const notifTodisplay = notifsFound.notif;
                    li.textContent = notifTodisplay.nDescription.toString();


                    if (notifTodisplay.nType === "friendRequest") {
                        li.addEventListener("click", async () => {
                            const confirmation = confirm("Voulez-vous vraiment ajouter cet ami ?");
                            if (confirmation) {
                                const nDescription = userConnected.username + " accepted your friend request";
                                const nType = "acceptFriend";
                                const nSender = userConnected.username;

                                let newFriend = null;

                                console.log("avant le fetch avec notifTodisplay.nSender: " + notifTodisplay.nSender);
                                fetch('/api/users/' + notifTodisplay.nSender)
                                    .then(response => response.json())
                                    .then(friendsFound => {
                                        console.log("Friends found:", friendsFound);
                                        if (friendsFound) {
                                            newFriend = friendsFound.users[0];

                                            const data = { nDescription, nType, nSender };

                                            const options = {
                                                method: "POST",
                                                headers: {
                                                    "Accept": "application/json",
                                                    "Content-Type": "application/json"
                                                },
                                                body: JSON.stringify(data)
                                            };

                                            fetch("/api/newNotif", options)
                                                .then(response => response.json())
                                                .then(async data => {
                                                    console.log("response json new notif: " + JSON.stringify(data))
                                                    if (data || data.notif) {
                                                        if (newFriend.notifications === undefined) {
                                                            newFriend.notifications = [];
                                                        }
                                                        if (newFriend.friends === undefined) {
                                                            newFriend.friends = [];
                                                        }

                                                        newFriend.notifications.push(data.notif.id);
                                                        newFriend.friends.push(userConnected.id);

                                                        const response = await fetch('/api/' + newFriend.email, {
                                                            method: 'PUT',
                                                            headers: {
                                                                'Content-Type': 'application/json'
                                                            },
                                                            body: JSON.stringify(newFriend)
                                                        });

                                                        console.log("response update user: " + response);
                                                        const updatedUser = await response.json();
                                                        console.log('User updated:', updatedUser);
                                                    } else {
                                                        console.log("pas de notif");
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error("Error:", error);
                                                });

                                            userConnected.friends.push(newFriend.id);
                                            fetch('/api/' + userConnected.email, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify(userConnected)
                                            })
                                                .then(response => response.json())
                                                .then(updatedUser => {
                                                    console.log('User updated:', updatedUser);
                                                    localStorage.setItem("user", JSON.stringify(updatedUser));
                                                })
                                                .catch(error => {
                                                    console.error('Error updating user:', error);
                                                });
                                            window.location = '/pages/friends/friends.html'
                                            alert("Request accepted !");
                                        } else {
                                            console.log("sender not found")
                                        }
                                    });

                            } else {
                                console.log("Annulation de l'ajout d'un ami");
                            }
                        });
                    } else if (notifTodisplay.nType === "gameRequest") {
                        li.addEventListener("click", async () => {
                            const confirmation = confirm("Voulez-vous jouer contre cet ami ?");
                            if (confirmation) {
                                localStorage.setItem("gameRequest", JSON.stringify(notifTodisplay));
                                window.location.href = "/pages/game-page/game-page.html"

                            } else {
                                console.log("Annulation de l'ajout d'un ami");
                            }
                        });
                    }
                    notificationsList.appendChild(li);
                } else {
                    const li = document.createElement("li");
                    li.textContent = "No notification found";
                    notificationsList.appendChild(li);
                }
            })
    }

    //update userConnected to see his new notifications
    fetch('/api/users/' + userConnected.username)
        .then(response => response.json())
        .then(userFound => {
            if (userFound) {
                localStorage.setItem("user", JSON.stringify(userFound.users[0]));
                userConnected = JSON.parse(localStorage.getItem("user"));
                console.log(userConnected);
                userConnected.notifications.forEach((idNotif) => {
                    displayNotification(idNotif, userConnected, notificationsList);
                });

                searchButton.addEventListener("click", () => {
                    displayNotification(searchInput.value, userConnected, notificationsList);
                });
            } else {
                console.log("user not found")
            }
        });

});