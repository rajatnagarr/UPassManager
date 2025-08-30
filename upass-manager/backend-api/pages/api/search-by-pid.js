// backend-api/pages/api/search-by-pid.js
import pool, { withConnection } from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { pid } = req.query;
  
  if (!pid) {
    return res.status(400).json({ message: 'PID is required' });
  }

  // Validate PID format (9 digits)
  if (!/^\d{9}$/.test(pid)) {
    return res.status(400).json({ message: 'PID must be a 9-digit number' });
  }

  try {
    // Use the withConnection wrapper to ensure connection is properly managed
    const result = await withConnection(async (connection) => {
      // Query the database for the U-Pass record using Student_ID (PID)
      const [rows] = await connection.query(
        'SELECT * FROM u_pass_manager_current WHERE Student_ID = ?',
        [pid]
      );
      
      return rows;
    });
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'No record found for the provided PID' });
    }

    // Return the U-Pass record
    return res.status(200).json({ 
      message: 'Record found',
      data: result[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
