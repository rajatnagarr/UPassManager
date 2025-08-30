// db.js
import mysql from 'mysql2/promise';

// Create a connection pool to manage multiple connections efficiently
const pool = mysql.createPool({
  host: process.env.DB_HOST,         // AWS RDS endpoint
  user: process.env.DB_USER,         // Database username
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_DATABASE, // Database name
  port: process.env.DB_PORT,         // Database port (usually 3306)
  waitForConnections: true,
  connectionLimit: 25,               // Increased from 10 to 25
  queueLimit: 0,                     // Unlimited queue (0 means no limit)
  enableKeepAlive: true,             // Enable keep-alive to prevent stale connections
  keepAliveInitialDelay: 10000,      // 10 seconds
  namedPlaceholders: true,           // More efficient query preparation
  connectTimeout: 10000,             // 10 seconds connection timeout
  idleTimeout: 30000,                // Close idle connections after 30 seconds (reduced from 60)
  maxIdle: 10,                       // Maximum number of idle connections to keep
  acquireTimeout: 10000,             // 10 seconds timeout when acquiring a connection
  decimalNumbers: true,              // Return decimal fields as numbers instead of strings
  dateStrings: true,                 // Return date fields as strings instead of Date objects
  multipleStatements: false,         // Prevent SQL injection by disabling multiple statements
  debug: false,                      // Set to true for debugging connection issues
  trace: false,                      // Set to true for tracing connection issues
});

// Function to check pool health and log connection stats
const checkPoolHealth = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connection successful');
    
    // Get connection stats
    const [rows] = await connection.query('SHOW STATUS LIKE "Conn%"');
    console.log('Connection stats:', rows);
    
    // Get process list to identify potential connection leaks
    const [processes] = await connection.query('SHOW PROCESSLIST');
    console.log('Active connections:', processes.length);
    
    // Check for long-running queries that might be holding connections
    const longRunningQueries = processes.filter(p => p.Time > 10); // Queries running for more than 10 seconds
    if (longRunningQueries.length > 0) {
      console.warn('Long-running queries detected:', longRunningQueries.length);
      console.warn('First long-running query:', longRunningQueries[0]);
    }
  } catch (error) {
    console.error('Database connection health check failed:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('Health check connection released');
    }
  }
};

// Function to forcibly close idle connections
const closeIdleConnections = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Get process list
    const [processes] = await connection.query('SHOW PROCESSLIST');
    
    // Find sleeping connections
    const sleepingConnections = processes.filter(p => p.Command === 'Sleep' && p.Time > 30);
    console.log(`Found ${sleepingConnections.length} idle connections to close`);
    
    // Kill sleeping connections
    for (const proc of sleepingConnections) {
      try {
        await connection.query(`KILL ${proc.Id}`);
        console.log(`Killed connection ${proc.Id}`);
      } catch (err) {
        console.error(`Failed to kill connection ${proc.Id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Error closing idle connections:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('Idle connection cleanup connection released');
    }
  }
};

// Run health check on startup
checkPoolHealth();

// Set up periodic health checks (every 5 minutes)
setInterval(checkPoolHealth, 300000);

// Set up periodic idle connection cleanup (every 2 minutes)
setInterval(closeIdleConnections, 120000);

// Add this function before the export statement
export const executeQuery = async (sql, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection released in executeQuery');
    }
  }
};

// Wrapper function to ensure connection is always released
export const withConnection = async (callback) => {
  let connection;
  try {
    connection = await pool.getConnection();
    return await callback(connection);
  } catch (error) {
    console.error('Database error in withConnection:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection released in withConnection');
    }
  }
};

export default pool;
