document.addEventListener("DOMContentLoaded", function() {
    fetch("/api/allUsers")
        .then(response => response.json())
        .then(data => {
            console.log("all users :" + JSON.stringify(data));

            if (!Array.isArray(data)) {
                console.error("Data is not an array:", data);
                return;
            }
            data.sort((a, b) => b.ranking - a.ranking);

            const tableBody = document.querySelector("#userRankingTable tbody");

            let rank = 1; // initialize rank to 1
            for (let i = 0; i < data.length; i++) {
                const user = data[i];

                const newRow = document.createElement("tr");

                const rankCell = document.createElement("td");
                if (i > 0 && user.ranking !== data[i - 1].ranking) {
                    rank++;
                }
                rankCell.textContent = rank;
                newRow.appendChild(rankCell);

                const usernameCell = document.createElement("td");
                usernameCell.textContent = user.username;
                newRow.appendChild(usernameCell);

                const rankingCell = document.createElement("td");
                rankingCell.textContent = user.ranking;
                newRow.appendChild(rankingCell);
                tableBody.appendChild(newRow);
            }

            const topUsers = data.slice(0, 3);
            const usernameElements = document.querySelectorAll(".username");

            usernameElements.forEach((usernameElement, index) => {
                console.log(JSON.stringify(topUsers[index]));
                if (topUsers[index] === undefined) {
                    console.log("No user at index", index);
                    usernameElement.textContent = "";
                    return;
                }
                console.log("User at index", index, ":", topUsers[index].username);
                usernameElement.textContent = topUsers[index].username;
                console.log("Username element:", usernameElement);
            });

        })
        .catch(error => console.error("Error fetching data:", error));
});
