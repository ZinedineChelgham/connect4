document.addEventListener("DOMContentLoaded", function() {
    let user = JSON.parse(localStorage.getItem("user"));
    console.log(user);

    const searchedFriendList = document.getElementById("searched-friends-list");
    const searchInput = document.getElementById("searchFriend");
    const searchButton = document.querySelector("button");

    const friendsList = document.getElementById("friends-list");

    fetch('/api/users/' + user.username)
        .then(response => response.json())
        .then(userFound => {
            if (userFound) {
                localStorage.setItem("user", JSON.stringify(userFound.users[0]));
                user = JSON.parse(localStorage.getItem("user"));
                //if friendsList is empty, display a message
                if (user.friends.length === 0) {
                    const li = document.createElement("li");
                    li.textContent = "No friends yet...";
                    li.style.fontFamily = "Gabriola";
                    li.style.fontFamily = "Cursive";
                    friendsList.appendChild(li);
                }

                fetch('/api/allUsers')
                    .then(response => response.json())
                    .then(allUsers => {
                            console.log("All users:", allUsers);
                            allUsers.forEach((userFound) => {
                                if (user.friends.includes(userFound.id)) {
                                    const li = document.createElement("li");
                                    li.textContent = userFound.username;
                                    li.addEventListener("click", () => {
                                        window.location.href = "/pages/profil/profile.html?id=" + userFound.username;
                                    });
                                    friendsList.appendChild(li);
                                }
                            });
                        }
                    );


                searchButton.addEventListener("click", async () => {

                    const searchValue = searchInput.value;

                    if (searchValue !== "") {
                        fetch('/api/users/' + searchValue)
                            .then(response => response.json())
                            .then(friendsFound => {
                                console.log("Friends found:", friendsFound);
                                if (friendsFound) {
                                    friendsFound.users.forEach((friend) => {
                                        const li = document.createElement("li");
                                        li.textContent = friend.username;
                                        li.addEventListener("click", () => {
                                            window.location.href = "/pages/profil/profile.html?id=" + friend.username;
                                        });
                                        searchedFriendList.appendChild(li);
                                    });
                                } else {
                                    const li = document.createElement("li");
                                    li.textContent = "No friends found";
                                    searchedFriendList.appendChild(li);
                                }
                            })
                            .catch(error => console.error(error));
                    }

                });
            }
        })
});