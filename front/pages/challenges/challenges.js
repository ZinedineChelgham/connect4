document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("user from home page", user)
    const button = document.getElementById('3minChallenge');
    button.addEventListener('click', function (event) {
        if (!user) {
            alert("You must be logged in to challenge")
            return
        }
        event.preventDefault();
        localStorage.setItem("gameType", "3minChallenge")
        window.location.href = "/pages/game-page/game-page.html"
    });
    const button2 = document.getElementById('15MovesChallenge');
    button2.addEventListener('click', function (event) {
        if (!user) {
            alert("You must be logged in to challenge")
            return
        }
        event.preventDefault();
        localStorage.setItem("gameType", "15MovesChallenge")
        window.location.href = "/pages/game-page/game-page.html"
    });
})
