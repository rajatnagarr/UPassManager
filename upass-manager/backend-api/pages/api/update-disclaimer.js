// backend-api/pages/api/update-disclaimer.js
import pool, { withConnection } from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { pid } = req.body;
  
  if (!pid) {
    return res.status(400).json({ message: 'PID is required' });
  }

  // Validate PID format (9 digits)
  if (!/^\d{9}$/.test(pid)) {
    return res.status(400).json({ message: 'PID must be a 9-digit number' });
  }

  console.log('Updating disclaimer for PID:', pid);
  console.log('Database connection pool:', pool ? 'Available' : 'Not available');
  
  try {
    // Log database connection parameters (without sensitive info)
    console.log('Database host:', process.env.DB_HOST);
    console.log('Database name:', process.env.DB_DATABASE);
    console.log('Database port:', process.env.DB_PORT);
    
    // Use the withConnection wrapper to ensure connection is properly managed
    const result = await withConnection(async (connection) => {
      // Update with numeric 1 (boolean true) as specified by the database schema
      console.log('Updating Disclaimer_Signed to 1 (boolean true)');
      const [result] = await connection.query(
        'UPDATE u_pass_manager_current SET Disclaimer_Signed = 1 WHERE Student_ID = ?',
        [pid]
      );
      console.log('Update result:', result);

      if (result.affectedRows === 0) {
        console.log('No rows affected. Checking if record exists...');
        
        // Check if the record exists
        const [rows] = await connection.query(
          'SELECT * FROM u_pass_manager_current WHERE Student_ID = ?',
          [pid]
        );
        
        if (rows.length === 0) {
          return { notFound: true };
        } else {
          console.log('Record exists but not updated. Current value:', rows[0].Disclaimer_Signed);
          return { alreadySigned: true, record: rows[0] };
        }
      }
      
      return { updated: true, result };
    });
    
    if (result.notFound) {
      return res.status(404).json({ message: 'No record found for the provided PID' });
    } else if (result.alreadySigned) {
      return res.status(200).json({ 
        message: 'Record found but not updated. May already be signed.',
        success: true
      });
    }

    // Return success message
    return res.status(200).json({ 
      message: 'Disclaimer status updated successfully',
      success: true
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      stack: error.stack
    });
  }
}
