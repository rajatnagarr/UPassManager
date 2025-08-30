// backend-api/pages/api/update-student.js
import pool, { withConnection } from '../../db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { 
    Student_ID, 
    Active_U_Pass_Card, 
    Replaced_U_Pass_Card, 
    Disclaimer_Signed, 
    Metro_Acct, 
    Distribution_Date, 
    Picked_Up_By, 
    Notes, 
    U_Pass_ID 
  } = req.body;
  
  if (!Student_ID) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  // Validate Student_ID format (9 digits)
  if (!/^\d{9}$/.test(Student_ID)) {
    return res.status(400).json({ message: 'Student ID must be a 9-digit number' });
  }
  
  try {
    // Build the update query dynamically based on provided fields
    let updateFields = [];
    let queryParams = [];
    
    if (Active_U_Pass_Card !== undefined) {
      updateFields.push('Active_U_Pass_Card = ?');
      // Ensure UPass number is stored as a string by wrapping it in quotes
      queryParams.push(String(Active_U_Pass_Card));
    }
    
    if (Replaced_U_Pass_Card !== undefined) {
      updateFields.push('Replaced_U_Pass_Card = ?');
      // Ensure UPass number is stored as a string by wrapping it in quotes
      queryParams.push(String(Replaced_U_Pass_Card));
    }
    
    if (Disclaimer_Signed !== undefined) {
      updateFields.push('Disclaimer_Signed = ?');
      queryParams.push(Disclaimer_Signed ? 1 : 0);
    }
    
    if (Metro_Acct !== undefined) {
      updateFields.push('Metro_Acct = ?');
      queryParams.push(Metro_Acct);
    }
    
    if (Distribution_Date !== undefined) {
      updateFields.push('Distribution_Date = ?');
      queryParams.push(Distribution_Date);
    }
    
    if (Picked_Up_By !== undefined) {
      updateFields.push('Picked_Up_By = ?');
      queryParams.push(Picked_Up_By);
    }
    
    if (Notes !== undefined) {
      updateFields.push('Notes = ?');
      queryParams.push(Notes);
    }
    
    if (U_Pass_ID !== undefined) {
      updateFields.push('U_Pass_ID = ?');
      queryParams.push(U_Pass_ID);
    }
    
    // If no fields to update, return error
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    // Add Student_ID to query params
    queryParams.push(Student_ID);
    
    // Use the withConnection wrapper to ensure connection is properly managed
    const result = await withConnection(async (connection) => {
      // Execute the update query
      const [result] = await connection.query(
        `UPDATE u_pass_manager_current SET ${updateFields.join(', ')} WHERE Student_ID = ?`,
        queryParams
      );
      
      return result;
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No record found for the provided Student ID' });
    }

    // Return success message
    return res.status(200).json({ 
      message: 'Student record updated successfully',
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
