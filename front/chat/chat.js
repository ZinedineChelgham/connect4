const chatData = JSON.parse(localStorage.getItem('chatData'));

if (chatData) {
    // Chat data exists in localStorage, so display the chat window
    displayChatWindow(chatData);
}

function displayChatWindow(chatData) {
    const chatContainer = document.createElement("div");
    chatContainer.classList.add("chat-container");
    document.body.appendChild(chatContainer);

    const chatWindow = document.createElement("div");
    chatWindow.classList.add("chat-window");
    chatContainer.appendChild(chatWindow);

    const chatMessages = document.createElement("div");
    chatMessages.classList.add("chat-messages");
    chatWindow.appendChild(chatMessages);

    const socket = io('/api/game/friend');

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

    // Load the chat messages from localStorage
    if (chatData.messages) {
        for (const message of chatData.messages) {
            const messageElement = document.createElement("div");
            messageElement.textContent = message;
            chatMessages.appendChild(messageElement);
        }
    }
}
