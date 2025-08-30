/**
 * Setup script for NFC integration
 * This script installs dependencies for both the main application and the NFC bridge server
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Paths
const mainProjectPath = path.resolve(__dirname);
const nfcBridgePath = path.resolve(__dirname, 'src', 'nfc-bridge');

// Colors for console output
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

// Helper function to execute commands and log output
function executeCommand(command, cwd = mainProjectPath) {
  console.log(`${colors.bright}${colors.blue}Executing:${colors.reset} ${command}`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`${colors.red}Error executing command:${colors.reset} ${command}`);
    console.error(error.message);
    return false;
  }
}

// Check if NFC bridge directory exists
if (!fs.existsSync(nfcBridgePath)) {
  console.error(`${colors.red}Error:${colors.reset} NFC bridge directory not found at ${nfcBridgePath}`);
  process.exit(1);
}

// Main setup function
async function setup() {
  console.log(`\n${colors.bright}${colors.magenta}=== UPass Manager NFC Integration Setup ===${colors.reset}\n`);
  
  // Install main project dependencies
  console.log(`\n${colors.cyan}Step 1:${colors.reset} Installing main project dependencies...\n`);
  if (!executeCommand('npm install')) {
    console.error(`${colors.red}Failed to install main project dependencies.${colors.reset}`);
    process.exit(1);
  }
  
  // Install NFC bridge dependencies
  console.log(`\n${colors.cyan}Step 2:${colors.reset} Installing NFC bridge dependencies...\n`);
  if (!executeCommand('npm install', nfcBridgePath)) {
    console.error(`${colors.red}Failed to install NFC bridge dependencies.${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`\n${colors.green}${colors.bright}Setup completed successfully!${colors.reset}\n`);
  console.log(`To start the application with NFC support, you need to run two processes:`);
  console.log(`1. Start the NFC bridge server: ${colors.yellow}cd src/nfc-bridge && npm start${colors.reset}`);
  console.log(`2. Start the main application: ${colors.yellow}npm run dev${colors.reset}`);
  
  // Ask if user wants to check their NFC reader
  rl.question(`\n${colors.bright}Would you like to check if your NFC reader is properly recognized? (y/n)${colors.reset} `, (checkAnswer) => {
    if (checkAnswer.toLowerCase() === 'y' || checkAnswer.toLowerCase() === 'yes') {
      console.log(`\n${colors.cyan}Checking NFC reader...${colors.reset}`);
      executeCommand('node src/nfc-bridge/check-reader.js');
      
      // After checking, ask if they want to start the servers
      rl.question(`\n${colors.bright}Would you like to start both servers now? (y/n)${colors.reset} `, (startAnswer) => {
        if (startAnswer.toLowerCase() === 'y' || startAnswer.toLowerCase() === 'yes') {
          startServers();
        } else {
          console.log(`\n${colors.bright}Setup completed. You can start the servers manually when needed.${colors.reset}`);
          rl.close();
        }
      });
    } else {
      // Skip checking and ask if they want to start the servers
      rl.question(`\n${colors.bright}Would you like to start both servers now? (y/n)${colors.reset} `, (startAnswer) => {
        if (startAnswer.toLowerCase() === 'y' || startAnswer.toLowerCase() === 'yes') {
          startServers();
        } else {
          console.log(`\n${colors.bright}Setup completed. You can start the servers manually when needed.${colors.reset}`);
          rl.close();
        }
      });
    }
  });
}

// Function to start both servers
function startServers() {
  console.log(`\n${colors.cyan}Starting NFC bridge server...${colors.reset}`);
  console.log(`${colors.yellow}Note: This will start in a new terminal window.${colors.reset}`);
  
  // Start NFC bridge server in a new terminal
  if (process.platform === 'win32') {
    // Windows
    executeCommand(`start cmd.exe /K "cd ${nfcBridgePath} && npm start"`);
  } else if (process.platform === 'darwin') {
    // macOS
    executeCommand(`osascript -e 'tell app "Terminal" to do script "cd ${nfcBridgePath} && npm start"'`);
  } else {
    // Linux
    executeCommand(`gnome-terminal -- bash -c "cd ${nfcBridgePath} && npm start; exec bash"`);
  }
  
  console.log(`\n${colors.cyan}Starting main application...${colors.reset}`);
  
  // Start main application
  executeCommand('npm run dev');
  
  rl.close();
}

// Run setup
setup();
