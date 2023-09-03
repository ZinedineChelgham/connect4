function displayToast(msg, className){
    const toastMessage = document.createElement("div");
    toastMessage.setAttribute("id", "toast-message");
    toastMessage.classList.add(className)
    toastMessage.innerHTML = msg;
    let header = document.getElementsByTagName("header")[0];
    if(header){
        header.appendChild(toastMessage);
    }else{
        let body = document.getElementsByTagName("body")[0];
        body.prepend(toastMessage);
    }

// function to show the toast message
    function showToast() {
        toastMessage.style.display = 'block';
        setTimeout(hideToast, 1000); // hide the toast message after 3 seconds
    }

// function to hide the toast message
    function hideToast() {
        toastMessage.style.display = 'none';
    }
    showToast();
}


function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
