import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import pool from '../../backend-api/db.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '[REDACTED]' : 'Not Found');
    console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '[REDACTED]' : 'Not Found');
    console.log('AWS_REGION:', process.env.AWS_REGION || 'us-east-2');

    const lambda = new LambdaClient({ 
      region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || "us-east-2",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
      }
    });

    const { email, distributorName, setPasswordLink } = req.body;

    if (!email || !setPasswordLink) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const message = `
Hi ${distributorName},

Welcome to the U-Pass Portal!

Please set your password using the link below:

${setPasswordLink}

If you have any questions, feel free to reach out.

Thanks,  
U-Pass Management
`;

    const payload = {
      recipients: [email],
      subject: "Set Up Your Password - U-Pass Portal",
      message: message,
    };

    console.log('📦 Payload prepared:', JSON.stringify(payload));

    const command = new InvokeCommand({
      FunctionName: "CS5934_G6_SES",
      InvocationType: "RequestResponse",
      Payload: Buffer.from(JSON.stringify(payload)),
    });

    const response = await lambda.send(command);

    console.log('Lambda invoked successfully! Raw response:', response);

    const responsePayload = JSON.parse(new TextDecoder().decode(response.Payload));

    if (responsePayload.statusCode !== 200) {
      throw new Error(responsePayload.body ? JSON.parse(responsePayload.body).error : 'Lambda function failed');
    }

    // Add a temporary entry in the database with a placeholder password
    // This will be updated when the user sets their password
    try {
      // Check if the user already exists
      const [existingUsers] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length === 0) {
        // Generate a UUID for the new user
        const uuid = uuidv4();
        
        // Insert a new user with role 'distributor' and a temporary password
        await pool.query(
          'INSERT INTO users (UUID, email, first_name, last_name, password, role) VALUES (?, ?, ?, ?, ?, ?)',
          [uuid, email, distributorName, '', 'TEMPORARY_PASSWORD_CHANGE_REQUIRED', 'distributor']
        );
      }
    } catch (dbErr) {
      console.error('Error adding temporary distributor to database:', dbErr);
      // Continue even if database operation fails, as the email was sent successfully
    }

    res.status(200).json({ success: true, message: "Distributor notified successfully." });

  } catch (err) {
    console.error('Error in notify-new-distributor:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}
