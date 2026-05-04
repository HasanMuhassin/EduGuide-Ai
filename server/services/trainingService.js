/**
 * Training Service — EduGuide AI Self-Learning System
 *
 * Responsibilities:
 * 1. Check learned answers BEFORE falling back to AI
 * 2. Store unanswered questions (deduplication)
 * 3. Mark questions as trained when admin answers them
 */

const { db } = require('../config/firebaseConfig');

const COLLECTION = 'training';
const FALLBACK_MESSAGE = "Sorry, I couldn't clearly understand your question. Please contact our customer care agent at 0754864688 for further assistance.";

// ── Text normalizer ─────────────────────────────────────────────────────────
const normalize = (text) =>
  (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

// ── Token overlap similarity (0 to 1) ──────────────────────────────────────
const similarity = (a, b) => {
  const tokA = new Set(normalize(a).split(' ').filter(w => w.length > 2));
  const tokB = new Set(normalize(b).split(' ').filter(w => w.length > 2));
  if (!tokA.size || !tokB.size) return 0;
  let overlap = 0;
  tokA.forEach(t => { if (tokB.has(t)) overlap++; });
  return overlap / Math.max(tokA.size, tokB.size);
};

const trainingService = {
  FALLBACK_MESSAGE,

  /**
   * Step 1 — Check if user question matches a TRAINED response.
   * Returns { matched: true, response } or { matched: false }
   */
  findLearnedAnswer: async (userInput) => {
    try {
      const norm = normalize(userInput);
      const snapshot = await db.collection(COLLECTION)
        .where('status', '==', 'trained')
        .get();

      let best = null;
      let bestScore = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!data.response) return;

        // Check exact normalized match first
        if (normalize(data.user_input) === norm) {
          best = { id: doc.id, ...data };
          bestScore = 1.0;
          return;
        }

        // Token-overlap similarity
        const score = similarity(userInput, data.user_input);
        if (score > bestScore && score >= 0.55) {  // 55% overlap threshold
          bestScore = score;
          best = { id: doc.id, ...data };
        }
      });

      if (best) {
        return { matched: true, response: best.response, score: bestScore };
      }
      return { matched: false };
    } catch (err) {
      console.warn('trainingService.findLearnedAnswer error:', err.message);
      return { matched: false };
    }
  },

  /**
   * Step 2 — Store unanswered question (with deduplication).
   * Returns docId of new or existing entry.
   */
  storeUnknown: async (userInput, detectedIntent = null) => {
    try {
      const norm = normalize(userInput);
      if (!norm) return null;

      // Check for near-duplicate in pending items
      const snapshot = await db.collection(COLLECTION)
        .where('status', '==', 'pending')
        .get();

      for (const doc of snapshot.docs) {
        const existing = normalize(doc.data().user_input || '');
        if (existing === norm || similarity(userInput, doc.data().user_input) >= 0.80) {
          // Already stored — bump count
          await doc.ref.update({
            occurrences: (doc.data().occurrences || 1) + 1,
            last_seen: new Date()
          });
          return doc.id;
        }
      }

      // New unknown question
      const docRef = await db.collection(COLLECTION).add({
        user_input: userInput,
        normalized_input: norm,
        detected_intent: detectedIntent,
        response: null,
        status: 'pending',
        occurrences: 1,
        createdAt: new Date(),
        last_seen: new Date()
      });

      return docRef.id;
    } catch (err) {
      console.warn('trainingService.storeUnknown error:', err.message);
      return null;
    }
  },

  /**
   * Step 3 — Admin trains the system: saves response + marks as trained.
   */
  markTrained: async (docId, response) => {
    try {
      await db.collection(COLLECTION).doc(docId).update({
        response: response.trim(),
        status: 'trained',
        trainedAt: new Date()
      });
      return true;
    } catch (err) {
      console.warn('trainingService.markTrained error:', err.message);
      return false;
    }
  },

  /**
   * Get all pending (unanswered) questions for admin dashboard.
   */
  getPending: async () => {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('status', '==', 'pending')
        .get();

      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.occurrences || 1) - (a.occurrences || 1));  // Most asked first
    } catch (err) {
      console.warn('trainingService.getPending error:', err.message);
      return [];
    }
  },

  /**
   * Get all trained Q&A pairs (for admin view).
   */
  getTrained: async () => {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('status', '==', 'trained')
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      return [];
    }
  },

  /**
   * Delete a training record.
   */
  deleteTraining: async (docId) => {
    try {
      await db.collection(COLLECTION).doc(docId).delete();
      return true;
    } catch { return false; }
  }
};

module.exports = { trainingService };
