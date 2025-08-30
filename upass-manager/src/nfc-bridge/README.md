# NFC Bridge Server for UPass Manager

This is a Node.js server that bridges the communication between NFC card readers and the UPass Manager web application. It uses WebSockets to provide real-time card detection events to the client.

For a detailed explanation of the architecture and data flow, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Prerequisites

- Node.js (v14 or higher)
- PC/SC middleware installed on your system:
  - Windows: PC/SC comes pre-installed
  - macOS: Install [PCSC-Lite](https://pcsclite.apdu.fr/)
  - Linux: Install `pcscd` and `libpcsclite-dev` packages

## Installation

1. Navigate to the NFC bridge directory:
   ```bash
   cd upass-manager/src/nfc-bridge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the NFC bridge server:
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

2. The server will start on port 3001 (or the port specified in the PORT environment variable).

3. Connect an NFC card reader to your computer. The server will automatically detect it.

4. When the UPass Manager application opens the NFCModal, it will automatically connect to the NFC bridge server via WebSockets.

5. When an NFC card is placed near the reader, the card number will be read and sent to the UPass Manager application.

## Testing

You can test the NFC bridge server without running the full UPass Manager application:

1. Start the NFC bridge server:
   ```bash
   npm start
   ```

2. In a separate terminal, run the test script:
   ```bash
   npm test
   ```
   or
   ```bash
   node test-nfc.js
   ```

3. The test script will connect to the NFC bridge server and display information about connected readers.

4. Place an NFC card near the reader to see the card number displayed in the terminal.

5. Press Ctrl+C to exit the test script.

## API Endpoints

- `GET /api/readers`: Get a list of connected NFC readers
- `GET /api/status`: Get the status of the NFC bridge server

## WebSocket Events

### Server to Client

- `readers`: List of available NFC readers
- `readerConnected`: Sent when a new NFC reader is connected
- `readerDisconnected`: Sent when an NFC reader is disconnected
- `cardDetected`: Sent when an NFC card is detected, includes the card number
- `cardRemoved`: Sent when an NFC card is removed from the reader
- `error`: Sent when an error occurs

### Client to Server

The client doesn't need to send any events to the server. The server automatically detects NFC readers and cards.

## Troubleshooting

For a comprehensive troubleshooting guide, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

### Check NFC Reader

You can check if your NFC card reader is properly recognized by the system without starting the full NFC bridge server:

```bash
npm run check-reader
```
or
```bash
node check-reader.js
```

This script will:
1. Initialize the PC/SC middleware
2. List any detected NFC readers
3. Allow you to test card detection by placing a card on the reader
4. Display detailed information about the reader and card

### Common Issues

- **No readers detected**: Make sure your NFC reader is properly connected and recognized by your operating system.
- **Cannot connect to server**: Make sure the NFC bridge server is running on the correct port.
- **Card not detected**: Make sure the card is properly placed on the reader and is compatible with the reader.
- **PC/SC initialization error**: Make sure the PC/SC middleware is installed and running on your system.

## License

This project is licensed under the MIT License.
