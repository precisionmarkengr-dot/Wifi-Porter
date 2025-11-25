function generate() {
  var ssid = document.getElementById('ssid').value;
  var password = document.getElementById('password').value;
  var security = document.getElementById('security').value;

  // Create custom setup link for NFC tag
  var setupUrl = `https://setup.precisionmarkengraving.com/?ssid=${encodeURIComponent(ssid)}&password=${encodeURIComponent(password)}&security=${encodeURIComponent(security)}`;
  document.getElementById('wifiString').value = setupUrl;

  // Make QR code
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

// This makes sure the function is available for your HTML button
window.generate = generate;
