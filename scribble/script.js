// Overlay
const overlay = document.getElementById("overlay");
document.body.addEventListener("click", () => {
    overlay.style.opacity = "0";
    setTimeout(() => {
        overlay.style.display = "none";
    }, 500);
});

const createGridBtn = document.getElementById("submit");
const box = document.getElementById("box");

// Tooltip system
function tooltip(text) {
    const tooltipDiv = document.querySelector(".tooltipDiv");
    tooltipDiv.textContent = text;
    tooltipDiv.style.opacity = "1";
    tooltipDiv.style.transform = "translateX(-50%) translateY(0px)";
    
    setTimeout(() => {
        tooltipDiv.style.opacity = "0";
        tooltipDiv.style.transform = "translateX(-50%) translateY(-70px)";
    }, 2000);
}

// Default Grid Generation
let defaultRows = 10;
let defaultColumns = 10;
box.style.gridTemplateColumns = `repeat(${defaultColumns}, 30px)`;
box.style.gridTemplateRows = `repeat(${defaultRows}, 30px)`;

let cells = [];
let isDrawing = false;
let selectedColor = 'red';

function createCellListeners(cell) {
    cell.addEventListener("click", () => {
        cell.style.background = selectedColor;
    });
    cell.addEventListener("mouseover", () => {
        if (isDrawing) {
            cell.style.background = selectedColor;
        }
    });
}

// Initial Grid Setup
for (let i = 0; i < defaultRows * defaultColumns; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    createCellListeners(cell);
    box.appendChild(cell);
}
cells = document.querySelectorAll(".cell");

// Drawing State
box.addEventListener("mousedown", (e) => {
    e.preventDefault(); // Prevent text selection
    isDrawing = true;
});
document.addEventListener("mouseup", () => {
    isDrawing = false;
});

// Dynamic Grid Generation
createGridBtn.addEventListener("click", function () {
    let rows = parseInt(document.getElementById("rows").value);
    let columns = parseInt(document.getElementById("columns").value);

    if (!rows || !columns || rows < 1 || columns < 1) {
        tooltip("Enter Valid Values, you are better than this!");
        return;
    }

    box.innerHTML = "";
    box.style.display = "grid";
    box.style.gridTemplateColumns = `repeat(${columns}, 30px)`;
    box.style.gridTemplateRows = `repeat(${rows}, 30px)`;

    for (let i = 0; i < rows * columns; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        createCellListeners(cell);
        box.appendChild(cell);
    }
    cells = document.querySelectorAll(".cell");
    const cellSize = document.getElementById("cellSize");
    cellSize.addEventListener("input", () => {
        console.log(cellSize.value);
        cells.forEach(cell => {
            cell.style.height = `${cellSize.value}px`;
            cell.style.width = `${cellSize.value}px`;
            box.style.gridTemplateColumns = `repeat(${columns}, ${cellSize.value}px)`;
            box.style.gridTemplateRows = `repeat(${rows}, ${cellSize.value}px)`;
        });
    });

});




// Color Palette
const colorRadios = document.querySelectorAll('input[name="color"]');
const colors = document.querySelectorAll(".color");

colors.forEach((color) => {
    const attr = color.getAttribute("for");
    color.style.background = attr;
});

colorRadios.forEach(radio => {
    radio.addEventListener("change", () => {
        selectedColor = radio.id;

        colorRadios.forEach(r => r.classList.remove("activeColor"));
        radio.classList.add("activeColor");

        // Remove highlight from custom color
        customColor.classList.remove("activeColor");
    });

    // Initial highlight on page load
    if (radio.checked) {
        radio.classList.add("activeColor");
    }
});

// Custom Color Support
const customColor = document.getElementById("customColor");
customColor.addEventListener("input", () => {
    selectedColor = customColor.value;

    colorRadios.forEach(r => r.classList.remove("activeColor"));
    customColor.classList.add("activeColor");
});

// Reset Button
const resetBtn = document.getElementById("reset");
resetBtn.addEventListener("click", () => {
    cells.forEach(cell => {
        cell.style.background = "white";
    });
});

// Fill All Button
const fillAllBtn = document.getElementById("fillAll");
fillAllBtn.addEventListener("click", () => {
    console.log("Fill All On");
    cells.forEach(cell => {
        cell.style.background = selectedColor;
    });
});

document.getElementById("saveImage").addEventListener("click", () => {
    const canvas = document.createElement("canvas");

    const cellsArray = document.querySelectorAll(".cell");
    const totalCells = cellsArray.length;

    const computedCols = getComputedStyle(box)
        .getPropertyValue("grid-template-columns")
        .split(" ").length;
    const computedRows = totalCells / computedCols;

    // Optional: read actual cell size if it's variable
    const firstCell = cellsArray[0];
    const cellStyle = getComputedStyle(firstCell);
    const cellSize = parseInt(cellStyle.width);

    canvas.width = computedCols * cellSize;
    canvas.height = computedRows * cellSize;

    const ctx = canvas.getContext("2d");

    cellsArray.forEach((cell, i) => {
        const x = (i % computedCols) * cellSize;
        const y = Math.floor(i / computedCols) * cellSize;

        const style = getComputedStyle(cell);
        const color = style.backgroundColor || "white";

        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);
    });

    // Save as PNG
    const link = document.createElement("a");
    link.download = "my-drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});
