const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

router.get('/', async (req, res) => {
  try {
    const faqs = await dbService.getAllFaqs();
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

router.post('/', async (req, res) => {
  try {
    const faq = await dbService.addFaq(req.body);
    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add FAQ' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const faq = await dbService.updateFaq(req.params.id, req.body);
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await dbService.deleteFaq(req.params.id);
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

module.exports = router;
