/**
 * Section: Uploading Images
 */

var imageLoader = document.getElementById("imageLoader");
imageLoader.addEventListener("change", handleImage, false);
var uploadCanvas = document.getElementById("imageCanvas");
var uploadContext = uploadCanvas.getContext("2d");

uploadWidth = 200;
uploadHeight = 200;

uploadCanvas.width = uploadWidth;
uploadCanvas.height = uploadHeight;

img = false;

function handleImage(e) {
  var reader = new FileReader();
  reader.onload = function (event) {
    img = new Image();
    img.onload = function () {
      uploadContext.clearRect(0, 0, uploadWidth, uploadHeight);
      uploadContext.drawImage(img, 0, 0, uploadWidth, uploadHeight);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
}

/**
 * Section: Initialize qrcode and canvas
 */

var canvas = false;

var qrcode = new QRCode("qrcode", {
  width: 256,
  height: 256,
  colorDark: "#000000",
  colorLight: "#ffffff",
  correctLevel: QRCode.CorrectLevel.L,
});

/**
 * Section: Code to handle inputs (e.g., sliders)
 */

// Size of QR Code squares
var sizeSlider = document.getElementById("radiusSize");
var sizeOutput = document.getElementById("printSize");

// Display the default slider value and grab it
sizeOutput.innerHTML = sizeSlider.value;
var radiusRatio = sizeSlider.value / 200;

// Update the current slider value
sizeSlider.oninput = function () {
  sizeOutput.innerHTML = this.value;
  radiusRatio = this.value / 200;
};

// Level of error correction (low, medium, high) (excluding quartile)
var correctionSlider = document.getElementById("errorCorrection");
var correctionOutput = document.getElementById("printCorrection");

// Display the default slider value and grab it
correctionOutput.innerHTML = correctionSlider.value;
var correctionLevel = correctionSlider.value;
if (correctionLevel === "1") {
  qrcode._htOption.correctLevel = QRCode.CorrectLevel.L;
} else if (correctionLevel === "2") {
  qrcode._htOption.correctLevel = QRCode.CorrectLevel.M;
} else if (correctionLevel === "3") {
  qrcode._htOption.correctLevel = QRCode.CorrectLevel.H;
}

// Update the current slider value
correctionSlider.oninput = function () {
  correctionOutput.innerHTML = this.value;
  correctionLevel = correctionSlider.value;
  if (correctionLevel === "1") {
    qrcode._htOption.correctLevel = QRCode.CorrectLevel.L;
  } else if (correctionLevel === "2") {
    qrcode._htOption.correctLevel = QRCode.CorrectLevel.M;
  } else if (correctionLevel === "3") {
    qrcode._htOption.correctLevel = QRCode.CorrectLevel.H;
  }
};

// Size of white border (quiet zone)
var borderSlider = document.getElementById("borderSize");
var borderOutput = document.getElementById("printBorderSize");
borderOutput.innerHTML = borderSlider.value; // Display the default slider value
var borderSizeValue = Number(borderSlider.value);

// Update the current slider value (each time you drag the slider handle)
borderSlider.oninput = function () {
  borderOutput.innerHTML = this.value;
  borderSizeValue = Number(this.value);
};

/**
 * Section: Helper functions for visualizing QR code
 */

/**
 * Check whether bit at current position should be full sized.
 * In particular, make the position bits (corners) full sized.
 *
 * @param {i} The current bit's row.
 * @param {j} The current bit's column.
 * @param {QRLength} The length of the QR code.
 * @return {isPosition} Whether or not the current bit is safe to modify.
 */
function isSafeBit(i, j, QRLength) {
  // Currently hard coding position bits
  lowerLimit = 7 + borderSizeValue;
  upperLimit = QRLength - 8 + borderSizeValue;
  if (i < lowerLimit && j < lowerLimit) {
    return false;
  } else if (i > upperLimit && j < lowerLimit) {
    return false;
  } else if (i < lowerLimit && j > upperLimit) {
    return false;
  }

  return true;
}

/**
 * Draw basic shape representing each bit of the QR code.
 *
 * @param {ctx} Context of associated canvas.
 * @param {i} The current bit's row.
 * @param {j} The current bit's column.
 * @param {bitLength} The maximum length of each bit.
 * @param {radiusRatio} The radius should be this ratio times the bitLength.
 *  The ratio should be between 0 and 0.5.
 * @param {QRLength} The length of the QR code.
 */
function drawShape(ctx, i, j, bitLength, radiusRatio, QRLength) {
  // Draw centered
  xCenter = bitLength * (i + 0.5);
  yCenter = bitLength * (j + 0.5);

  if (!isSafeBit(i, j, QRLength)) {
    radiusRatio = 0.5;
  }
  radius = bitLength * radiusRatio;

  ctx.fillRect(xCenter - radius, yCenter - radius, 2 * radius, 2 * radius);
}

/**
 * Download the QR code as a PNG
 */
function download() {
  // Download image
  if (!canvas) {
    alert("Error: no QR code to download");
    return;
  }
  var link = document.getElementById("link");
  link.setAttribute("download", "qr_image.png");
  link.setAttribute(
    "href",
    canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
  );
  link.click();
}

/**
 * Make the QR code
 */
function makeCode() {
  // Grab url input
  elementText = document.getElementById("text");
  url = elementText.value;

  // Check for non-empty url
  if (!url) {
    alert("Error: empty input");
    elementText.focus();
    return;
  }

  // // Pad URL since we want more density
  // maxLength = 40;
  // if (url.length < maxLength) {
  //   url += "?/" + "0".repeat(maxLength - url.length);
  // }

  // Generate URL bits
  qrcode.makeCode(url);

  // Manually draw canvas
  QRMatrix = qrcode._oQRCode.modules;
  QRLength = QRMatrix.length;

  // Form canvas
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");

  // QR code sizing
  bitLength = 10;
  canvasLength = bitLength * (QRLength + borderSizeValue * 2);
  canvas.width = canvasLength;
  canvas.height = canvasLength;

  // Set background of canvas
  if (document.getElementById("whitebackground").checked) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasLength, canvasLength);
  }

  // Set image of code
  if (img) {
    ctx.drawImage(
      img,
      bitLength * borderSizeValue,
      bitLength * borderSizeValue,
      bitLength * QRLength,
      bitLength * QRLength
    );
  }

  // Colors of true and false bits
  black = "#000000";
  white = "#FFFFFF";

  // Populate canvas with bits
  for (let i = 0; i < QRLength; i++) {
    for (let j = 0; j < QRLength; j++) {
      if (QRMatrix[i][j]) {
        ctx.fillStyle = black;
      } else {
        ctx.fillStyle = white;
      }
      drawShape(
        ctx,
        j + borderSizeValue,
        i + borderSizeValue,
        bitLength,
        radiusRatio,
        QRLength
      );
    }
  }
}
