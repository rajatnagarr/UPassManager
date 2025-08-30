# NFC Integration Architecture

This document describes the architecture and data flow of the NFC integration in the UPass Manager application.

## Overview

The NFC integration consists of three main components:

1. **NFC Bridge Server**: A Node.js server that communicates with NFC card readers using the PC/SC API.
2. **WebSocket Connection**: A real-time communication channel between the NFC Bridge Server and the UPass Manager application.
3. **NFCModal Component**: A React component in the UPass Manager application that displays the UI for allocating U-Pass cards and receives card data from the NFC Bridge Server.

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  NFC Card       │────▶│  NFC Bridge     │────▶│  UPass Manager  │
│  Reader         │     │  Server         │     │  Application    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       PC/SC API              WebSocket            React Component
```

## Data Flow

1. **Card Detection**:
   - User places an NFC card on the NFC card reader
   - The NFC Bridge Server detects the card via the PC/SC API
   - The server reads the card's UID and formats it according to the required format
   - The server sends the card data to connected clients via WebSocket

2. **Data Processing in UPass Manager**:
   - The NFCModal component in the UPass Manager application receives the card data
   - The card number is displayed in the input field
   - The user can confirm the allocation by clicking the "Allocate U-Pass" button
   - The application sends an API request to update the database with the new U-Pass allocation

## Component Details

### NFC Bridge Server

The NFC Bridge Server is a Node.js application that uses the following libraries:

- **pcsclite**: A Node.js wrapper for the PC/SC API, which allows communication with smart card readers
- **express**: A web framework for creating HTTP endpoints
- **socket.io**: A library for real-time, bidirectional communication between clients and server

The server performs the following functions:

1. Initializes the PC/SC middleware
2. Detects and monitors NFC card readers
3. Reads card data when a card is placed on a reader
4. Formats the card data according to the required format
5. Sends the card data to connected clients via WebSocket
6. Provides HTTP endpoints for status and diagnostics

### WebSocket Connection

The WebSocket connection is established between the NFC Bridge Server and the UPass Manager application using the Socket.IO library. This allows for real-time, bidirectional communication between the two components.

The following events are used:

- **readers**: List of available NFC readers
- **readerConnected**: Sent when a new NFC reader is connected
- **readerDisconnected**: Sent when an NFC reader is disconnected
- **cardDetected**: Sent when an NFC card is detected, includes the card number
- **cardRemoved**: Sent when an NFC card is removed from the reader
- **error**: Sent when an error occurs

### NFCModal Component

The NFCModal component is a React component in the UPass Manager application that displays the UI for allocating U-Pass cards. It performs the following functions:

1. Connects to the NFC Bridge Server via WebSocket when opened
2. Displays the student information for whom the U-Pass is being allocated
3. Provides an input field for the U-Pass number
4. Receives card data from the NFC Bridge Server and fills in the input field
5. Allows the user to confirm the allocation by clicking the "Allocate U-Pass" button
6. Sends an API request to update the database with the new U-Pass allocation
7. Disconnects from the NFC Bridge Server when closed

## Card Number Format

The card number format follows a specific pattern:

1. The card's UID is read from the NFC card
2. The UID is converted to a hexadecimal string
3. The hexadecimal string is converted to a decimal number
4. The decimal number is padded with leading zeros to 15 digits
5. The prefix "0167" is added to the beginning
6. A checksum digit is calculated and added to the end
7. The final card number is a 20-digit number

The checksum calculation algorithm is as follows:

1. Sum all digits in the card number
2. Apply delta values to every other digit, starting from the last digit
3. Calculate the final checksum as 10 minus the modulo 10 of the sum
4. If the result is 10, use 0 instead

## Security Considerations

- The NFC Bridge Server only runs locally on the user's machine
- The WebSocket connection is only accessible from the local machine
- The card data is only transmitted over the local network
- No sensitive data is stored in the NFC Bridge Server

## Deployment

The NFC integration is deployed as follows:

1. The NFC Bridge Server is installed and run on the user's machine
2. The UPass Manager application is accessed via a web browser
3. When the NFCModal is opened, it connects to the NFC Bridge Server
4. The user places an NFC card on the reader to allocate a U-Pass

## Future Improvements

- Add support for more types of NFC card readers
- Implement encryption for the WebSocket connection
- Add authentication for the WebSocket connection
- Improve error handling and recovery
- Add support for reading additional data from the NFC card
