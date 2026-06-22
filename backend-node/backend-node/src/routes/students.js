const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();

// POST /students
router.post('/', async (req, res) => {
  const { name, roll_no, password } = req.body;
  if (!name || !roll_no || !password)
    return res.status(400).json({ error: 'name, roll_no, password required' });

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO students (name, roll_no, password_hash, class)
       VALUES ($1, $2, $3, 7)
       RETURNING id, name, roll_no, class`,
      [name, roll_no, password_hash]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505')
      return res.status(409).json({ error: 'roll_no already exists' });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /students
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, roll_no, class FROM students ORDER BY roll_no'
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /students/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM students WHERE id = $1', [id]);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
