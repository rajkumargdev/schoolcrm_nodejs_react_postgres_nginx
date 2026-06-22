const express = require('express');
const pool = require('../db');

const router = express.Router();

// POST /tests
router.post('/', async (req, res) => {
  const { name, test_date } = req.body;
  if (!name || !test_date)
    return res.status(400).json({ error: 'name and test_date required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO tests (name, test_date, class)
       VALUES ($1, $2, 7)
       RETURNING id, name, test_date, class`,
      [name, test_date]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tests
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, test_date, class FROM tests ORDER BY test_date'
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /tests/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tests WHERE id = $1', [id]);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
