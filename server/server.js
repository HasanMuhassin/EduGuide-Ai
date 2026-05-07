const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
require('dotenv').config();

const chatRoutes = require('./routes/chatRoutes');
const courseRoutes = require('./routes/courseRoutes');
const faqRoutes = require('./routes/faqRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://edu-guide-ai-w6hu.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// Add manual training endpoint directly or via routes
app.post('/api/train', async (req, res) => {
  const dbService = require('./services/dbService');
  const { user_input, response } = req.body;
  if (!user_input || !response) {
    return res.status(400).json({ error: 'Missing user_input or response' });
  }
  try {
    await dbService.saveTrainingData(user_input, response);
    res.json({ message: 'Training data added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add training data' });
  }
});

// Get history
app.get('/api/history', async (req, res) => {
  const dbService = require('./services/dbService');
  const userId = req.query.userId || 'default_user';
  try {
    const history = await dbService.getChatHistory(userId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    error: 'An unexpected internal error occurred.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
