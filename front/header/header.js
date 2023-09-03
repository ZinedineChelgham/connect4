window.onload = () => {
    let user = localStorage.getItem("user");
    console.log(user)
    if (user !== 'undefined') {
        user = JSON.parse(user);
    }
    const navBarIcons = document.querySelectorAll(".navbar-right a i");
    console.log(navBarIcons)
    if (user) {
        navBarIcons[0].style.visibility = 'hidden';
        for (let i = 1; i < navBarIcons.length ; i++) {
            navBarIcons[i].style.visibility = 'visible';
        }

        navBarIcons[5].addEventListener("click", () => {
            localStorage.removeItem("user");
            localStorage.removeItem("chatData");
            window.location.href = '/';
        });
    } else {
        if(navBarIcons[0])navBarIcons[0].style.visibility = 'visible';
        for (let i = 1; i < navBarIcons.length ; i++) {
            navBarIcons[i].style.visibility = 'hidden';
        }
    }
}



