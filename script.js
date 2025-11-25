// Helper to read parameters from the URL
function getQueryParam(param) {
  let urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || "";
}

// Hide form for guests (if info is present in URL params)
function hideSetupFormIfGuest() {
  var ssid = getQueryParam('ssid');
  if (ssid) {
    var fields = ['instructions', 'ssid', 'password', 'security'];
    fields.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
    var setupBtn = document.querySelector('button[onclick="generate()"]');
    if (setupBtn) setupBtn.style.display = "none";
  }
}

// Auto-populate fields if URL contains Wi-Fi info, switch to guest mode if needed
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

// Generate setup URL and QR code
function generate() {
  var ssid = document.getElementById('ssid').value;
  var password = document.getElementById('password').value;
  var security = document.getElementById('security').value;

  // Create custom setup link for NFC tag
  var setupUrl = `https://setup.precisionmarkengraving.com/?ssid=${encodeURIComponent(ssid)}&password=${encodeURIComponent(password)}&security=${encodeURIComponent(security)}`;
  document.getElementById('wifiString').value = setupUrl;

  // Make QR code for Wi-Fi
  var qrString;
  if (security === 'nopass') {
    qrString = `WIFI:T:;S:${ssid};;`;
  } else {
    qrString = `WIFI:T:${security};S:${ssid};P:${password};;`;
  }
  document.getElementById('qrcode').innerHTML = "";
  QRCode.toCanvas(qrString, { width: 180 }, function (error, canvas) {
    if (!error) {
      document.getElementById('qrcode').appendChild(canvas);
    }
  });
}
window.generate = generate;

// RFC-compliant UUID for Apple mobileconfig PayloadUUID
function generateUUID() {
  // More reliable UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// iPhone Wi-Fi profile download
document.getElementById('downloadProfile').onclick = function() {
  var ssid = document.getElementById('ssid').value;
  var password = document.getElementById('password').value;
  var security = document.getElementById('security').value;
  var uuid = generateUUID();
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
        <string>wifi.porter.setup</string>
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
