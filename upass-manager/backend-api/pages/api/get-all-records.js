// backend-api/pages/api/get-all-records.js
import pool from '../../db';

export default async function handler(req, res) {
  let connection;
  
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get table parameter from query string (default to u_pass_manager_current)
    const table = req.query.table || 'u_pass_manager_current';
    
    // Validate table name to prevent SQL injection
    const validTables = ['u_pass_manager_current', 'u_pass_manager_fall_2024', 'u_pass_manager_spring_2024'];
    if (!validTables.includes(table)) {
      return res.status(400).json({ message: 'Invalid table name' });
    }
    
    // Get filter parameters
    const filters = {};
    const possibleFilters = [
      'Student_ID', 'First_Name', 'Last_Name', 'Email',
      'Active_U_Pass_Card', 'Disclaimer_Signed', 'Metro_Acct',
      'Distribution_Date', 'Picked_Up_By'
    ];
    
    possibleFilters.forEach(filter => {
      if (req.query[filter] !== undefined && req.query[filter] !== '') {
        filters[filter] = req.query[filter];
      }
    });
    
    // Build WHERE clause based on filters
    let whereClause = '';
    const whereParams = [];
    
    if (Object.keys(filters).length > 0) {
      const conditions = [];
      
      Object.entries(filters).forEach(([key, value]) => {
        // Handle different types of filters
        if (key === 'Disclaimer_Signed') {
          // Boolean filter
          conditions.push(`${key} = ?`);
          whereParams.push(value === 'true' || value === '1' ? 1 : 0);
        } else if (key === 'Distribution_Date') {
          // Date filter
          conditions.push(`${key} LIKE ?`);
          whereParams.push(`%${value}%`);
        } else {
          // Text filter (case insensitive)
          conditions.push(`${key} LIKE ?`);
          whereParams.push(`%${value}%`);
        }
      });
      
      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }
    }
    
    // Get a connection from the pool
    connection = await pool.getConnection();
    
    // Get total count of filtered records
    const countQuery = `SELECT COUNT(*) as total FROM ${table} ${whereClause}`;
    const [countResult] = await connection.query(countQuery, whereParams);
    const totalRecords = countResult[0].total;
    
    // Get paginated and filtered records
    const query = `
      SELECT * FROM ${table} 
      ${whereClause} 
      ORDER BY Student_ID
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await connection.query(
      query,
      [...whereParams, limit, offset]
    );
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalRecords / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return res.status(200).json({
      records: rows,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  } finally {
    // Always release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Database connection released in get-all-records');
    }
  }
}
