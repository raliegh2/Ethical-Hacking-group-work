const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireLogin } = require('../middleware/auth');

// Get all active challenges
router.get('/', (req, res) => {
  const challenges = db.prepare(
    'SELECT id, title, category, difficulty, points, description FROM challenges WHERE is_active = 1'
  ).all();
  res.json(challenges);
});

// Get single challenge
router.get('/:id', requireLogin, (req, res) => {
  const challenge = db.prepare(
    'SELECT id, title, category, difficulty, points, description, hint FROM challenges WHERE id = ? AND is_active = 1'
  ).get(req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
  res.json(challenge);
});

// Submit a flag
router.post('/:id/submit', requireLogin, (req, res) => {
  const { flag } = req.body;
  const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(req.params.id);

  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  const alreadySolved = db.prepare(
    'SELECT id FROM solves WHERE user_id = ? AND challenge_id = ?'
  ).get(req.session.user.id, challenge.id);

  if (alreadySolved) return res.json({ result: 'already_solved' });

  if (flag.trim() === challenge.flag.trim()) {
    db.prepare('INSERT INTO solves (user_id, challenge_id) VALUES (?, ?)').run(req.session.user.id, challenge.id);
    db.prepare('UPDATE users SET total_points = total_points + ? WHERE id = ?').run(challenge.points, req.session.user.id);
    return res.json({ result: 'correct', points: challenge.points });
  }

  res.json({ result: 'incorrect' });
});

module.exports = router;