import mysql from "mysql2";

// Create a connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,       // Railway MySQL host
  user: process.env.DB_USER,       // Railway MySQL user
  password: process.env.DB_PASSWORD, // Railway MySQL password
  database: process.env.DB_NAME,   // Railway MySQL database
  waitForConnections: true,
  connectionLimit: 10,             // Max simultaneous connections
  queueLimit: 0
});

// Test the database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
  } else {
    console.log("✅ MySQL Connected Successfully");
    connection.release(); // Release connection back to pool
  }
});

// Export promise-based pool for async/await queries
export default db.promise();
