/**
 * Session Controller — manages independent chat sessions in Firestore
 * Collection: chat_sessions/{chatId}
 *   - userId, title, createdAt, updatedAt, context, messages[]
 */

const { db } = require('../config/firebaseConfig');
const { v4: uuidv4 } = require('uuid');

const SESSIONS = 'chat_sessions';

/** Create a new empty chat session */
const createSession = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const chatId = uuidv4();
    const now = new Date();

    await db.collection(SESSIONS).doc(chatId).set({
      chatId,
      userId,
      title: 'New Chat',
      createdAt: now,
      updatedAt: now,
      context: { lastIntent: null, lastCourse: null, lastCourses: [], lastField: null },
      messages: []
    });

    res.json({ chatId, title: 'New Chat', createdAt: now });
  } catch (err) {
    console.error('createSession error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

/** Get all sessions for a user (latest first) */
const getSessions = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const snapshot = await db.collection(SESSIONS)
      .where('userId', '==', userId)
      .limit(50)
      .get();

    const sessions = snapshot.docs
      .map(doc => {
        const d = doc.data();
        return {
          chatId: doc.id,
          title: d.title || 'New Chat',
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          messageCount: d.messages?.length || 0
        };
      })
      // Sort latest first in memory — avoids needing composite Firestore index
      .sort((a, b) => {
        const ta = a.updatedAt?._seconds || 0;
        const tb = b.updatedAt?._seconds || 0;
        return tb - ta;
      });

    res.json(sessions);
  } catch (err) {
    console.error('getSessions error:', err);
    res.status(500).json({ error: 'Failed to load sessions' });
  }
};

/** Get a single session with all messages */
const getSession = async (req, res) => {
  try {
    const { chatId } = req.params;
    const doc = await db.collection(SESSIONS).doc(chatId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Session not found' });
    res.json(doc.data());
  } catch (err) {
    console.error('getSession error:', err);
    res.status(500).json({ error: 'Failed to load session' });
  }
};

/** Delete a session */
const deleteSession = async (req, res) => {
  try {
    const { chatId } = req.params;
    await db.collection(SESSIONS).doc(chatId).delete();
    res.json({ success: true });
  } catch (err) {
    console.error('deleteSession error:', err);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

/** Rename a session */
const renameSession = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;
    await db.collection(SESSIONS).doc(chatId).update({ title, updatedAt: new Date() });
    res.json({ success: true });
  } catch (err) {
    console.error('renameSession error:', err);
    res.status(500).json({ error: 'Failed to rename session' });
  }
};

module.exports = { createSession, getSessions, getSession, deleteSession, renameSession };
