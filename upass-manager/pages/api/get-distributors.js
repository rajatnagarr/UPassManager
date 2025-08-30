// pages/api/get-distributors.js
import pool from '../../backend-api/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Query the database for all users with role 'admin' or 'distributor'
    const [rows] = await pool.query(
      'SELECT email, role FROM users WHERE role IN ("admin", "distributor")'
    );

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error('Error fetching distributors:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
