var qrcode = new QRCode("qrcode", {
    // text: "http://jindo.dev.naver.com/collie",
    width: 256,
    height: 256,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
});

function makeCode () {

  // Grab url input
  elementText = document.getElementById("text");
  url = elementText.value
  
  // Check for non-empty url
  if (!url) {
    alert("Error: empty input");
    elementText.focus();
    return;
  }

  // Pad URL since we want more density
  maxLength = 40
  if (url.length < maxLength) {
    url += '?/' + '0'.repeat(maxLength - url.length)
  }

  qrcode.makeCode(url);

  // Manually draw canvas
  QRMatrix = qrcode._oQRCode.modules;
  QRLength = QRMatrix.length

  // Form canvas
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  ctx.fillStyle = "#DDDDDD";
  canvasLength = 10*QRLength
  canvas.width  = canvasLength;
  canvas.height = canvasLength;
  ctx.fillRect(0, 0, canvasLength, canvasLength);
  boxLength = canvasLength/QRLength

  black = "#000000";
  white = "#FFFFFF"

  // Populate canvas
  for (let i = 0; i < QRLength; i++) {

    for (let j = 0; j < QRLength; j++) {

      if (QRMatrix[i][j]) {
        ctx.fillStyle = black;
      } else {
        ctx.fillStyle = white;
      }
      ctx.fillRect(boxLength*i, boxLength*j, boxLength*(i+1), boxLength*(j+1));

    }

  }
}

