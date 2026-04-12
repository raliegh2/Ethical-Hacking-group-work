const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get the scoreboard
router.get('/', (req, res) => {
  const scores = db.prepare(`
    SELECT u.username, u.total_points,
    COUNT(s.id) as solve_count
    FROM users u
    LEFT JOIN solves s ON u.id = s.user_id
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY u.total_points DESC
  `).all();
  res.json(scores);
});

module.exports = router;