// Copy Setup URL
function copySetupUrl() {
  const txt = document.getElementById("wifiString").value.trim();
  if (!txt) {
    alert("Generate your link first.");
    return;
  }
  navigator.clipboard.writeText(txt).then(() => {
    alert("URL copied!");
  });
}

// Print WiFi Card (2.5in x 1.5in)
function printWifiCard() {
  const ssid = document.getElementById("ssid").value.trim();
  const password = document.getElementById("password").value.trim();
  const security = document.getElementById("security").value.trim();

  if (!ssid) return alert("Enter WiFi details first.");

  const qrData =
    security === "nopass"
      ? `WIFI:T:;S:${ssid};;`
      : `WIFI:T:${security};S:${ssid};P:${password};;`;

  const win = window.open("", "PrintWindow");

  win.document.write(`
  <html>
  <head>
    <title>Print WiFi Card</title>
    <style>
      @media print {
        body { margin: 0; }
      }
      .card {
        width: 2.5in;
        height: 1.5in;
        border: 2px dashed #000;
        padding: 4px;
        text-align: center;
        font-family: Arial, sans-serif;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      #qrcode canvas {
        display: block;
        margin: 0 auto;
      }
      .small-text {
        font-size: 10px;
        margin-top: 4px;
        line-height: 1.2;
      }
      .scissors {
        position: absolute;
        bottom: -6px;
        right: -6px;
        font-size: 14px;
      }
    </style>
  </head>
  <body>

    <div class="card">
      <div id="qrcode"></div>

      <div class="small-text">
        <b>SSID:</b> ${ssid}<br>
        <b>Password:</b> ${password || "(none)"}<br>
        <b>Security:</b> ${security}
      </div>

      <div class="scissors">✂️</div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
    <script>
      QRCode.toCanvas("${qrData}", { width: 80 }, function(err, canvas) {
        if (!err) {
          document.getElementById("qrcode").appendChild(canvas);
          window.print();
        }
      });
    </script>

  </body>
  </html>
  `);
}

