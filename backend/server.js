const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create / open SQLite database
const db = new sqlite3.Database("./payments.db", (err) => {
  if (err) console.error("DB connection error:", err.message);
  else console.log("Connected to SQLite database.");
});

// Create table if not exists
db.run(
  `CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    amount REAL,
    reason TEXT,
    date TEXT
  )`
);

// Routes
app.get("/payments", (req, res) => {
  db.all("SELECT * FROM payments ORDER BY id DESC", [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.post("/payments", (req, res) => {
  const { name, amount, reason, date } = req.body;
  db.run(
    "INSERT INTO payments (name, amount, reason, date) VALUES (?, ?, ?, ?)",
    [name, amount, reason, date],
    function (err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ id: this.lastID, name, amount, reason, date });
    }
  );
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
