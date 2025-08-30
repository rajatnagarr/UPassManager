// pages/api/add-distributor.js
import pool from '../../backend-api/db.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, firstName, lastName, password } = req.body;
  
  if (!email || !firstName || !lastName || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email, firstName, lastName, and password are required'
    });
  }

  try {
    // Check if the user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      // Update the existing user
      await pool.query(
        'UPDATE users SET first_name = ?, last_name = ?, password = ? WHERE email = ?',
        [firstName, lastName, password, email]
      );

      return res.status(200).json({
        success: true,
        message: 'Distributor account updated successfully'
      });
    } else {
      // Generate a UUID for the new user
      const uuid = uuidv4();
      
      // Insert a new user with role 'distributor'
      await pool.query(
        'INSERT INTO users (UUID, email, first_name, last_name, password, role) VALUES (?, ?, ?, ?, ?, ?)',
        [uuid, email, firstName, lastName, password, 'distributor']
      );

      return res.status(201).json({
        success: true,
        message: 'Distributor account created successfully'
      });
    }
  } catch (err) {
    console.error('Error adding distributor:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
