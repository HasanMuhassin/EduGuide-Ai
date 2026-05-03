const express = require('express');
const router = express.Router();
const { dbService } = require('../services/dbService');

router.get('/pending', async (req, res) => {
  try {
    const pending = await dbService.getPendingTraining();
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending training' });
  }
});

router.post('/respond', async (req, res) => {
  try {
    const { id, response } = req.body;
    if (!id || !response) {
      return res.status(400).json({ error: 'Missing id or response' });
    }
    await dbService.respondToTraining(id, response);
    res.json({ message: 'Training response saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to respond to training' });
  }
});

module.exports = router;
