// common/auth.js
import pool from '../backend-api/db.js';  // Import your DB connection from backend-api
import jwt from 'jsonwebtoken';

/**
 * Verify a JWT token from a request.
 * @param {Object} req - The request object.
 * @returns {Promise<Object|null>} - The decoded user object or null if invalid.
 */
export async function verifyToken(req) {
  try {
    // For simplicity, we'll use the userRole from cookies or localStorage
    // In a production app, you would verify a JWT token here
    
    // Check if we're in browser or server environment
    const isServer = typeof window === 'undefined';
    
    if (isServer) {
      // Server-side: try to get from cookies
      const cookies = req.headers.cookie ? parseCookies(req.headers.cookie) : {};
      const userRole = cookies.userRole;
      if (userRole) {
        return { role: userRole };
      }
    } else {
      // Client-side: try to get from localStorage
      const userRole = localStorage.getItem('userRole');
      if (userRole) {
        return { role: userRole };
      }
    }
    
    return null;
  } catch (err) {
    console.error('Token verification error:', err);
    return null;
  }
}

// Helper function to parse cookies
function parseCookies(cookieString) {
  const cookies = {};
  if (!cookieString) return cookies;
  
  cookieString.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts[0].trim();
    const value = parts[1] || '';
    cookies[name] = decodeURIComponent(value.trim());
  });
  
  return cookies;
}

/**
 * Authenticate a user with email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} - An object with either { user } on success or { error } on failure.
 */
export async function authenticateUser(email, password) {
  let connection;
  try {
    console.log("email = ", email);
    
    // Get a connection from the pool
    connection = await pool.getConnection();
    
    // Query the database for a user with the given email.
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      // If no user is found, return an error.
      return { error: 'Username not found' };
    }

    const user = rows[0];

    // For demo purposes, we compare plain text passwords.
    // In production, store hashed passwords and use a library (e.g., bcrypt) to compare.
    if (user.password !== password) {
      return { error: 'Wrong password' };
    }

    // Successful authentication.
    return { user };
  } catch (err) {
    console.error('Authentication error:', err);
    return { error: err.message || 'Internal server error' };
  } finally {
    // Always release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Database connection released');
    }
  }
}

// /**
//  * Generate a JWT token for an authenticated user.
//  * @param {Object} user - The authenticated user object.
//  * @returns {string} - The JWT token.
//  */
// export function generateToken(user) {
//   return jwt.sign(
//     { uuid: user.UUID, email: user.email, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: '1h' }
//   );
// }
