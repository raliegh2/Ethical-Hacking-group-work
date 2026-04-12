const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAdmin } = require('../middleware/auth');

// Gets all challenges (including inactive)
router.get('/challenges', requireAdmin, (req, res) => {
  const challenges = db.prepare('SELECT * FROM challenges').all();
  res.json(challenges);
});

// Add a challenge
router.post('/challenge', requireAdmin, (req, res) => {
  const { title, category, difficulty, points, description, flag, hint, hint_cost } = req.body;
  db.prepare(`
    INSERT INTO challenges (title, category, difficulty, points, description, flag, hint, hint_cost)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, category, difficulty, points, description, flag, hint, hint_cost);
  res.json({ message: 'Challenge added successfully' });
});

// Edit a challenge
router.put('/challenge/:id', requireAdmin, (req, res) => {
  const { title, category, difficulty, points, description, flag, hint } = req.body;
  db.prepare(`
    UPDATE challenges SET title=?, category=?, difficulty=?, points=?, description=?, flag=?, hint=?
    WHERE id=?
  `).run(title, category, difficulty, points, description, flag, hint, req.params.id);
  res.json({ message: 'Challenge updated successfully' });
});

// Delete a challenge
router.delete('/challenge/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM challenges WHERE id = ?').run(req.params.id);
  res.json({ message: 'Challenge deleted successfully' });
});

// Toggle challenge active/inactive
router.patch('/challenge/:id/toggle', requireAdmin, (req, res) => {
  db.prepare('UPDATE challenges SET is_active = NOT is_active WHERE id = ?').run(req.params.id);
  res.json({ message: 'Challenge toggled successfully' });
});

// Reset the scoreboard (new semester)
router.post('/reset', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM solves').run();
  db.prepare('UPDATE users SET total_points = 0').run();
  res.json({ message: 'Scoreboard has been reset' });
});

module.exports = router;