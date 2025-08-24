const diceFaces = [
  "Assets/one.png",
  "Assets/two.png",
  "Assets/three.png",
  "Assets/four.png",
  "Assets/five.png",
  "Assets/six.png",
];
const audio = new Audio("Assets/diceRoll.mp3");

const diceContainer = document.getElementById("diceContainer");
const diceRange = document.getElementById("diceRange");
const diceCountLabel = document.getElementById("diceCount");
const shuffleButton = document.getElementById("shuffle");
const sumSpan = document.getElementById("sum");

let diceImgs = [];

function createDiceElements(count) {
  diceContainer.innerHTML = "";
  diceImgs = [];

  for (let i = 0; i < count; i++) {
    const img = document.createElement("img");
    img.src = "Assets/one.png";
    img.alt = `dice${i + 1}`;
    img.classList.add("dice");
    diceContainer.appendChild(img);
    diceImgs.push(img);
  }
}
function rollDice() {
  audio.play();
  audio.currentTime = 0;
  let sum = 0;
  let product = 1;

  diceImgs.forEach((dice) => dice.classList.add("shake"));
  let rollInterval = setInterval(() => {
    diceImgs.forEach((dice) => {
      dice.src = diceFaces[Math.floor(Math.random() * 6)];
    });
  }, 50);
  setTimeout(() => {
    clearInterval(rollInterval);
    diceImgs.forEach((dice) => {
      const result = Math.floor(Math.random() * 6);
      dice.src = diceFaces[result];
      dice.classList.remove("shake");
      sum += result + 1;
      product *= result + 1;
    });
    sumSpan.textContent = `Sum : ${sum} | Product: ${product}`;
  }, 1000);
}

// Spacebar support
document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    rollDice();
  }
});

// Range slider updates dice count
diceRange.addEventListener("input", () => {
  const count = parseInt(diceRange.value);
  diceCountLabel.textContent = count;
  createDiceElements(count);
});

// Initial setup
createDiceElements(parseInt(diceRange.value));
shuffleButton.addEventListener("click", rollDice);
