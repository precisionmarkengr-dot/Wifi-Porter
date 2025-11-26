// Helper to read params
function getQueryParam(param) {
  let params = new URLSearchParams(window.location.search);
  return params.get(param) || "";
}

// Hide form when coming from NFC link
function hideSetupFormIfGuest() {
  if (getQueryParam('ssid')) {
    ["instructions","ssid","password","security"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  }
}

// On load
window.onload = function() {
  let ssid = getQueryParam('ssid');
  let pwd = getQueryParam('password');
  let security = getQueryParam('security') || "WPA";

  if (ssid) document.getElementById('ssid').value = ssid;
  if (pwd) document.getElementById('password').value = pwd;

  document.getElementById('security').value = security;

  hideSetupFormIfGuest();
  if (ssid) generate();
};

// Validation
function validateForm() {
  let ssid = document.getElementById('ssid');
  let pwd = document.getElementById('password');
  let security = document.getElementById('security').value;

  ssid.classList.remove("error");
  pwd.classList.remove("error");

  let ok = true;

  if (ssid.value.trim() === "") {
    ssid.classList.add("error");
    ok = false;
  }

  if (security !== "nopass" && pwd.value.trim() === "") {
    pwd.classList.add("error");
    ok = false;
  }

  return ok;
}

// PME Logo for QR overlay
const logoSrc = "logo.png";

// Main generate function
function generate() {
  if (!validateForm()) return;

  let ssid = document.getElementById('ssid').value;
  let pwd = document.getElementById('password').value;
  let security = document.getElementById('security').value;

  let setupUrl = 
    `https://setup.precisionmarkengraving.com/?ssid=${encodeURIComponent(ssid)}&password=${encodeURIComponent(pwd)}&security=${encodeURIComponent(security)}`;

  document.getElementById('wifiString').value = setupUrl;

  let qrData = security === "nopass"
    ? `WIFI:T:;S:${ssid};;`
    : `WIFI:T:${security};S:${ssid};P:${pwd};;`;

  const qrDiv = document.getElementById("qrcode");
  qrDiv.innerHTML = "";

  // Base QR
  QRCode.toCanvas(qrData, { width: 300, margin: 2 }, function (err, canvas) {
    if (err) return;

    // Overlay PME logo
    overlayLogo(canvas);
    qrDiv.appendChild(canvas);
  });
}

// Add PME logo to QR canvas
function overlayLogo(canvas) {
  let ctx = canvas.getContext("2d");
  let size = canvas.width * 0.10;  // 10% size
  let x = (canvas.width - size) / 2;
  let y = (canvas.height - size) / 2;

  const logo = new Image();
  logo.src = logoSrc;

  logo.onload = () => {
    // draw white circle background for logo clarity
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, size/1.8, 0, Math.PI*2);
    ctx.fill();

    ctx.drawImage(logo, x, y, size, size);
  };
}

// Copy URL
function copySetupUrl() {
  const txt = document.getElementById("wifiString").value.trim();
  if (!txt) return alert("Generate your link first.");
  navigator.clipboard.writeText(txt).then(() => alert("URL copied!"));
}

// Password toggle
document.addEventListener("DOMContentLoaded", () => {
  const eye = document.getElementById("togglePassword");
  const pwd = document.getElementById("password");

  eye.onclick = () => {
    pwd.type = pwd.type === "password" ? "text" : "password";
  };
});

// Fullscreen QR modal
function showQrModal() {
  let ssid = document.getElementById('ssid').value.trim();
  let pwd = document.getElementById('password').value.trim();
  let security = document.getElementById('security').value;

  if (!ssid) return alert("Generate your QR first.");

  let qrData =
    security === "nopass"
      ? `WIFI:T:;S:${ssid};;`
      : `WIFI:T:${security};S:${ssid};P:${pwd};;`;

  const modal = document.getElementById("qrModal");
  const content = document.getElementById("qrModalContent");
  const close = document.querySelector(".close-btn");

  content.innerHTML = "";

  QRCode.toCanvas(qrData, { width: 300, margin: 2 }, function (err, canvas) {
    if (!err) {
      overlayLogo(canvas);
      content.appendChild(canvas);
      modal.style.display = "flex";
    }
  });

  close.onclick = () => { modal.style.display = "none"; };
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
}

