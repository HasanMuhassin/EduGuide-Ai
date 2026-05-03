require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

let db;

try {
  // If user provides path to service account key and it exists
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  
  if (serviceAccountPath) {
    const absolutePath = require('path').resolve(process.cwd(), serviceAccountPath);
    if (fs.existsSync(absolutePath)) {
      const serviceAccount = require(absolutePath);
      initializeApp({
        credential: cert(serviceAccount)
      });
      db = getFirestore();
      console.log('Firebase initialized with service account.');
    } else {
      throw new Error(`Service account file not found at ${absolutePath}`);
    }
  } else if (process.env.NODE_ENV === 'production') {
    // Attempt default initialization (works in GCP environments like Render/Railway)
    initializeApp();
    db = getFirestore();
    console.log('Firebase initialized with default credentials.');
  } else {
    throw new Error('Local environment missing FIREBASE_SERVICE_ACCOUNT_PATH');
  }
} catch (error) {
  console.warn('Firebase initialization failed. Mocking DB for local dev.', error.message);
  
  const MOCK_DB_PATH = require('path').join(__dirname, '../mock_database.json');
  
  // Load existing data or initialize
  let memoryDB = {
    courses: [],
    training: [],
    faq: [],
    chat_history: [],
    users: []
  };

  if (fs.existsSync(MOCK_DB_PATH)) {
    try {
      memoryDB = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf-8'));
    } catch (e) {
      console.error('Error reading mock DB', e);
    }
  }

  const saveMockDB = () => {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(memoryDB, null, 2));
  };

  db = {
    collection: (name) => ({
      where: (field, op, value) => ({
        get: async () => {
          const docs = (memoryDB[name] || []).filter(d => d[field] === value).map(d => ({ id: d.id, data: () => d }));
          return { empty: docs.length === 0, docs };
        }
      }),
      doc: (id) => ({
        update: async (data) => {
          const arr = memoryDB[name] || [];
          const idx = arr.findIndex(d => d.id === id);
          if (idx !== -1) {
            arr[idx] = { ...arr[idx], ...data };
            saveMockDB();
          }
        },
        delete: async () => {
          if (memoryDB[name]) {
            memoryDB[name] = memoryDB[name].filter(d => d.id !== id);
            saveMockDB();
          }
        }
      }),
      get: async () => {
        const docs = (memoryDB[name] || []).map(d => ({ id: d.id, data: () => d }));
        return { empty: docs.length === 0, docs };
      },
      add: async (data) => {
        const id = 'mock_id_' + Math.random().toString(36).substr(2, 9);
        if (!memoryDB[name]) memoryDB[name] = [];
        memoryDB[name].push({ id, ...data });
        saveMockDB();
        return { id };
      }
    })
  };
}

module.exports = { db };
