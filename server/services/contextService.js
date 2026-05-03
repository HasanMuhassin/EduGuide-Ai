const sessions = {};

const getContext = (userId) => {
  if (!sessions[userId]) {
    sessions[userId] = { lastIntent: null, lastEntities: {}, history: [] };
  }
  return sessions[userId];
};

const updateContext = (userId, intent, entities, message) => {
  if (!sessions[userId]) {
    sessions[userId] = { lastIntent: null, lastEntities: {}, history: [] };
  }
  sessions[userId].history.push(message);
  
  // Merge entities (keep old ones if not overwritten)
  sessions[userId].lastEntities = { ...sessions[userId].lastEntities, ...entities };
  
  if (intent && intent !== 'unknown') {
    sessions[userId].lastIntent = intent;
  }
};

module.exports = { contextService: { getContext, updateContext } };
