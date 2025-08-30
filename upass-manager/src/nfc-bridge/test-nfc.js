/**
 * NFC Bridge Test Script
 * 
 * This script tests the NFC bridge server by connecting to it via WebSocket
 * and listening for card detection events.
 * 
 * Usage:
 * 1. Start the NFC bridge server: npm start
 * 2. In a separate terminal, run this script: node test-nfc.js
 * 3. Place an NFC card near the reader
 */

const { io } = require('socket.io-client');
const readline = require('readline');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`${colors.bright}${colors.magenta}=== NFC Bridge Test ====${colors.reset}\n`);
console.log(`${colors.cyan}Connecting to NFC bridge server...${colors.reset}`);

// Connect to NFC bridge server
const socket = io('http://localhost:3001');

// Connection established
socket.on('connect', () => {
  console.log(`${colors.green}Connected to NFC bridge server${colors.reset}`);
  console.log(`${colors.yellow}Waiting for NFC readers and cards...${colors.reset}`);
  console.log(`${colors.dim}(Press Ctrl+C to exit)${colors.reset}\n`);
});

// Connection error
socket.on('connect_error', (err) => {
  console.error(`${colors.red}Connection error: ${err.message}${colors.reset}`);
  console.error(`${colors.yellow}Make sure the NFC bridge server is running on port 3001${colors.reset}`);
  process.exit(1);
});

// Readers available
socket.on('readers', (readerList) => {
  if (readerList.length === 0) {
    console.log(`${colors.yellow}No NFC readers detected${colors.reset}`);
    console.log(`${colors.yellow}Please connect an NFC reader to your computer${colors.reset}`);
  } else {
    console.log(`${colors.green}Available readers (${readerList.length}):${colors.reset}`);
    readerList.forEach((reader, index) => {
      console.log(`  ${index + 1}. ${reader}`);
    });
    console.log(`\n${colors.cyan}Place an NFC card near the reader...${colors.reset}`);
  }
});

// Reader connected
socket.on('readerConnected', (data) => {
  console.log(`${colors.green}Reader connected: ${data.name}${colors.reset}`);
});

// Reader disconnected
socket.on('readerDisconnected', (data) => {
  console.log(`${colors.yellow}Reader disconnected: ${data.name}${colors.reset}`);
});

// Card detected
socket.on('cardDetected', (data) => {
  console.log(`\n${colors.bright}${colors.green}Card detected!${colors.reset}`);
  console.log(`${colors.cyan}Reader:${colors.reset} ${data.reader}`);
  console.log(`${colors.cyan}Card Number:${colors.reset} ${data.cardNumber}`);
  console.log(`\n${colors.cyan}Place another card or press Ctrl+C to exit${colors.reset}`);
});

// Card removed
socket.on('cardRemoved', (data) => {
  console.log(`${colors.yellow}Card removed from reader: ${data.reader}${colors.reset}`);
});

// Error
socket.on('error', (data) => {
  console.error(`${colors.red}NFC error: ${data.message}${colors.reset}`);
  if (data.error) {
    console.error(`${colors.dim}Details: ${data.error}${colors.reset}`);
  }
});

// Disconnected
socket.on('disconnect', () => {
  console.log(`${colors.yellow}Disconnected from NFC bridge server${colors.reset}`);
  process.exit(0);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log(`\n${colors.bright}Exiting NFC bridge test${colors.reset}`);
  socket.disconnect();
  rl.close();
  process.exit(0);
});
