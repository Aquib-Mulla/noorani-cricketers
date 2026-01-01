import mysql from "mysql2";

// ❌ DO NOT use dotenv in Railway production
// ❌ DO NOT use DATABASE_URL

const db = mysql.createPool({
  host: process.env.DB_HOST,        // MYSQLHOST
  user: process.env.DB_USER,        // MYSQLUSER
  password: process.env.DB_PASSWORD,// MYSQLPASSWORD
  database: process.env.DB_NAME,    // MYSQLDATABASE
});

db.getConnection((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
  } else {
    console.log("✅ MySQL Connected Successfully");
  }
});

export default db;
