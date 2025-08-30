// lambda-code/index.mjs

// Uncomment the following line for local testing (not needed in production)
// import 'dotenv/config';

import AWS from 'aws-sdk';
import XLSX from 'xlsx';
import mysql from 'mysql2/promise';
import path from 'path';

// S3 is built-in in Lambda's runtime, so AWS SDK is available,
// but xlsx and mysql2 will come from your Lambda Layer.
const s3 = new AWS.S3();

export const handler = async (event) => {
  try {
    // Validate S3 event
    if (!event.Records || event.Records.length === 0) {
      console.log('No S3 records found in event.');
      return { statusCode: 400, body: 'No S3 records found.' };
    }
    
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    console.log(`Bucket: ${bucket}, Key: ${key}`);
    
    // Process only files in "raw_data/" folder
    if (!key.startsWith('raw_data/')) {
      console.log('File not in raw_data folder, skipping.');
      return { statusCode: 200, body: 'Not processed.' };
    }
    
    // Extract the filename from the key
    const filename = path.basename(key);
    console.log(`Processing file: ${filename}`);
    
    // Determine which table to update based on the filename
    let tableName = 'u_pass_manager_current'; // Default table
    
    if (filename.includes('Mockup_Data_UPass_Fall_2024')) {
      tableName = 'u_pass_manager_fall_2024';
    } else if (filename.includes('Mockup_Data_UPass_Spring_2024')) {
      tableName = 'u_pass_manager_spring_2024';
    } else if (!filename.includes('Mockup_Data_UPass')) {
      console.log(`Unrecognized file pattern: ${filename}, using default table.`);
    }
    
    console.log(`Selected table: ${tableName}`);
    
    // Retrieve the file from S3
    const fileData = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    console.log('File retrieved from S3.');
    
    // Parse Excel file using xlsx
    const workbook = XLSX.read(fileData.Body, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log('Parsed data:', JSON.stringify(jsonData, null, 2));
    
    // Connect to RDS using environment variables
    const connection = await mysql.createConnection({
      host: process.env.RDS_HOST,
      user: process.env.RDS_USER,
      password: process.env.RDS_PASSWORD,
      database: process.env.RDS_DB,
    });
    console.log('Connected to RDS.');
    
    // Define your SQL query with the dynamic table name
    const sql = `
      INSERT INTO ${tableName} (
        U_Pass_ID,
        Active_U_Pass_Card,
        Replaced_U_Pass_Card,
        Metro_Acct,
        Distribution_Date,
        Picked_Up_By,
        Student_ID,
        First_Name,
        Last_Name,
        Email,
        Disclaimer_Signed,
        Notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        Active_U_Pass_Card = VALUES(Active_U_Pass_Card),
        Replaced_U_Pass_Card = VALUES(Replaced_U_Pass_Card),
        Metro_Acct = VALUES(Metro_Acct),
        Distribution_Date = VALUES(Distribution_Date),
        Picked_Up_By = VALUES(Picked_Up_By),
        Student_ID = VALUES(Student_ID),
        First_Name = VALUES(First_Name),
        Last_Name = VALUES(Last_Name),
        Email = VALUES(Email),
        Disclaimer_Signed = VALUES(Disclaimer_Signed),
        Notes = VALUES(Notes)
    `;
    
    // Loop over each row in the Excel JSON and execute the query
    for (const row of jsonData) {
      // Default missing values to null
      const {
        U_Pass_ID = null,
        Active_U_Pass_Card = null,
        Replaced_U_Pass_Card = null,
        Metro_Acct = null,
        Distribution_Date = null,
        Picked_Up_By = null,
        Student_ID = null,
        First_Name = null,
        Last_Name = null,
        Email = null,
        Disclaimer_Signed = null,
        Notes = null
      } = row;
      
      // Convert Disclaimer_Signed from "Yes"/"No" to boolean (1/0)
      let disclaimerSignedBoolean = null;
      if (Disclaimer_Signed !== null && Disclaimer_Signed !== undefined) {
        // If it's already a boolean or number, use it as is
        if (typeof Disclaimer_Signed === 'boolean') {
          disclaimerSignedBoolean = Disclaimer_Signed ? 1 : 0;
        } else if (typeof Disclaimer_Signed === 'number') {
          disclaimerSignedBoolean = Disclaimer_Signed === 1 ? 1 : 0;
        } else if (typeof Disclaimer_Signed === 'string') {
          // Convert string "Yes"/"No" to boolean 1/0
          disclaimerSignedBoolean = Disclaimer_Signed.toLowerCase() === 'yes' ? 1 : 0;
        }
      }
      
      console.log(`Converting Disclaimer_Signed from "${Disclaimer_Signed}" to ${disclaimerSignedBoolean}`);
      
      // Format the date from MM-DD-YYYY to YYYY-MM-DD for MySQL
      let formattedDate = null;
      if (Distribution_Date) {
        // Check if the date is already in YYYY-MM-DD format
        const isYearFirst = /^\d{4}-\d{1,2}-\d{1,2}$/.test(Distribution_Date);
        
        if (isYearFirst) {
          // Already in YYYY-MM-DD format
          formattedDate = Distribution_Date;
        } else {
          // Try to parse as MM-DD-YYYY
          const dateParts = Distribution_Date.split(/[-\/]/);
          if (dateParts.length === 3) {
            // Assuming MM-DD-YYYY format
            const month = dateParts[0].padStart(2, '0');
            const day = dateParts[1].padStart(2, '0');
            const year = dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
            formattedDate = `${year}-${month}-${day}`;
          } else {
            // If we can't parse it, use the original value
            formattedDate = Distribution_Date;
          }
        }
        
        console.log(`Converted date from ${Distribution_Date} to ${formattedDate}`);
      }
      
      await connection.execute(sql, [
        U_Pass_ID,
        Active_U_Pass_Card,
        Replaced_U_Pass_Card,
        Metro_Acct,
        formattedDate, // Use the formatted date
        Picked_Up_By,
        Student_ID,
        First_Name,
        Last_Name,
        Email,
        disclaimerSignedBoolean, // Use the converted boolean value
        Notes
      ]);
      
      console.log(`Upserted row for U_Pass_ID = ${U_Pass_ID} in table ${tableName}`);
    }
    
    await connection.end();
    console.log('Database connection closed.');
    
    return { statusCode: 200, body: `Database table ${tableName} updated successfully` };
    
  } catch (error) {
    console.error('Error processing file:', error);
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};
