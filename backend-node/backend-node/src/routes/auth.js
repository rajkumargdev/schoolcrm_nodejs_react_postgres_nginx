const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

function createToken(id, role) {
  return jwt.sign(
    { sub: String(id), role, id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// POST /auth/teacher/login
router.post('/teacher/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'username and password required' });

  try {
    const { rows } = await pool.query(
      'SELECT id, name, password_hash FROM teachers WHERE username = $1',
      [username]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const teacher = rows[0];
    const valid = await bcrypt.compare(password, teacher.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = createToken(teacher.id, 'teacher');
    return res.json({ token, name: teacher.name, role: 'teacher' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/student/login
router.post('/student/login', async (req, res) => {
  const { roll_no, password } = req.body;
  if (!roll_no || !password)
    return res.status(400).json({ error: 'roll_no and password required' });

  try {
    const { rows } = await pool.query(
      'SELECT id, name, password_hash FROM students WHERE roll_no = $1',
      [roll_no]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const student = rows[0];
    const valid = await bcrypt.compare(password, student.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = createToken(student.id, 'student');
    return res.json({ token, name: student.name, role: 'student' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
