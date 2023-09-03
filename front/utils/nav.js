// This file is used to load the navbar into the page
(async function() {
    const response = await fetch('/header/header.html');
    const text = await response.text();
    const oldelem = document.querySelector("script#replace_with_navbar");
    const newelem = document.createElement("nav");
    newelem.innerHTML = text;
    oldelem.parentNode.replaceChild(newelem, oldelem);
})();