// Print mini Wi-Fi card
function printWifiCard() {
  let ssid = document.getElementById("ssid").value.trim();
  let pwd = document.getElementById("password").value.trim();
  let security = document.getElementById("security").value;

  if (!ssid) return alert("Enter WiFi details first.");

  let qrData =
    security === "nopass"
      ? `WIFI:T:;S:${ssid};;`
      : `WIFI:T:${security};S:${ssid};P:${pwd};;`;

  const win = window.open("", "PrintWindow");

  win.document.write(`
  <html>
  <head>
    <title>Print WiFi Card</title>
    <style>
      @media print { body { margin: 0; } }
      .card {
        width: 2.5in;
        height: 1.5in;
        border: 2px dashed #000;
        padding: 4px;
        text-align: center;
        font-family: Arial, sans-serif;
        position: relative;
      }
      .small-text { font-size: 10px; line-height: 1.2; }
      .scissors { position: absolute; bottom: -6px; right: -6px; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="card">
      <div id="qrcodePrint"></div>
      <div class="small-text">
        <b>SSID:</b> ${ssid}<br>
        <b>Password:</b> ${pwd || "(none)"}<br>
        <b>Security:</b> ${security}
      </div>
      <div class="scissors">✂️</div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
    <script>
      const logo = "${logoSrc}";
      QRCode.toCanvas("${qrData}", { width: 80 }, (err, canvas) => {
        if (!err) {
          const ctx = canvas.getContext("2d");
          const img = new Image();
          img.src = logo;
          img.onload = () => {
            const size = canvas.width * 0.10;
            const x = (canvas.width - size)/2;
            const y = (canvas.height - size)/2;

            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, size/1.8, 0, Math.PI*2);
            ctx.fill();

            ctx.drawImage(img, x, y, size, size);
            document.getElementById("qrcodePrint").appendChild(canvas);
            window.print();
          };
        }
      });
    </script>

  </body>
  </html>
  `);
}

// Android
function copyWifi() {
  let pwd = document.getElementById('password').value.trim();
  navigator.clipboard.writeText(pwd).then(() => alert("Password copied!"));
}

function openWifiSettings() {
  window.location.href = "intent:#Intent;action=android.settings.WIFI_SETTINGS;end";
}

// UUID generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, c => {
      let r = Math.random()*16 | 0;
      let v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
}

// Mobileconfig (iPhone)
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("downloadProfile");
  if (!btn) return;

  btn.onclick = function() {
    let ssid = document.getElementById('ssid').value;
    let pwd = document.getElementById('password').value;
    let security = document.getElementById('security').value;
    let uuid = generateUUID();
    let wifiUuid = generateUUID();

    let profile =
`<?xml version="1.0" encoding="UTF-8"?> 
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>PayloadContent</key>
    <array>
      <dict>
        <key>EncryptionType</key>
        <string>${security === "nopass" ? "" : security}</string>
        <key>Password</key>
        <string>${security === "nopass" ? "" : pwd}</string>
        <key>SSID_STR</key>
        <string>${ssid}</string>
        <key>PayloadType</key>
        <string>com.apple.wifi.managed</string>
        <key>PayloadVersion</key>
        <integer>1</integer>
        <key>PayloadIdentifier</key>
        <string>wifi.porter.setup.wifi</string>
        <key>PayloadUUID</key>
        <string>${wifiUuid}</string>
        <key>PayloadDisplayName</key>
        <string>Wi-Fi Porter Setup</string>
        <key>AutoJoin</key>
        <true/>
      </dict>
    </array>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
    <key>PayloadIdentifier</key>
    <string>wifi.porter.setup</string>
    <key>PayloadDisplayName</key>
    <string>Wi-Fi Porter Setup</string>
    <key>PayloadDescription</key>
    <string>Configures Wi-Fi settings</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadUUID</key>
    <string>${uuid}</string>
  </dict>
</plist>`;

    let blob = new Blob([profile], { type: "application/x-apple-aspen-config" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "wifi.mobileconfig";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
});
