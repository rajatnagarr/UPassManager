/**
 * Uninstall script for NFC integration
 * This script removes the NFC integration from the UPass Manager application
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

// Main uninstall function
async function uninstall() {
  console.log(`\n${colors.bright}${colors.magenta}=== UPass Manager NFC Integration Uninstall ===${colors.reset}\n`);
  
  // Check if NFC bridge directory exists
  if (!fs.existsSync(nfcBridgePath)) {
    console.log(`${colors.yellow}NFC bridge directory not found at ${nfcBridgePath}${colors.reset}`);
    console.log(`${colors.yellow}It seems the NFC integration is not installed.${colors.reset}`);
    
    rl.question(`\n${colors.bright}Would you like to proceed anyway? (y/n)${colors.reset} `, (answer) => {
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log(`\n${colors.bright}Uninstall cancelled.${colors.reset}`);
        rl.close();
        return;
      }
      
      proceedWithUninstall();
    });
  } else {
    rl.question(`\n${colors.bright}${colors.yellow}WARNING: This will remove the NFC integration from your UPass Manager application.${colors.reset}\n${colors.bright}Are you sure you want to proceed? (y/n)${colors.reset} `, (answer) => {
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log(`\n${colors.bright}Uninstall cancelled.${colors.reset}`);
        rl.close();
        return;
      }
      
      proceedWithUninstall();
    });
  }
}

// Function to proceed with uninstall
function proceedWithUninstall() {
  console.log(`\n${colors.cyan}Uninstalling NFC integration...${colors.reset}\n`);
  
  // Remove NFC bridge directory
  if (fs.existsSync(nfcBridgePath)) {
    console.log(`${colors.cyan}Removing NFC bridge directory...${colors.reset}`);
    try {
      fs.rmSync(nfcBridgePath, { recursive: true, force: true });
      console.log(`${colors.green}NFC bridge directory removed successfully.${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error removing NFC bridge directory:${colors.reset} ${error.message}`);
      console.error(`${colors.yellow}You may need to remove it manually.${colors.reset}`);
    }
  }
  
  // Remove socket.io-client dependency from package.json
  console.log(`\n${colors.cyan}Updating package.json...${colors.reset}`);
  try {
    const packageJsonPath = path.join(mainProjectPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Remove socket.io-client dependency
    if (packageJson.dependencies && packageJson.dependencies['socket.io-client']) {
      delete packageJson.dependencies['socket.io-client'];
      console.log(`${colors.green}Removed socket.io-client dependency from package.json.${colors.reset}`);
    }
    
    // Remove NFC-related scripts
    if (packageJson.scripts) {
      if (packageJson.scripts['setup-nfc']) {
        delete packageJson.scripts['setup-nfc'];
        console.log(`${colors.green}Removed setup-nfc script from package.json.${colors.reset}`);
      }
      
      if (packageJson.scripts['update-nfc']) {
        delete packageJson.scripts['update-nfc'];
        console.log(`${colors.green}Removed update-nfc script from package.json.${colors.reset}`);
      }
    }
    
    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`${colors.green}Updated package.json successfully.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error updating package.json:${colors.reset} ${error.message}`);
    console.error(`${colors.yellow}You may need to update it manually.${colors.reset}`);
  }
  
  // Remove setup-nfc.js, update-nfc.js, and uninstall-nfc.js
  console.log(`\n${colors.cyan}Removing NFC scripts...${colors.reset}`);
  const scriptsToRemove = [
    path.join(mainProjectPath, 'setup-nfc.js'),
    path.join(mainProjectPath, 'update-nfc.js'),
    path.join(mainProjectPath, 'uninstall-nfc.js')
  ];
  
  for (const scriptPath of scriptsToRemove) {
    if (fs.existsSync(scriptPath)) {
      try {
        fs.unlinkSync(scriptPath);
        console.log(`${colors.green}Removed ${path.basename(scriptPath)} successfully.${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}Error removing ${path.basename(scriptPath)}:${colors.reset} ${error.message}`);
        console.error(`${colors.yellow}You may need to remove it manually.${colors.reset}`);
      }
    }
  }
  
  // Update NFCModal.js to remove NFC integration
  console.log(`\n${colors.cyan}Checking for NFCModal component...${colors.reset}`);
  const nfcModalPath = path.join(mainProjectPath, 'src', 'app', 'components', 'NFCModal.js');
  
  if (fs.existsSync(nfcModalPath)) {
    console.log(`${colors.cyan}NFCModal component found. Updating to remove NFC integration...${colors.reset}`);
    try {
      let nfcModalContent = fs.readFileSync(nfcModalPath, 'utf8');
      
      // Check if the NFCModal has socket.io integration
      if (nfcModalContent.includes('socket.io-client')) {
        // Create a backup of the original file
        const backupPath = `${nfcModalPath}.backup`;
        fs.writeFileSync(backupPath, nfcModalContent);
        console.log(`${colors.green}Created backup of NFCModal.js at ${backupPath}.${colors.reset}`);
        
        // Remove socket.io-client import
        nfcModalContent = nfcModalContent.replace(/import\s+{\s*io\s*}\s+from\s+['"]socket\.io-client['"];?/g, '');
        
        // Remove socket-related state and refs
        nfcModalContent = nfcModalContent.replace(/const\s+\[\s*nfcStatus.*?setNfcStatus\s*\]\s*=\s*useState\(['"]disconnected['"]\);/g, '');
        nfcModalContent = nfcModalContent.replace(/const\s+\[\s*readers.*?setReaders\s*\]\s*=\s*useState\(\[\]\);/g, '');
        nfcModalContent = nfcModalContent.replace(/const\s+\[\s*statusMessage.*?setStatusMessage\s*\]\s*=\s*useState\(['"].*?['"]\);/g, '');
        nfcModalContent = nfcModalContent.replace(/const\s+socketRef\s*=\s*useRef\(null\);/g, '');
        
        // Remove connectToNfcServer function and related code
        nfcModalContent = nfcModalContent.replace(/\/\/\s*Connect to NFC bridge server when modal opens[\s\S]*?if \(socketRef\.current\) {[\s\S]*?}/g, '  // Focus the input field when the modal opens\n  useEffect(() => {\n    if (isOpen && inputRef.current) {\n      setTimeout(() => {\n        inputRef.current.focus();\n      }, 100);\n    }\n  }, [isOpen]);\n  \n  // Reset state when modal is closed\n  useEffect(() => {\n    if (!isOpen) {\n      setUpassId(\'\');\n      setError(null);\n    }\n  }, [isOpen]);');
        
        // Remove connectToNfcServer function
        nfcModalContent = nfcModalContent.replace(/\/\/\s*Function to connect to NFC bridge server[\s\S]*?};/g, '');
        
        // Remove NFC status display
        nfcModalContent = nfcModalContent.replace(/<div className={\`mt-2 text-sm \${[\s\S]*?<\/div>/g, '<p className="mt-2 text-sm text-gray-500">\n            Place the U-Pass card near the NFC reader or manually enter the U-Pass number\n          </p>');
        
        // Write updated NFCModal.js
        fs.writeFileSync(nfcModalPath, nfcModalContent);
        console.log(`${colors.green}Updated NFCModal.js to remove NFC integration.${colors.reset}`);
      } else {
        console.log(`${colors.yellow}NFCModal component does not have socket.io integration. No changes needed.${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error updating NFCModal.js:${colors.reset} ${error.message}`);
      console.error(`${colors.yellow}You may need to update it manually.${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}NFCModal component not found. No changes needed.${colors.reset}`);
  }
  
  // Run npm install to update dependencies
  console.log(`\n${colors.cyan}Running npm install to update dependencies...${colors.reset}`);
  executeCommand('npm install');
  
  console.log(`\n${colors.green}${colors.bright}NFC integration uninstalled successfully!${colors.reset}`);
  console.log(`${colors.yellow}Note: You may need to restart your application for the changes to take effect.${colors.reset}`);
  
  rl.close();
}

// Run uninstall
uninstall();
