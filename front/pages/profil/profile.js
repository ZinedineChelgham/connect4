document.addEventListener("DOMContentLoaded", function () {
    const userConnected = JSON.parse(localStorage.getItem("user"));
    console.log(userConnected)
    const urlParams = new URLSearchParams(window.location.search);
    const userName = urlParams.get('id');
    console.log("nameoffriend: " + userName);

    if (userName === null || userName === undefined) {
        document.getElementById('username').textContent = userConnected.username;
        document.getElementById('email').textContent = userConnected.email;
        document.getElementById('ranking').textContent = userConnected.ranking;

        const completedChallenges = userConnected.challenges;

        if (completedChallenges.length === 0) {
            const noChallenges = document.createElement('p');
            document.getElementById('challenges').textContent = "0";
            //const challengesSpan = document.getElementById('challenges');
            //challengesSpan.appendChild(noChallenges);
        } else {

            // Create an icon for each completed challenge and append to the challenges span
            const challengesSpan = document.getElementById('challenges');
            completedChallenges.forEach(challenge => {
                console.log(challenge);
                const icon = document.createElement('i');
                icon.className = `fa-solid fa-trophy`;
                challengesSpan.appendChild(icon);
            });
        }

        const editBtn = document.getElementById("edit-profile-btn");
        editBtn.textContent = "Edit profile";
        editBtn.addEventListener("click", function () {
            window.location.href = "/pages/profil/edit-profile.html";
        });
        const playBtn = document.getElementById("play-btn");
        playBtn.style.display = "none";

        const chatBtn = document.getElementById("chat-btn");
        chatBtn.style.display = "none";

        const myChart = document.getElementById('myChart');
        myChart.style.boxShadow = "none";
        myChart.style.border = "none";
        myChart.style.backgroundColor = "transparent";

        if (userConnected.draws !== 0 || userConnected.wins !== 0 || userConnected.loses !== 0) {
            myChart.style.boxShadow = "0 0 10px 0 rgba(0, 0, 0, 0.5)";
            myChart.style.border = "10px";
            myChart.style.backgroundColor = "white";
            const data = {
                labels: ['Win(s)', 'Lose(s)', 'Draw(s)'],
                datasets: [{
                    data: [userConnected.wins, userConnected.loses, userConnected.draws],
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
                }]
            };

            const ctx = document.getElementById('myChart').getContext('2d');
            const myChart = new Chart(ctx, {
                type: 'pie',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        position: 'bottom',
                    }
                }
            });
        }
    } else {
        fetch('/api/users/' + userName)
            .then(response => response.json())
            .then(user => {
                    //get the first user of the array
                    user = user.users[0];
                    console.log(user);
                    document.getElementById('username').textContent = user.username;
                    document.getElementById('email').textContent = user.email;
                    document.getElementById('ranking').textContent = user.ranking;

                    const completedChallenges = user.challenges;

                    if (completedChallenges.length === 0) {
                        const noChallenges = document.createElement('p');
                        noChallenges.textContent = "No challenges completed yet...";
                        const challengesSpan = document.getElementById('challenges');
                        challengesSpan.appendChild(noChallenges);
                    } else {
                        // Create an icon for each completed challenge and append to the challenges span
                        const challengesSpan = document.getElementById('challenges');
                        completedChallenges.forEach(challenge => {
                            console.log(challenge);
                            const icon = document.createElement('i');
                            icon.className = `fa-solid fa-trophy`;
                            challengesSpan.appendChild(icon);
                        });
                    }

                    const myChart = document.getElementById('myChart');
                    myChart.style.boxShadow = "none";
                    myChart.style.border = "none";
                    myChart.style.backgroundColor = "transparent";


                    if (user.draws !== 0 || user.wins !== 0 || user.loses !== 0) {
                        myChart.style.boxShadow = "0 0 10px 0 rgba(0, 0, 0, 0.5)";
                        myChart.style.border = "10px";
                        myChart.style.backgroundColor = "white";

                        const data = {
                            labels: ['Wins', 'Loses', 'Draws'],
                            datasets: [{
                                data: [user.wins, user.loses, user.draws],
                                backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
                            }]
                        };

                        const ctx = document.getElementById('myChart').getContext('2d');
                        const myChart = new Chart(ctx, {
                            type: 'pie',
                            data: data
                        });
                    }

                    if (user === userConnected) {
                        // Get completed challenges from user object


                        const editBtn = document.getElementById("edit-profile-btn");
                        editBtn.textContent = "Edit profile";
                        editBtn.addEventListener("click", function () {
                            window.location.href = "/pages/profil/edit-profile.html";
                        });

                        const playBtn = document.getElementById("play-btn");
                        playBtn.style.display = "none";

                        const chatBtn = document.getElementById("chat-btn");
                        chatBtn.style.display = "none";


                    } else {
                        let isFriend = false;
                        if (user.friends !== undefined) {
                            user.friends.forEach(friend => {
                                if (friend === userConnected.id) {
                                    isFriend = true;
                                }
                            });
                        }
                        if (!isFriend) {
                            const chatBtn = document.getElementById("chat-btn");
                            chatBtn.style.display = "none";
                            const playBtn = document.getElementById("play-btn");
                            playBtn.style.display = "none";

                            const editBtn = document.getElementById("edit-profile-btn");
                            editBtn.textContent = "Add friend";
                            editBtn.addEventListener("click", async function () {
                                let friend = user;
                                const nDescription = "You have a new friend request from " + userConnected.username;
                                const nType = "friendRequest";
                                const nSender = userConnected.username;

                                const data = {nDescription, nType, nSender};

                                const options = {
                                    method: "POST",
                                    headers: {
                                        "Accept": "application/json",
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify(data)
                                };

                                console.log("---------- click on AddFriend------------")
                                fetch("/api/newNotif", options)
                                    .then(response => {
                                        console.log("response new notif: " + response);
                                        return response.json();
                                    })
                                    .then(async data => {
                                        console.log("response json new notif: " + JSON.stringify(data))
                                        if (data || data.notif) {
                                            console.log("notif renvoyée: " + data.notif.id);
                                            console.log("user: " + friend);
                                            console.log("user notifs: " + friend.notifications);

                                            if (friend.notifications === undefined) {
                                                friend.notifications = [];
                                            }

                                            console.log("user notifs après: " + friend.notifications);

                                            friend.notifications.push(data.notif.id);


                                            const response = await fetch('/api/' + friend.email, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify(friend)
                                            });

                                            console.log("response update user: " + response);
                                            const updatedUser = await response.json();
                                            console.log('User updated:', updatedUser);
                                            alert("Request sent successfully!");
                                            window.location = '../friends/friends.html'
                                        } else {
                                            console.log("pas de notif");
                                        }
                                    })
                                    .catch(error => {
                                        console.error("Error:", error);
                                    });

                                fetch("/api/allNotif")
                                    .then(response => {
                                        console.log("response all notifs: " + response)
                                        response.json()
                                    })
                                    .then(data => {
                                        console.log("all notifs :" + JSON.stringify(data));
                                    })
                                    .catch(error => console.error("Error fetching data:", error));

                                // save changes to database and redirect user back to profile page
                                // replace the alert below with code to save changes to the database
                                // window.location = '../friends/friends.html'
                                // alert("Request sent successfully!");
                            });
                        } else {
                            const editBtn = document.getElementById("edit-profile-btn");
                            editBtn.style.display = "none";

                            const playBtn = document.getElementById("play-btn");
                            playBtn.textContent = "Play";
                            playBtn.addEventListener("click", function () {
                                localStorage.setItem("gameType", "friend");
                                let friend = user;
                                const nDescription = userConnected.username + " wants to play with you";
                                const nType = "gameRequest";
                                const nSender = userConnected.email;

                                const data = {nDescription, nType, nSender};

                                const options = {
                                    method: "POST",
                                    headers: {
                                        "Accept": "application/json",
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify(data)
                                };

                                console.log("---------- click on Play------------")
                                fetch("/api/newNotif", options)
                                    .then(response => {
                                        console.log("response new notif: " + response);
                                        return response.json();
                                    })
                                    .then(async data => {
                                        console.log("response json new notif: " + JSON.stringify(data))
                                        if (data || data.notif) {
                                            console.log("notif renvoyée: " + data.notif.id);
                                            console.log("user: " + friend);
                                            console.log("user notifs: " + friend.notifications);

                                            if (friend.notifications === undefined) {
                                                friend.notifications = [];
                                            }

                                            console.log("user notifs après: " + friend.notifications);

                                            friend.notifications.push(data.notif.id);


                                            const response = await fetch('/api/' + friend.email, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify(friend)
                                            });

                                            console.log("response update user: " + response);
                                            const updatedUser = await response.json();
                                            console.log('User updated:', updatedUser);
                                            alert("Request sent successfully!");
                                        } else {
                                            console.log("pas de notif");
                                        }
                                    })
                                    .catch(error => {
                                        console.error("Error:", error);
                                    });
                                window.location.href = "/pages/game-page/game-page.html"
                            });

                            const chatBtn = document.getElementById("chat-btn");
                            chatBtn.addEventListener("click", function () {
                                const chatContainer = document.createElement("div");
                                chatContainer.classList.add("chat-container");
                                document.body.appendChild(chatContainer);

                                const chatWindow = document.createElement("div");
                                chatWindow.classList.add("chat-window");
                                chatContainer.appendChild(chatWindow);

                                const chatMessages = document.createElement("div");
                                chatMessages.classList.add("chat-messages");
                                chatWindow.appendChild(chatMessages);

                                const firstUserId = userConnected.id;
                                console.log("firstUserId: " + firstUserId);
                                const secondUserId = user.id;
                                console.log("secondUserId: " + secondUserId);
                                // const socket = io.connect('/api/game/friend?firstUserId=' + firstUserId + '&secondUserId=' + secondUserId);
                                const socket = io.connect('/api/game/friend', {
                                    query: {firstUserId, secondUserId}
                                });

                                const chatData = {
                                    messages: [],
                                    userJoined: false
                                };

                                if (!chatData.userJoined) {
                                    console.log("before emit userJoined")
                                    socket.emit("userJoined");
                                    chatData.userJoined = true;
                                }

                                console.log("before on message")
                                socket.on("message", function (message) {
                                    const messageElement = document.createElement("div");
                                    messageElement.textContent = message;
                                    chatMessages.appendChild(messageElement);
                                    chatData.messages.push(message);
                                    localStorage.setItem('chatData', JSON.stringify(chatData));
                                });

                                const chatForm = document.createElement("form");
                                chatWindow.appendChild(chatForm);

                                const chatInput = document.createElement("input");
                                chatInput.type = "text";
                                chatInput.placeholder = "Type a message...";
                                chatForm.appendChild(chatInput);

                                const chatSubmit = document.createElement("button");
                                chatSubmit.type = "submit";
                                chatSubmit.textContent = "Send";
                                chatForm.appendChild(chatSubmit);

                                const minimizeButton = document.createElement("button");
                                minimizeButton.classList.add("chat-minimize-btn");
                                minimizeButton.textContent = "-";
                                chatContainer.appendChild(minimizeButton);

                                const closeButton = document.createElement("button");
                                closeButton.classList.add("chat-close-btn");
                                chatContainer.appendChild(closeButton);

                                minimizeButton.addEventListener("click", function () {
                                    chatContainer.style.height = "30px";
                                    chatWindow.style.display = "none";
                                    minimizeButton.style.display = "none";
                                    maximizeButton.style.display = "block";
                                });

                                closeButton.addEventListener("click", function () {
                                    chatContainer.remove();
                                    localStorage.removeItem('chatData');
                                });

                                const maximizeButton = document.createElement("button");
                                maximizeButton.classList.add("chat-maximize-btn");
                                maximizeButton.textContent = "+";
                                maximizeButton.style.display = "none";
                                chatContainer.appendChild(maximizeButton);

                                maximizeButton.addEventListener("click", function () {
                                    chatContainer.style.height = "300px";
                                    chatWindow.style.display = "block";
                                    maximizeButton.style.display = "none";
                                    minimizeButton.style.display = "block";
                                });

                                console.log("before on submit")
                                chatForm.addEventListener("submit", function (event) {
                                    event.preventDefault();
                                    const message = chatInput.value;
                                    console.log("before emit message")
                                    socket.emit("message", message);
                                    chatInput.value = "";
                                    chatData.messages.push(message);
                                    localStorage.setItem('chatData', JSON.stringify(chatData));
                                });

                                // Load the chat data from localStorage
                                const savedData = localStorage.getItem('chatData');
                                if (savedData) {
                                    const parsedData = JSON.parse(savedData);
                                    if (parsedData && parsedData.messages && parsedData.messages.length > 0) {
                                        parsedData.messages.forEach((message) => {
                                            const messageElement = document.createElement("div");
                                            messageElement.textContent = message;
                                            chatMessages.appendChild(messageElement);
                                        });
                                        chatData.messages = parsedData.messages;
                                    }
                                }
                            });
                        }
                    }

                }
            )
            .catch(error => console.error(error));
    }
})
;
