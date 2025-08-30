// pages/api/remove-distributor.js
import pool from '../../backend-api/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  try {
    // Delete the user from the database
    const [result] = await pool.query(
      'DELETE FROM users WHERE email = ?',
      [email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Distributor removed successfully'
    });
  } catch (err) {
    console.error('Error removing distributor:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
