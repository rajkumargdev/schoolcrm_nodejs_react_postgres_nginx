const express = require('express');
const pool = require('../db');

const router = express.Router();

// POST /marks
router.post('/', async (req, res) => {
  const { student_id, test_id, subject_id, score, max_score } = req.body;
  if (!student_id || !test_id || !subject_id || score == null || max_score == null)
    return res.status(400).json({ error: 'student_id, test_id, subject_id, score, max_score required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO marks (student_id, test_id, subject_id, score, max_score)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, student_id, test_id, subject_id, score, max_score`,
      [student_id, test_id, subject_id, score, max_score]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505')
      return res.status(409).json({ error: 'Mark already entered for this student/test/subject' });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /marks/student/:id
router.get('/student/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT s.name AS subject_name, t.name AS test_name,
              m.score, m.max_score
       FROM marks m
       JOIN subjects s ON s.id = m.subject_id
       JOIN tests   t ON t.id = m.test_id
       WHERE m.student_id = $1
       ORDER BY t.test_date, s.name`,
      [id]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /marks/test/:id
router.get('/test/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT s.name AS subject_name, t.name AS test_name,
              m.score, m.max_score
       FROM marks m
       JOIN subjects s ON s.id = m.subject_id
       JOIN tests   t ON t.id = m.test_id
       WHERE m.test_id = $1
       ORDER BY m.student_id, s.name`,
      [id]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
