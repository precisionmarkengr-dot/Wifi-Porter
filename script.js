// Helper to read URL params
function getQueryParam(param) {
  let urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || "";
}

// Hide setup form when SSID is in URL
function hideSetupFormIfGuest() {
  var ssid = getQueryParam('ssid');
  if (ssid) {
    ['instructions','ssid','password','security'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
    const btn = document.querySelector('button[onclick="generate()"]');
    if (btn) btn.style.display = "none";
  }
}

// Load existing params
window.onload = function() {
  var ssid = getQueryParam('ssid');
  var password = getQueryParam('password');
  var security = getQueryParam('security') || "WPA";

  if (ssid) document.getElementById('ssid').value = ssid;
  if (password) document.getElementById('password').value = password;
  document.getElementById('security').value = security;

  hideSetupFormIfGuest();

  if (ssid) generate();
};

// VALIDATION
function validateForm() {
  let ssid = document.getElementById('ssid');
  let password = document.getElementById('password');
  let security = document.getElementById('security').value;

  ssid.classList.remove("error");
  password.classList.remove("error");

  let valid = true;

  if (ssid.value.trim() === "") {
    ssid.classList.add("error");
    valid = false;
  }

  if (security !== "nopass" && password.value.trim() === "") {
    password.classList.add("error");
    valid = false;
  }

  return valid;
}

// Generate Link + QR
function generate() {
  if (!validateForm()) return;

  var ssid = document.getElementById('ssid').value;
  var password = document.getElementById('password').value;
  var security = document.getElementById('security').value;

  var setupUrl = 
    `https://setup.precisionmarkengraving.com/?ssid=${encodeURIComponent(ssid)}&password=${encodeURIComponent(password)}&security=${encodeURIComponent(security)}`;

  document.getElementById('wifiString').value = setupUrl;

  var qrString = 
    security === 'nopass'
    ? `WIFI:T:;S:${ssid};;`
    : `WIFI:T:${security};S:${ssid};P:${password};;`;

  document.getElementById('qrcode').innerHTML = "";

  QRCode.toCanvas(qrString, { width: 300, margin: 2 }, function (error, canvas) {
    if (!error) document.getElementById('qrcode').appendChild(canvas);
  });
}

// MAKE generate() GLOBAL
window.generate = generate;

// COPY URL
function copySetupUrl() {
  const txt = document.getElementById("wifiString").value.trim();
  if (!txt) return alert("Generate your link first.");
  navigator.clipboard.writeText(txt).then(() => alert("URL copied!"));
}

// PASSWORD TOGGLE
document.addEventListener("DOMContentLoaded", () => {
  const eye = document.getElementById("togglePassword");
  const pwd = document.getElementById("password");

  eye.addEventListener("click", () => {
    pwd.type = pwd.type === "password" ? "text" : "password";
  });
});

// FIXED FULLSCREEN QR MODAL
function showQrModal() {
  const ssid = document.getElementById('ssid').value.trim();
  const password = document.getElementById('password').value.trim();
  const security = document.getElementById('security').value;

  if (!ssid) return alert("Generate a QR first.");

  const qrData =
    security === "nopass"
    ? `WIFI:T:;S:${ssid};;`
    : `WIFI:T:${security};S:${ssid};P:${password};;`;

  const modal = document.getElementById("qrModal");
  const content = document.getElementById("qrModalContent");
  content.innerHTML = ""; // clear old QR in modal

  // Generate a fresh large QR for modal
  QRCode.toCanvas(qrData, { width: 300, margin: 2 }, function (err, canvas) {
    if (!err) {
      content.appendChild(canvas);
      modal.style.display = "flex";
    }
  });

  modal.onclick = function() {
    modal.style.display = "none";
  };
}

// PRINT CARD
function printWifiCard() {
  const ssid = document.getElementById("ssid").value.trim();
  const password = document.getElementById("password").value.trim();
  const security = document.getElementById("security").value;

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
      @media print { body { margin: 0; } }
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
      #qrcode canvas { display: block; margin: 0 auto; }
      .small-text { font-size: 10px; margin-top: 4px; line-height: 1.2; }
      .scissors { position: absolute; bottom: -6px; right: -6px; font-size: 14px; }
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

// ANDROID: Copy password
function copyWifi() {
  var password = document.getElementById('password').value.trim();
  navigator.clipboard.writeText(password).then(() => alert("Password copied!"));
}

// ANDROID: Open WiFi settings
function openWifiSettings() {
  window.location.href = "intent:#Intent;action=android.settings.WIFI_SETTINGS;end";
}

// iPhone Profile Download — Wrapped safely
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById('downloadProfile');
  if (!btn) return;

  btn.onclick = function() {
    var ssid = document.getElementById('ssid').value;
    var password = document.getElementById('password').value;
    var security = document.getElementById('security').value;
    var uuid = generateUUID();
    var wifiUuid = generateUUID();

    var profile =
`<?xml version="1.0" encoding="UTF-8"?> 
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>PayloadContent</key>
    <array>
      <dict>
        <key>EncryptionType</key>
        <string>${security === 'nopass' ? '' : security}</string>
        <key>Password</key>
        <string>${security === 'nopass' ? '' : password}</string>
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

    var blob = new Blob([profile], {type: 'application/x-apple-aspen-config'});
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'wifi.mobileconfig';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
});

// RFC-compliant UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
