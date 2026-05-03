const express = require('express');
const router = express.Router();
const { dbService } = require('../services/dbService');

router.get('/', async (req, res) => {
  try {
    const analytics = await dbService.getAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
