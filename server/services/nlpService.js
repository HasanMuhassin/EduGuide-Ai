// Custom NLP module
const nlpService = {
  // Simple tokenization and normalization
  preprocess: (text) => {
    return text.toLowerCase().replace(/[^\w\s]/g, '').split(' ');
  },

  // Intent detection based on keywords
  detectIntent: (tokens) => {
    const text = tokens.join(' ');
    if (text.includes('compare') || text.includes('difference') || text.includes('vs')) {
      return 'comparison';
    }
    if (text.includes('fee') || text.includes('cost') || text.includes('price') || text.includes('under')) {
      return 'fee_query';
    }
    if (text.includes('duration') || text.includes('long') || text.includes('time') || text.includes('months') || text.includes('years')) {
      return 'duration_query';
    }
    if (text.includes('course') || text.includes('study') || text.includes('learn') || text.includes('degree') || text.includes('diploma')) {
      return 'course_search';
    }
    if (['hi', 'hello', 'hey', 'greetings'].some(g => tokens.includes(g))) {
      return 'greeting';
    }
    return 'unknown';
  },

  // Extract entities (course name, budget, field)
  extractEntities: (tokens) => {
    const entities = {};
    const text = tokens.join(' ');

    // Extract budget (e.g. "under 300k", "less than 500000")
    const budgetMatch = text.match(/(under|less than|below)\s*(\d+(?:k|m|000)?)/i);
    if (budgetMatch) {
      let amountStr = budgetMatch[2].toLowerCase();
      let amount = parseInt(amountStr.replace(/k/, '000').replace(/m/, '000000'));
      if (!isNaN(amount)) {
        entities.budget = amount;
      }
    }

    // Extract field/course (simple list for demo, ideally you'd use a better named entity recognizer)
    const fields = ['it', 'software', 'engineering', 'business', 'management', 'marketing', 'design', 'arts', 'science', 'computing', 'data'];
    const matchedField = fields.find(f => tokens.includes(f));
    if (matchedField) {
      entities.field = matchedField;
    }

    // For comparison, extract two courses (simplistic approach)
    if (text.includes('compare')) {
      // Find possible entities around 'and' or 'vs'
      const possibleCourses = tokens.filter(t => t.length > 2 && t !== 'compare' && t !== 'and' && t !== 'vs');
      if (possibleCourses.length >= 2) {
        entities.course1 = possibleCourses[0];
        entities.course2 = possibleCourses[1];
      }
    }

    return entities;
  },

  analyze: (text) => {
    const tokens = nlpService.preprocess(text);
    const intent = nlpService.detectIntent(tokens);
    const entities = nlpService.extractEntities(tokens);

    return {
      text,
      tokens,
      intent,
      entities
    };
  }
};

module.exports = { nlpService };
