const express = require('express');

module.exports = (db, bcrypt, jwt) => {
  const router = express.Router();

  // Register
  router.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
      if (err) {
        return res.status(500).send('User registration failed');
      }
      res.status(201).send('User registered');
    });
  });

  // Login
  router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
      if (err || !user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).send('Invalid credentials');
      }
      const token = jwt.sign({ userId: user.id }, 'SECRET_KEY');
      res.json({ token });
    });
  });

  return router;
};
