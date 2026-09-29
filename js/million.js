const millionButton = document.getElementById("million-button");
const removeButton = document.getElementById("remove-million-button");

millionButton.onmouseenter = function () {
    millionButton.style.position = "fixed";
    millionButton.style.left = Math.floor(Math.random() * 70) + "vw";
    millionButton.style.top = Math.floor(Math.random() * 70) + "vh";
};

removeButton.onclick = function () {
    millionButton.remove();
    removeButton.remove();
};