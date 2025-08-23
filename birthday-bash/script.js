const birthDate = new Date(2025, 6, 12, 23, 10, 0); // 12 July 2025, 11:10 PM

function updateAge() {
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    document.getElementById('ageText').textContent =
        `${years} Years, ${months} Months, ${days} Days`;
}

function updateCountdown() {
    const now = new Date();
    let nextBirthday = new Date(birthDate);
    nextBirthday.setFullYear(now.getFullYear());

    if (now > nextBirthday) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }

    let diff = nextBirthday - now;
    if (diff < 0) diff = 0;

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)) % 30;
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30)) % 12;
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));

    flip(document.getElementById("years"), years);
    flip(document.getElementById("months"), months);
    flip(document.getElementById("days"), days);
    flip(document.getElementById("hours"), hours);
    flip(document.getElementById("minutes"), minutes);
    flip(document.getElementById("seconds"), seconds);
}

function flip(flipCard, newNumber) {
    const currentNumber = parseInt(flipCard.dataset.number, 10);
    if (newNumber === currentNumber) return;
    flipCard.dataset.number = newNumber;

    const topHalf = document.createElement("div");
    topHalf.classList.add("top");
    topHalf.textContent = String(currentNumber).padStart(2, "0");

    const bottomHalf = document.createElement("div");
    bottomHalf.classList.add("bottom");
    bottomHalf.textContent = String(newNumber).padStart(2, "0");

    const topFlip = document.createElement("div");
    topFlip.classList.add("top-flip");
    topFlip.textContent = String(currentNumber).padStart(2, "0");

    const bottomFlip = document.createElement("div");
    bottomFlip.classList.add("bottom-flip");
    bottomFlip.textContent = String(newNumber).padStart(2, "0");

    topFlip.addEventListener("animationstart", () => {
        topHalf.textContent = String(newNumber).padStart(2, "0");
    });
    topFlip.addEventListener("animationend", () => {
        topFlip.remove();
    });
    bottomFlip.addEventListener("animationend", () => {
        bottomHalf.textContent = String(newNumber).padStart(2, "0");
        bottomFlip.remove();
    });

    flipCard.innerHTML = "";
    flipCard.appendChild(topHalf);
    flipCard.appendChild(bottomHalf);
    flipCard.appendChild(topFlip);
    flipCard.appendChild(bottomFlip);
}

// Initialize
document.querySelectorAll(".flip-card").forEach(card => {
    card.dataset.number = 0;
    const topHalf = document.createElement("div");
    topHalf.classList.add("top");
    topHalf.textContent = "00";

    const bottomHalf = document.createElement("div");
    bottomHalf.classList.add("bottom");
    bottomHalf.textContent = "00";

    card.appendChild(topHalf);
    card.appendChild(bottomHalf);
});

setInterval(() => {
    updateAge();
    updateCountdown();
}, 1000);

updateAge();
updateCountdown();
