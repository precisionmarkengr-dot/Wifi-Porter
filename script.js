function generate() {
  const ssid = document.getElementById("ssid").value.trim();
  const password = document.getElementById("password").value.trim();
  const security = document.getElementById("security").value;

  if (!ssid) {
    alert("SSID is required");
    return;
  }

  // WiFi format string
  const wifiString = `WIFI:T:${security};S:${ssid};P:${password};;`;

  document.getElementById("wifiString").value = wifiString;

  // Generate QR code
  document.getElementById("qrcode").innerHTML = "";
  QRCode.toCanvas(wifiString, { width: 200 }, (err, canvas) => {
    if (err) console.error(err);
    document.getElementById("qrcode").appendChild(canvas);
  });
}
