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

// QR FULLSCREEN MODAL
function showQrModal() {
  const qrDiv = document.getElementById("qrcode");
  const canvas = qrDiv.querySelector("canvas");
  if (!canvas) return alert("Generate a QR first.");

  const modal = document.getElementById("qrModal");
  const content = document.getElementById("qrModalContent");
  content.innerHTML = "";
  content.appendChild(canvas.cloneNode(true));

  modal.style.display = "flex";

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
