// ====== Centralized settings ======
const qrSettings = {
    data: "https://github.com/sankalp6115",
    size: "500x500",
    ecc: "H",
    qzone: 4,
    color: "000000",
    format: "png",
    bgcolor: "FFFFFF",
};

let stickerImage = null;

// Generate QR code URL
function getQrUrl() {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrSettings.data)}&size=${qrSettings.size}&ecc=${qrSettings.ecc}&qzone=${qrSettings.qzone}&color=${qrSettings.color}&format=${qrSettings.format}&bgcolor=${qrSettings.bgcolor}`;
}

// Merge sticker into QR
function mergeStickerIntoQr(qrImgElement) {
    const canvas = document.createElement("canvas");
    const size = 500;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Draw QR code
    ctx.drawImage(qrImgElement, 0, 0, size, size);

    if (stickerImage) {
        const stickerSize = size * 0.25;
        const stickerX = (size - stickerSize) / 2;
        const stickerY = (size - stickerSize) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, stickerSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(stickerImage, stickerX, stickerY, stickerSize, stickerSize);
        ctx.restore();
    }

    // Replace QR image with merged result
    const mergedUrl = canvas.toDataURL(`image/${qrSettings.format}`);
    qrImgElement.src = mergedUrl;
}

// Update QR image (auto-merge sticker if exists)
function updateQrImage() {
    const qrImg = document.getElementById("barcode");
    qrImg.crossOrigin = "anonymous";  
    qrImg.src = getQrUrl();

    qrImg.onload = function() {
        if (stickerImage) {
            mergeStickerIntoQr(qrImg);
        }
    };
}

// ====== Main logic ======
$(document).ready(function () {
    updateQrImage();

    $(".generate").click(function () {
        qrSettings.data = $("#text").val() || "https://github.com/sankalp6115";
        updateQrImage();
    });

    $(".download").click(function () {
        const qrImg = document.getElementById("barcode");
        const link = document.createElement("a");
        link.href = qrImg.src;
        link.download = `qr_code.${qrSettings.format}`;  
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    $(document).on("keydown", function (event) {
        if (event.key === "Enter") {
            $(".generate").click();
        }
    });

    $("#fgColorPicker").on("input", function () {
        qrSettings.color = $(this).val().substring(1).toUpperCase();
        updateQrImage();
    });

    $("#bgColorPicker").on("input", function () {
        qrSettings.bgcolor = $(this).val().substring(1).toUpperCase();
        updateQrImage();
    });

    $("#format").on("change", function () {
        qrSettings.format = $(this).val();
        updateQrImage();
    });

    $("#stickerUpload").on("change", function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            stickerImage = new Image();
            stickerImage.src = e.target.result;
            stickerImage.onload = function () {
                mergeStickerIntoQr(document.getElementById("barcode"));
            };
        };
        reader.readAsDataURL(file);
    });
});

const codeimage = document.getElementById("barcode");
console.log(codeimage.src);