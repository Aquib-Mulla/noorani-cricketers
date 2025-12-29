import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

// Railway provides a single connection string called MYSQL_URL
// or individual variables. This setup handles both.
const db = mysql.createConnection(process.env.MYSQL_URL || {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL Connection Error:", err.message);
  } else {
    console.log("✅ Connected to Railway MySQL");
  }
});

export default db;