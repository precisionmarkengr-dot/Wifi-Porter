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
