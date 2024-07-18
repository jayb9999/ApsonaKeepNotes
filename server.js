const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);
  db.run(`
    CREATE TABLE notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      content TEXT,
      tags TEXT,
      color TEXT,
      archived INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0,
      createdAt TEXT,
      updatedAt TEXT,
      dueDate TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);
});

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
const authRoutes = require('./routes/auth')(db, bcrypt, jwt);
const noteRoutes = require('./routes/notes')(db, jwt);

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
