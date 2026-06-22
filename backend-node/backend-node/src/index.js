require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const testRoutes = require('./routes/tests');
const marksRoutes = require('./routes/marks');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/students', studentRoutes);
app.use('/tests', testRoutes);
app.use('/marks', marksRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Connected to PostgreSQL`);
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
