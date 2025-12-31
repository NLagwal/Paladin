const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Auth Service' });
});

const authRouter = require('./routes/auth');

app.use('/', authRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Auth Service running on port ${PORT}`);
});
