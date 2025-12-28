import bcrypt from "bcrypt";
import db from "./db.js";

const username = "Aquibmulla";
const password = "nooraniadmin97";

const createAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO admin (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      (err) => {
        if (err) {
          console.error("❌ Error inserting admin:", err);
        } else {
          console.log("✅ Admin created successfully");
        }
        process.exit();
      }
    );
  } catch (err) {
    console.error("❌ Bcrypt error:", err);
    process.exit();
  }
};

createAdmin();
