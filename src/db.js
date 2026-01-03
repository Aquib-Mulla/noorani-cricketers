import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// We use a Connection URI because cloud providers (like Aiven or TiDB) 
// give you one single long string to connect.
const db = mysql.createConnection(process.env.DATABASE_URL || {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) {
    console.error("❌ Database Connection Error:", err);
  } else {
    console.log("✅ Database Connected");
  }
});

export default db;