import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Aquib@1234", // your MySQL password
  database: "noorani_cricketers"
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL Error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

export default db;
