// backend-api/pages/api/send-notification.js
import pool, { executeQuery, withConnection } from '../../db';
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Lambda client
const lambda = new LambdaClient({ 
  region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
  }
});

// Log credential information for debugging (redacted for security)
console.log('AWS Region:', process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || "us-east-2");
console.log('AWS Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? '***' + process.env.AWS_ACCESS_KEY_ID.slice(-5) : 'Not found');
console.log('NEXT_PUBLIC_AWS_ACCESS_KEY_ID:', process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID ? '***' + process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID.slice(-5) : 'Not found');

// Lambda function name
const LAMBDA_FUNCTION_NAME = process.env.LAMBDA_FUNCTION_NAME || 'CS5934_G6_SES';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { recipients, subject, message } = req.body;
  
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ message: 'Recipients are required and must be an array' });
  }

  if (!subject || typeof subject !== 'string' || subject.trim() === '') {
    return res.status(400).json({ message: 'Subject is required and cannot be empty' });
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ message: 'Message is required and cannot be empty' });
  }
  
  try {
    console.log('Sending notifications via Lambda:');
    console.log('Message:', message);
    console.log('Recipients:', recipients);
    
    // Prepare the payload for the Lambda function
    const payload = {
      recipients: recipients,
      subject: subject,
      message: message
    };
    
    // Invoke the Lambda function
    const command = new InvokeCommand({
      FunctionName: LAMBDA_FUNCTION_NAME,
      Payload: JSON.stringify(payload),
      InvocationType: 'RequestResponse' // Wait for the response
    });
    
    console.log(`Invoking Lambda function: ${LAMBDA_FUNCTION_NAME}`);
    const response = await lambda.send(command);
    
    // Parse the Lambda response
    const responsePayload = JSON.parse(Buffer.from(response.Payload).toString());
    console.log('Lambda response:', responsePayload);
    
    if (response.StatusCode !== 200) {
      throw new Error(`Lambda function returned status code ${response.StatusCode}`);
    }
    
    if (responsePayload.statusCode !== 200) {
      throw new Error(responsePayload.body ? JSON.parse(responsePayload.body).message : 'Lambda function failed');
    }
    
    // Extract the result from the Lambda response
    const result = responsePayload.body ? JSON.parse(responsePayload.body) : {};
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Pass detailed results back to frontend
    return res.status(200).json({
      message: 'Notifications sent successfully via Lambda',
      success: true,
      sent: result.results?.successful?.length || 0,
      total: recipients.length,
      results: result.results || {
        successful: [],
        failed: []
      },
      timestamp
    });
  } catch (error) {
    console.error('Error invoking Lambda function:', error);
    return res.status(500).json({ 
      message: 'Failed to send notifications via Lambda', 
      error: error.message 
    });
  }
}
