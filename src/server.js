import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import bcrypt from "bcrypt";
import db from "./db.js";
import upload from "./upload.js";
import fs from "fs";


/* ================= ENV ================= */
dotenv.config();

/* ================= FIX __dirname ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= APP ================= */
const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= SESSION ================= */
app.use(
  session({
    secret: "noorani_admin_secret",
    resave: false,
    saveUninitialized: false,
  })
);

/* Make session available in EJS */
app.use((req, res, next) => {
  res.locals.isAdmin = req.session.admin || false;
  res.locals.adminUser = req.session.adminUser || null;
  next();
});

/* ================= STATIC FILES ================= */
app.use(express.static(path.join(__dirname, "../public")));

/* ================= VIEW ENGINE ================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

/* ================= AUTH MIDDLEWARE ================= */
function adminAuth(req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/login");
  }
}

/* ================= PUBLIC ROUTES ================= */
app.get("/", (req, res) => res.render("index"));
app.get("/about", (req, res) => res.render("about"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/events", (req, res) => res.render("events"));
app.get("/founder", (req, res) => res.render("founder"));
app.get("/links", (req, res) => res.render("links"));
app.get("/jersey", (req, res) => res.render("jersey"));
app.get("/addevent", (req, res) => res.render("addevent"));
app.get("/2024", (req, res) => res.render("2024"));
// adminaddplayer route
app.get("/addplayer", adminAuth, (req, res) => {
  res.redirect("/admin/add-player");
});


/* ================= ADD EVENT ================= */
app.post(
  "/admin/add-event",
  adminAuth,
  upload.single("event_image"),
  (req, res) => {

    const {
      event_name,
      event_date,
      event_description
    } = req.body;

    // save only relative path (same style as players)
    const eventImagePath = req.file
      ? `events/${req.file.filename}`
      : null;

    const sql = `
      INSERT INTO events
      (event_name, event_date, event_description, event_image)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        event_name,
        event_date || null,
        event_description || null,
        eventImagePath
      ],
      (err) => {
        if (err) {
          console.error("Add Event Error:", err);
          return res.send("Error saving event");
        }

        res.redirect("/events");
      }
    );
  }
);

/* =================  player details Route  ================= */
app.get("/playerdetail/:id", (req, res) => {
  const playerId = req.params.id;

  const sql = "SELECT * FROM players WHERE id = ?";
  db.query(sql, [playerId], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    if (result.length === 0) {
      return res.send("Player not found");
    }

    res.render("playerdetail", {
      player: result[0]
    });
  });
});

/* =================  Manage players Route  ================= */
app.get("/manageplayer", (req, res) => {
  const sql = "SELECT * FROM players";

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.render("manageplayer", { players: [] });
    }

    res.render("manageplayer", { players: results });
  });
});
// Edit Player Page
app.get("/admin/edit-player/:id", adminAuth, (req, res) => {
  const playerId = req.params.id;

  db.query("SELECT * FROM players WHERE id = ?", [playerId], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    if (result.length === 0) return res.redirect("/manageplayer");

    res.render("addplayer", { player: result[0] });
  });
});
/* =================  players Route  ================= */
app.get("/players", (req, res) => {
  db.query("SELECT * FROM players ORDER BY id DESC", (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    const players = results || []; // make sure it’s always an array
    console.log("Players from DB:", players); // optional: check output

    res.render("players", { players }); // PASS the players variable
  });
});

/* ================= upload players  ================= */
app.post(
  "/admin/add-player",
  adminAuth,
  upload.single("image"),
  (req, res) => {
    const {
      name,
      role,
      age,
      mobile,
      instagram,
      description,
    } = req.body;

    const imagePath = `players/${req.file.filename}`;

    db.query(
      `INSERT INTO players
      (name, role, age, mobile, instagram, description, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        role,
        age || null,
        mobile || null,
        instagram || null,
        description || null,
        imagePath,
      ],
      (err) => {
        if (err) {
          console.error(err);
          return res.send("Error saving player");
        }

        res.redirect("/players");
      }
    );
  }
);
/* ================= update players  ================= */
app.post(
  "/admin/update-player/:id",
  adminAuth,
  upload.single("image"),
  (req, res) => {
    const id = req.params.id;

    const {
      name,
      role,
      age,
      mobile,
      instagram,
      description,
    } = req.body;

    let query = `
      UPDATE players SET
        name = ?,
        role = ?,
        age = ?,
        mobile = ?,
        instagram = ?,
        description = ?
    `;

    const values = [
      name,
      role,
      age || null,
      mobile || null,
      instagram || null,
      description || null,
    ];

    // 🔹 IF NEW IMAGE IS UPLOADED
    if (req.file) {
      query += `, image = ?`;
      values.push(`players/${req.file.filename}`);
    }

    query += ` WHERE id = ?`;
    values.push(id);

    db.query(query, values, (err) => {
      if (err) {
        console.error(err);
        return res.send("Error updating player");
      }

      // ✅ AFTER UPDATE → GO BACK TO PLAYERS LIST
      res.redirect("/players");
    });
  }
);
/* ================= DELETE PLAYER ================= */
app.post("/admin/delete-player/:id", adminAuth, (req, res) => {
  const id = req.params.id;

  // First get image path
  db.query("SELECT image FROM players WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    if (result.length === 0) {
      return res.redirect("/manageplayer");
    }

    const imagePath = result[0].image
      ? path.join(__dirname, "../public", result[0].image)
      : null;

    // Delete DB record
    db.query("DELETE FROM players WHERE id = ?", [id], (err) => {
      if (err) {
        console.error(err);
        return res.send("Error deleting player");
      }

      // Delete image file if exists
      if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      res.redirect("/manageplayer");
    });
  });
});

// Add new player page (empty form)
app.get("/admin/add-player", adminAuth, (req, res) => {
  res.render("addplayer", { player: null });
});

app.get("/health", (req, res) => {
  res.send("Server is running");
});

/* ================= LOGIN PAGE ================= */
app.get("/login", (req, res) => {
  if (req.session.admin) {
    return res.redirect("/admindash");
  }
  res.render("login", { error: null });
});

/* ================= LOGIN LOGIC ================= */
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM admin WHERE username = ?",
    [username],
    async (err, result) => {
      if (err || result.length === 0) {
        return res.render("login", {
          error: "Invalid username or password",
        });
      }

      const admin = result[0];
      const match = await bcrypt.compare(password, admin.password);

      if (!match) {
        return res.render("login", {
          error: "Invalid username or password",
        });
      }

      /* LOGIN SUCCESS */
      req.session.admin = true;
      req.session.adminUser = admin.username;

      res.redirect("/admindash");
    }
  );
});

/* ================= ADMIN DASHBOARD ================= */
// Add new player page (empty form)
app.get("/admin/add-player", adminAuth, (req, res) => {
  res.render("addplayer", { player: null }); // pass player as null
});


app.get("/admindash", adminAuth, (req, res) => {
  res.render("admindash");
});

/* ================= ADMIN ONLY PAGES ================= */

app.get("/admin/add-event", adminAuth, (req, res) => {
  res.render("addevent");
});

/* ================= LOGOUT ================= */
app.get("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
