const express = require('express');

module.exports = (db, jwt) => {
  const router = express.Router();

  // Middleware to authenticate user
  const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).send('Access denied');
    jwt.verify(token, 'SECRET_KEY', (err, decoded) => {
      if (err) return res.status(401).send('Invalid token');
      req.userId = decoded.userId;
      next();
    });
  };

  // Create a new note
  router.post('/', authenticate, (req, res) => {
    const { content, tags, color, dueDate } = req.body;
    const tagsString = tags.join(',');

    db.run(
      `INSERT INTO notes (userId, content, tags, color, createdAt, updatedAt, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, content, tagsString, color, new Date().toISOString(), new Date().toISOString(), dueDate],
      function (err) {
        if (err) {
          return res.status(500).send('Failed to create note');
        }
        res.status(201).json({ id: this.lastID, userId: req.userId, content, tags, color, archived: 0, deleted: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), dueDate });
      }
    );
  });

  // Get all notes
  router.get('/', authenticate, (req, res) => {
    db.all(`SELECT * FROM notes WHERE userId = ? AND deleted = 0`, [req.userId], (err, notes) => {
      if (err) {
        return res.status(500).send('Failed to retrieve notes');
      }
      res.json(notes);
    });
  });

  // Update a note
  router.put('/:id', authenticate, (req, res) => {
    const { content, tags, color, archived, deleted, dueDate } = req.body;
    const tagsString = tags.join(',');

    db.run(
      `UPDATE notes SET content = ?, tags = ?, color = ?, archived = ?, deleted = ?, updatedAt = ?, dueDate = ? WHERE id = ? AND userId = ?`,
      [content, tagsString, color, archived, deleted, new Date().toISOString(), dueDate, req.params.id, req.userId],
      function (err) {
        if (err) {
          return res.status(500).send('Failed to update note');
        }
        res.send('Note updated');
      }
    );
  });

  // Delete a note
  router.delete('/:id', authenticate, (req, res) => {
    db.run(
      `UPDATE notes SET deleted = 1, updatedAt = ? WHERE id = ? AND userId = ?`,
      [new Date().toISOString(), req.params.id, req.userId],
      function (err) {
        if (err) {
          return res.status(500).send('Failed to delete note');
        }
        res.send('Note deleted');
      }
    );
  });

  // Get archived notes
  router.get('/archived', authenticate, (req, res) => {
    db.all(`SELECT * FROM notes WHERE userId = ? AND archived = 1 AND deleted = 0`, [req.userId], (err, notes) => {
      if (err) {
        return res.status(500).send('Failed to retrieve archived notes');
      }
      res.json(notes);
    });
  });

  // Get notes by label
  router.get('/label/:label', authenticate, (req, res) => {
    db.all(`SELECT * FROM notes WHERE userId = ? AND tags LIKE ? AND deleted = 0`, [req.userId, `%${req.params.label}%`], (err, notes) => {
      if (err) {
        return res.status(500).send('Failed to retrieve notes by label');
      }
      res.json(notes);
    });
  });

  // Get notes with upcoming due dates
  router.get('/reminders', authenticate, (req, res) => {
    db.all(`SELECT * FROM notes WHERE userId = ? AND dueDate >= ? AND deleted = 0`, [req.userId, new Date().toISOString()], (err, notes) => {
      if (err) {
        return res.status(500).send('Failed to retrieve reminders');
      }
      res.json(notes);
    });
  });

  return router;
};
