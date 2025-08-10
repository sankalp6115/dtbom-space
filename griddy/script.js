// Debounce helper
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.getElementById("sidebar");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const satBoostInput = document.getElementById("satBoost");
const satValueDisplay = document.getElementById("satValue");
const fileInput = document.getElementById("fileInput");
const urlInput = document.getElementById("urlInput");
const loadUrlBtn = document.getElementById("loadUrlBtn");
const downloadBtn = document.getElementById("downloadBtn");

let originalImage = new Image();
originalImage.crossOrigin = "anonymous";

sidebarToggle.onclick = () => {
  sidebar.classList.toggle("collapsed");
  resizeCanvasToFill();
  debouncedProcess();
};

window.addEventListener("resize", () => {
  resizeCanvasToFill();
  debouncedProcess();
});

satBoostInput.oninput = () => {
  satValueDisplay.textContent = parseFloat(satBoostInput.value).toFixed(2);
};

function resizeCanvasToFill() {
  const sidebarWidth = sidebar.classList.contains("collapsed")
    ? 0
    : sidebar.offsetWidth;
  const availableWidth = window.innerWidth - sidebarWidth - 20; // 20px right padding
  const availableHeight = window.innerHeight - 48 - 24; // header + some padding

  if (originalImage.width && originalImage.height) {
    let scale = Math.min(
      availableWidth / originalImage.width,
      availableHeight / originalImage.height
    );
    canvas.width = Math.floor(originalImage.width * scale);
    canvas.height = Math.floor(originalImage.height * scale);
  } else {
    canvas.width = availableWidth;
    canvas.height = availableHeight;
  }
}

function loadImageFromFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    originalImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function loadImageFromUrl(url) {
  originalImage.src = url;
}

fileInput.onchange = () => {
  if (fileInput.files.length > 0) {
    loadImageFromFile(fileInput.files[0]);
  }
};

loadUrlBtn.onclick = () => {
  if (urlInput.value.trim()) {
    loadImageFromUrl(urlInput.value.trim());
  }
};

originalImage.onload = () => {
  resizeCanvasToFill();
  debouncedProcess();
};

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) h = 0;
  else {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, v];
}

function hsvToRgb(h, s, v) {
  let c = v * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = v - c;
  let r1, g1, b1;
  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  return [(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255];
}

function boostSaturation(pixelData, factor) {
  let boosted = new Uint8ClampedArray(pixelData.length);
  for (let i = 0; i < pixelData.length; i += 4) {
    let r = pixelData[i];
    let g = pixelData[i + 1];
    let b = pixelData[i + 2];
    let a = pixelData[i + 3];
    let [h, s, v] = rgbToHsv(r, g, b);
    s = Math.min(s * factor, 1);
    let [nr, ng, nb] = hsvToRgb(h, s, v);
    boosted[i] = nr;
    boosted[i + 1] = ng;
    boosted[i + 2] = nb;
    boosted[i + 3] = a;
  }
  return boosted;
}

function processImage() {
  if (!originalImage.src) return;

  let m = parseInt(document.getElementById("gridM").value);
  let n = parseInt(document.getElementById("gridN").value);
  if (m < 1 || n < 1 || m > 100 || n > 100) return;

  let satBoost = parseFloat(document.getElementById("satBoost").value);
  let border = document.getElementById("border").checked;
  let borderColor = document.getElementById("borderColor").value;
  let borderWidth = parseInt(document.getElementById("borderWidth").value);

  let tileW = Math.floor(canvas.width / n);
  let tileH = Math.floor(canvas.height / m);
  let newWidth = tileW * n;
  let newHeight = tileH * m;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    originalImage,
    0,
    0,
    originalImage.width,
    originalImage.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let output = ctx.createImageData(canvas.width, canvas.height);

  for (let row = 0; row < m; row++) {
    for (let col = 0; col < n; col++) {
      let pixels = [];
      for (let y = 0; y < tileH; y++) {
        let idx = ((row * tileH + y) * canvas.width + col * tileW) * 4;
        for (let x = 0; x < tileW; x++) {
          let base = idx + x * 4;
          pixels.push(imgData.data[base]);
          pixels.push(imgData.data[base + 1]);
          pixels.push(imgData.data[base + 2]);
          pixels.push(imgData.data[base + 3]);
        }
      }
      let tileData = new Uint8ClampedArray(pixels);

      if (satBoost > 1) {
        tileData = boostSaturation(tileData, satBoost);
      }

      let sumR = 0,
        sumG = 0,
        sumB = 0;
      let count = tileW * tileH;
      for (let i = 0; i < tileData.length; i += 4) {
        sumR += tileData[i];
        sumG += tileData[i + 1];
        sumB += tileData[i + 2];
      }
      let avgR = sumR / count;
      let avgG = sumG / count;
      let avgB = sumB / count;

      for (let y = 0; y < tileH; y++) {
        for (let x = 0; x < tileW; x++) {
          let base = ((row * tileH + y) * canvas.width + (col * tileW + x)) * 4;
          output.data[base] = avgR;
          output.data[base + 1] = avgG;
          output.data[base + 2] = avgB;
          output.data[base + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(output, 0, 0);

  if (border) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    for (let i = 1; i < m; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * tileH);
      ctx.lineTo(newWidth, i * tileH);
      ctx.stroke();
    }
    for (let j = 1; j < n; j++) {
      ctx.beginPath();
      ctx.moveTo(j * tileW, 0);
      ctx.lineTo(j * tileW, newHeight);
      ctx.stroke();
    }
  }
}

const debouncedProcess = debounce(processImage, 300);

// Watch controls for changes, trigger debounced process
const inputsToWatch = [
  document.getElementById("gridM"),
  document.getElementById("gridN"),
  document.getElementById("satBoost"),
  document.getElementById("border"),
  document.getElementById("borderColor"),
  document.getElementById("borderWidth"),
];

inputsToWatch.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.id === "satBoost") {
      satValueDisplay.textContent = parseFloat(input.value).toFixed(2);
    }
    debouncedProcess();
  });
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) loadImageFromFile(fileInput.files[0]);
});

loadUrlBtn.addEventListener("click", () => {
  if (urlInput.value.trim()) loadImageFromUrl(urlInput.value.trim());
});

// Initial saturation label
satValueDisplay.textContent = parseFloat(satBoostInput.value).toFixed(2);


//Download logic
downloadBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const dataURL = canvas.toDataURL("image/jpeg", 1.0);

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas_image.jpeg";
    link.click();
});