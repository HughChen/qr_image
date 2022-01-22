var qrcode = new QRCode("qrcode", {
  width: 256,
  height: 256,
  colorDark: "#000000",
  colorLight: "#ffffff",
  correctLevel: QRCode.CorrectLevel.H,
});

/**
 * Check whether bit at current position should be full sized.
 *
 * @param {i} The current bit's row.
 * @param {j} The current bit's column.
 * @param {QRLength} The length of the QR code.
 * @return {isPosition} Whether or not the current bit is safe to modify.
 */
function isSafeBit(i, j, QRLength) {

  // Currently hard coding position bits
  if (i < 8 && j < 8) {
    return false;
  } else if (i > QRLength - 9 && j < 8) {
    return false;
  } else if (i < 8 && j > QRLength - 9) {
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

  // Pad URL since we want more density
  maxLength = 40;
  if (url.length < maxLength) {
    url += "?/" + "0".repeat(maxLength - url.length);
  } 
  // else {
  //   alert("Input too long");
  //   elementText.focus();
  //   return;    
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
  canvasLength = bitLength * QRLength;
  canvas.width = canvasLength;
  canvas.height = canvasLength;

  // Set background of canvas
  ctx.fillStyle = "#DDDDDD";
  ctx.fillRect(0, 0, canvasLength, canvasLength);

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
      drawShape(ctx, i, j, bitLength, 0.25, QRLength);
    }
  }
}
