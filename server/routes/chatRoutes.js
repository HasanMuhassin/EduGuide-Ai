const express = require('express');
const router = express.Router();
const { handleChat, getChatHistory } = require('../controllers/chatController');
const sessionController = require('../controllers/sessionController');

// Main chat endpoint
router.post('/', handleChat);

// Chat history (legacy)
router.get('/history', getChatHistory);

// Chat session management
router.post('/sessions', sessionController.createSession);
router.get('/sessions', sessionController.getSessions);
router.get('/sessions/:chatId', sessionController.getSession);
router.delete('/sessions/:chatId', sessionController.deleteSession);
router.patch('/sessions/:chatId/rename', sessionController.renameSession);

module.exports = router;
