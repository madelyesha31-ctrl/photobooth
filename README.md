# S.E.E.D Photo Booth - Local Server

This folder contains the local server for the photobooth QR/save flow.

## Setup

1. Install Node.js from https://nodejs.org/
2. Open a terminal in this folder
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
5. The server runs on `http://0.0.0.0:3000`

## Usage

1. Open the photobooth app in a browser:
   - Same device: `http://localhost:3000`
   - Local network: `http://<your-pc-ip>:3000`
2. Tap **Server Settings** in the header
3. Enter your server URL, for example:
   - `http://localhost:3000` (same device)
   - `http://192.168.1.50:3000` (local network)
4. Save Settings
5. On the result screen, tap **Save to Server**, then **Show QR**

Customers scan the QR to open the strip image directly in their browser and save it.

## Network Notes

- Make sure the phone/tablet and the PC running the server are on the same Wi-Fi network.
- If using a local IP, use your PC's actual LAN IP, not `localhost`.
- Always open the photobooth from `http://<server-ip>:3000`, not as a local file, to avoid CORS/upload errors.
