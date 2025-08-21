let html5QrCode;

function startCamera() {
    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" }, // Use rear camera on mobile
        { fps: 10, qrbox: 250 },
        qrCodeMessage => {
            showResult(qrCodeMessage);
        },
        errorMessage => {
            // Ignore errors
        }
    ).catch(err => {
        alert("Camera start failed: " + err);
    });
}

function stopCamera() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            console.log("Camera stopped");
        }).catch(err => console.error(err));
    }
}

function showResult(text) {
    const resultDiv = document.getElementById("result");
    const copyBtn = document.getElementById("copy");
    resultDiv.innerHTML = `<b>QR Code Result:</b> ${text} 📋`;
    resultDiv.style.display = "block";

    resultDiv.onclick = () => {
        navigator.clipboard.writeText(text).then(() => {
            alert("Copied to clipboard");
        });
    };
}

// Image scanning from file
document.getElementById("fileInput").addEventListener("change", function(e) {
    if (e.target.files.length === 0) return;
    const file = e.target.files[0];
    scanImage(file);
});

// Drag & Drop
const dropArea = document.getElementById("dropArea");
dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
});
dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
});
dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
        scanImage(e.dataTransfer.files[0]);
    }
});
dropArea.addEventListener("click", () => {
    document.getElementById("fileInput").click();
});

const audio = new Audio("audio.mp3");

function scanImage(file) {
    const qrCode = new Html5Qrcode("reader");
    qrCode.scanFile(file, true)
        .then(decodedText => {
            showResult(decodedText);
            audio.play();
        })
        .catch(err => {
            alert("No QR code found in the image.");
            console.error(err);
        });
}