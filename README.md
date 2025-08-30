# U-Pass Manager Project

## Overview
The U-Pass Manager project is a comprehensive, cloud-based solution designed to modernize the distribution of U-Pass cards at our university. By automating data ingestion, eligibility verification, and pass allocation, this application replaces manual, error-prone processes with a streamlined, secure, and efficient system that delivers real-time updates and analytics.

## Features

- **Data Collection and Cloud Infrastructure Setup**  
  Configure a scalable cloud infrastructure (using AWS, Azure, etc.) to host the application, ingest and validate student data, and ensure robust logging, monitoring, and automated backups.

- **Secure Login and Role-Based Access**  
  Implement multi-factor authentication and role-based access controls to ensure that distributors and administrators can securely log in and manage system functionalities.

- **Eligibility Check**  
  Verify student eligibility in real time using daily data updates, ensuring that only qualified students receive a U-Pass.

- **NFC/QR Code Scanning and Pass Allocation**  
  Enable distributors to quickly scan NFC or QR codes to allocate U-Pass cards to student records, reducing manual errors and improving efficiency.

- **Realtime Notification Service**  
  Automatically send notifications to students when their U-Pass is ready for pickup, deactivated, or when their eligibility status changes.

- **Data Analytics and Dashboard**  
  Provide administrators with detailed insights and visualizations of U-Pass usage trends, along with data export capabilities (e.g., Excel) for external reporting.

- **Testing and Maintenance**  
  Integrate comprehensive end-to-end and regression testing, along with continuous monitoring and maintenance practices, to ensure system stability and prompt issue resolution.

## User Roles

- **Student (Sam)**  
  A full-time college student who relies on public transportation. Sam benefits from a quick, NFC/QR-enabled U-Pass collection process and receives timely notifications for any changes in his pass status.

- **Distributor (Dana)**  
  Responsible for daily U-Pass issuance, Dana uses the secure U-Pass manager portal to allocate passes via NFC/QR scanning. She also updates student eligibility statuses and ensures students are promptly notified when their passes are ready.

- **Administrator (Alex)**  
  Overseeing the entire U-Pass distribution process, Alex has full access rights to manage user roles, view detailed analytics, and export comprehensive reports (e.g., for WMATA). He also ensures that student data is consistently updated in the cloud.

## Installation & Deployment

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/upass-manager.git
   cd upass-manager
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_DATABASE=your_database_name
   DB_PORT=your_database_port
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

## NFC Integration

The U-Pass Manager includes integration with NFC card readers to streamline the U-Pass allocation process. This feature allows distributors to quickly scan U-Pass cards and automatically fill in the card number.

For a detailed explanation of the NFC integration architecture and data flow, see [ARCHITECTURE.md](src/nfc-bridge/ARCHITECTURE.md).

### Setting Up NFC Support

1. **Run the NFC Setup Script**
   ```bash
   npm run setup-nfc
   ```
   or
   ```bash
   node setup-nfc.js
   ```
   This script will install all necessary dependencies for both the main application and the NFC bridge server.

2. **Start the NFC Bridge Server**
   ```bash
   cd src/nfc-bridge
   npm start
   ```

3. **Start the Main Application (in a separate terminal)**
   ```bash
   npm run dev
   ```

4. **Connect an NFC Card Reader**
   Connect your NFC card reader to your computer. The NFC bridge server will automatically detect it.

5. **Using NFC in the Application**
   - Log in as a distributor
   - Search for a student by PID
   - Click "Allocate U-Pass"
   - Place the U-Pass card near the NFC reader
   - The card number will be automatically filled in
   - Click "Allocate U-Pass" to complete the process

### Supported NFC Readers

The NFC integration is designed to work with ACS (Advanced Card Systems) NFC readers, but may work with other PC/SC compatible readers as well.

### Updating NFC Support

To update the NFC integration to the latest version:

```bash
npm run update-nfc
```
or
```bash
node update-nfc.js
```

This script will:
1. Pull the latest changes from the repository (if it's a git repository)
2. Update dependencies for both the main application and the NFC bridge server
3. Optionally check if your NFC reader is properly recognized
4. Optionally start both servers

### Uninstalling NFC Support

If you no longer need the NFC integration, you can uninstall it:

```bash
npm run uninstall-nfc
```
or
```bash
node uninstall-nfc.js
```

This script will:
1. Remove the NFC bridge directory
2. Remove NFC-related dependencies from package.json
3. Remove NFC-related scripts from package.json
4. Update the NFCModal component to remove NFC integration
5. Run npm install to update dependencies

### Troubleshooting

If you encounter issues with the NFC integration, see the [Troubleshooting Guide](src/nfc-bridge/TROUBLESHOOTING.md) for solutions to common problems.

For more information about the NFC integration, see the [NFC Bridge README](src/nfc-bridge/README.md) and [Architecture Documentation](src/nfc-bridge/ARCHITECTURE.md).

## Contributors

This project is maintained by the U-Pass Manager Contributors. See [CONTRIBUTING.md](CONTRIBUTING.md) for a full list of contributors.
