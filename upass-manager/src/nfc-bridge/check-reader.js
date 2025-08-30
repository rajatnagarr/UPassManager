/**
 * NFC Reader Check Script
 * 
 * This script checks if an NFC card reader is properly recognized by the system.
 * It doesn't start the full NFC bridge server, but just initializes the PC/SC middleware
 * and lists the available readers.
 * 
 * Usage: node check-reader.js
 */

const pcsc = require('pcsclite');

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

console.log(`${colors.bright}${colors.magenta}=== NFC Reader Check ====${colors.reset}\n`);
console.log(`${colors.cyan}Initializing PC/SC middleware...${colors.reset}`);

// Initialize PC/SC
let pcscInstance;
try {
  pcscInstance = pcsc();
  console.log(`${colors.green}PC/SC initialized successfully${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Failed to initialize PC/SC:${colors.reset} ${error.message}`);
  console.error(`${colors.yellow}Make sure PC/SC drivers are installed and the PC/SC service is running${colors.reset}`);
  process.exit(1);
}

// Store active readers
const readers = {};

// Handle PC/SC reader events
pcscInstance.on('reader', function(reader) {
  console.log(`${colors.green}Reader detected:${colors.reset} ${reader.name}`);
  
  // Store reader
  readers[reader.name] = reader;
  
  // Check if it's an ACS reader
  if (reader.name.includes('ACS')) {
    console.log(`${colors.green}✓ This is an ACS reader, which is fully supported by the NFC bridge${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ This is not an ACS reader. It may still work, but is not officially supported${colors.reset}`);
  }
  
  // Set up event handlers
  reader.on('status', function(status) {
    const changes = this.state ^ status.state;
    
    // Card removed
    if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
      console.log(`${colors.yellow}Card removed from reader${colors.reset}`);
    }
    
    // Card inserted
    if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
      console.log(`${colors.green}Card detected!${colors.reset} Try to connect...`);
      
      // Connect to card
      reader.connect({ share_mode: this.SCARD_SHARE_SHARED }, function(err, protocol) {
        if (err) {
          console.error(`${colors.red}Error connecting to card:${colors.reset} ${err.message}`);
          return;
        }
        
        console.log(`${colors.green}Successfully connected to card${colors.reset}`);
        console.log(`${colors.green}Protocol:${colors.reset} ${protocol}`);
        
        // Command to get UID
        const command = Buffer.from([0xFF, 0xCA, 0x00, 0x00, 0x00]);
        
        // Send command to card
        reader.transmit(command, 16, protocol, function(err, data) {
          if (err) {
            console.error(`${colors.red}Error transmitting to card:${colors.reset} ${err.message}`);
            return;
          }
          
          console.log(`${colors.green}Successfully read card data${colors.reset}`);
          console.log(`${colors.cyan}Raw data:${colors.reset} ${Buffer.from(data).toString('hex').toUpperCase()}`);
          
          // Disconnect from card
          reader.disconnect(reader.SCARD_LEAVE_CARD, function(err) {
            if (err) {
              console.error(`${colors.red}Error disconnecting from card:${colors.reset} ${err.message}`);
            } else {
              console.log(`${colors.green}Successfully disconnected from card${colors.reset}`);
            }
          });
        });
      });
    }
    
    this.state = status.state;
  });
  
  reader.on('end', function() {
    console.log(`${colors.yellow}Reader removed:${colors.reset} ${this.name}`);
    delete readers[this.name];
    
    // Check if there are any readers left
    if (Object.keys(readers).length === 0) {
      console.log(`${colors.yellow}No readers available${colors.reset}`);
    }
  });
  
  reader.on('error', function(err) {
    console.error(`${colors.red}Reader error:${colors.reset} ${err.message}`);
  });
});

pcscInstance.on('error', function(err) {
  console.error(`${colors.red}PCSC error:${colors.reset} ${err.message}`);
});

// Wait a bit and then check if any readers were detected
setTimeout(() => {
  const readerCount = Object.keys(readers).length;
  
  if (readerCount === 0) {
    console.log(`\n${colors.yellow}No NFC readers detected after 3 seconds${colors.reset}`);
    console.log(`${colors.yellow}Please make sure your NFC reader is properly connected${colors.reset}`);
    console.log(`${colors.yellow}If you just connected it, please wait a few more seconds${colors.reset}`);
  } else {
    console.log(`\n${colors.green}${readerCount} NFC reader(s) detected${colors.reset}`);
    console.log(`${colors.cyan}Your NFC reader is properly recognized by the system${colors.reset}`);
    console.log(`${colors.cyan}You can now place an NFC card on the reader to test it${colors.reset}`);
  }
  
  console.log(`\n${colors.dim}Press Ctrl+C to exit${colors.reset}`);
}, 3000);

// Handle process termination
process.on('SIGINT', () => {
  console.log(`\n${colors.bright}Exiting NFC reader check${colors.reset}`);
  process.exit(0);
});
