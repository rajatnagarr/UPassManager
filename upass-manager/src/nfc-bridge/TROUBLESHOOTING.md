# NFC Integration Troubleshooting Guide

This guide provides solutions for common issues you might encounter when using the NFC integration in the UPass Manager application.

## Prerequisites Check

Before troubleshooting specific issues, make sure you have the following prerequisites installed:

1. **Node.js** (v14 or higher)
2. **PC/SC middleware**:
   - Windows: PC/SC comes pre-installed
   - macOS: Install [PCSC-Lite](https://pcsclite.apdu.fr/)
   - Linux: Install `pcscd` and `libpcsclite-dev` packages

## Quick Check

Run the NFC reader check script to verify that your system can detect your NFC card reader:

```bash
cd src/nfc-bridge
npm run check-reader
```

This script will:
- Initialize the PC/SC middleware
- List any detected NFC readers
- Allow you to test card detection

## Common Issues and Solutions

### No NFC Readers Detected

**Symptoms**:
- The check-reader.js script shows "No NFC readers detected"
- The NFC bridge server doesn't detect any readers
- The NFCModal in the UPass Manager application shows "No NFC readers detected"

**Solutions**:

1. **Check physical connection**:
   - Make sure the NFC reader is properly connected to your computer
   - Try a different USB port
   - Try a different USB cable if possible

2. **Check driver installation**:
   - Windows: Open Device Manager and check if the reader appears under "Smart card readers"
   - macOS: Run `system_profiler SPUSBDataType` in Terminal to check if the reader is listed
   - Linux: Run `lsusb` to check if the reader is listed

3. **Restart PC/SC service**:
   - Windows: Restart the "Smart Card" service in Services
   - macOS: Run `sudo killall pcscd && sudo pcscd`
   - Linux: Run `sudo systemctl restart pcscd`

4. **Reinstall PC/SC middleware**:
   - Windows: PC/SC comes pre-installed, but you may need to update Windows
   - macOS: Reinstall PCSC-Lite
   - Linux: Run `sudo apt-get install --reinstall pcscd libpcsclite-dev` (Ubuntu/Debian) or equivalent for your distribution

### Cannot Connect to NFC Bridge Server

**Symptoms**:
- The NFCModal in the UPass Manager application shows "Failed to connect to NFC server"
- The test-nfc.js script shows "Connection error"

**Solutions**:

1. **Check if the NFC bridge server is running**:
   - Open a terminal and run `cd src/nfc-bridge && npm start`
   - Check if there are any error messages

2. **Check port availability**:
   - The NFC bridge server runs on port 3001 by default
   - Make sure no other application is using this port
   - You can check with:
     - Windows: `netstat -ano | findstr 3001`
     - macOS/Linux: `lsof -i :3001`

3. **Check firewall settings**:
   - Make sure your firewall allows connections on port 3001
   - Try temporarily disabling your firewall to test

4. **Try a different port**:
   - Edit the PORT environment variable in the NFC bridge server
   - Update the connection URL in the NFCModal component

### Card Not Detected

**Symptoms**:
- The NFC reader is detected, but no card data is received when placing a card on the reader
- The check-reader.js script doesn't show any card detection events

**Solutions**:

1. **Check card placement**:
   - Make sure the card is properly placed on the reader
   - Try different positions and orientations
   - Keep the card still on the reader for a few seconds

2. **Check card compatibility**:
   - Make sure the card is compatible with the reader
   - The NFC bridge is designed to work with ISO 14443 Type A and B cards
   - Some proprietary cards may not be compatible

3. **Check card functionality**:
   - Try a different card if possible
   - Make sure the card is not damaged

4. **Check reader functionality**:
   - Try the reader with a different application if possible
   - Some readers may have specific drivers or software requirements

### Incorrect Card Number Format

**Symptoms**:
- The card is detected, but the card number is not in the expected format
- The card number doesn't match the expected 20-digit format

**Solutions**:

1. **Check card type**:
   - The NFC bridge is designed to work with specific card types
   - Some cards may have a different UID format

2. **Check card number formatting**:
   - The card number formatting is implemented in the formatCardNumber function in nfc-server.js
   - You may need to modify this function to match your specific card format

3. **Debug card data**:
   - Run the check-reader.js script to see the raw card data
   - Compare the raw data with the expected format

### PC/SC Initialization Error

**Symptoms**:
- The NFC bridge server or check-reader.js script shows "Failed to initialize PC/SC"
- Error messages related to pcsclite or PC/SC middleware

**Solutions**:

1. **Check PC/SC middleware installation**:
   - Make sure the PC/SC middleware is installed and running
   - Windows: Check if the "Smart Card" service is running
   - macOS: Check if pcscd is running with `ps aux | grep pcscd`
   - Linux: Check if pcscd is running with `systemctl status pcscd`

2. **Reinstall PC/SC middleware**:
   - Windows: PC/SC comes pre-installed, but you may need to update Windows
   - macOS: Reinstall PCSC-Lite
   - Linux: Run `sudo apt-get install --reinstall pcscd libpcsclite-dev` (Ubuntu/Debian) or equivalent for your distribution

3. **Check pcsclite npm package**:
   - Make sure the pcsclite npm package is installed
   - Run `cd src/nfc-bridge && npm install pcsclite`

### WebSocket Connection Issues

**Symptoms**:
- The NFCModal in the UPass Manager application shows "Failed to connect to NFC server"
- The test-nfc.js script shows "Connection error"

**Solutions**:

1. **Check if the NFC bridge server is running**:
   - Open a terminal and run `cd src/nfc-bridge && npm start`
   - Check if there are any error messages

2. **Check WebSocket connection URL**:
   - The NFCModal component connects to `http://localhost:3001` by default
   - Make sure this URL matches the NFC bridge server address and port

3. **Check browser console for errors**:
   - Open the browser developer tools (F12)
   - Check the console for any WebSocket-related errors

4. **Try a different browser**:
   - Some browsers may have restrictions on WebSocket connections
   - Try Chrome, Firefox, or Edge

## Advanced Troubleshooting

### Debugging the NFC Bridge Server

You can run the NFC bridge server with additional debugging information:

```bash
cd src/nfc-bridge
DEBUG=* node nfc-server.js
```

This will show detailed debug information about the PC/SC middleware, WebSocket connections, and card detection events.

### Debugging the NFCModal Component

You can add additional console.log statements to the NFCModal component to debug WebSocket connection issues:

```javascript
// In NFCModal.js
console.log('Connecting to NFC bridge server...');
const socket = io('http://localhost:3001');
socket.on('connect', () => {
  console.log('Connected to NFC bridge server');
});
socket.on('connect_error', (err) => {
  console.error('Connection error:', err);
});
```

### Testing with Different NFC Readers

If you have access to different NFC readers, try them to see if the issue is specific to a particular reader model. The NFC bridge is designed to work with ACS (Advanced Card Systems) NFC readers, but may work with other PC/SC compatible readers as well.

## Getting Help

If you're still experiencing issues after trying the solutions in this guide, please:

1. Check the [NFC Bridge README](./README.md) for additional information
2. Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for details on how the NFC integration works
3. Open an issue on the project's GitHub repository with detailed information about your problem
