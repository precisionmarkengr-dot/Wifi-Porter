// Helper to read parameters from the URL
function getQueryParam(param) {
  let urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || "";
}

// Auto-populate fields if URL contains Wi-Fi info
window.onload = function() {
  var ssid = getQueryParam('ssid');
  var password = getQueryParam('password');
  var security = getQueryParam('security') || "WPA";
  if (ssid) document.getElementById('ssid').value = ssid;
  if (password) document.getElementById('password').value = password;
  document.getElementById('security').value = security;
  // If Wi-Fi info present, auto-generate QR/profile instantly
  if (ssid) generate();
};

// Generate setup URL, QR code
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

// iPhone Wi-Fi profile download button
document.getElementById('downloadProfile').onclick = function() {
  var ssid = document.getElementById('ssid').value;
  var password = document.getElementById('password').value;
  var security = document.getElementById('security').value;
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
    <string>12345678-1234-5678-1234-${Date.now()}</string>
  </dict>
</plist>`;
  var blob = new Blob([profile], {type: 'application/x-apple-aspen-config'});
  var link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'wifi.mobileconfig';
  link.click();
};

