const { nlpService } = require('../services/nlpService');
const dbService = require('../services/dbService');
const { geminiService } = require('../services/geminiService');
const { contextService } = require('../services/contextService');
const { recommendationService } = require('../services/recommendationService');
const { comparisonService } = require('../services/comparisonService');

const handleChat = async (req, res) => {
  const { message, userId = 'default_user' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // 1. Context Awareness
    const session = contextService.getContext(userId);
    let nlpResult = nlpService.analyze(message);

    // If query is very short or missing intent, try to inherit from context
    if (nlpResult.intent === 'unknown' && session.lastIntent) {
      nlpResult.intent = session.lastIntent;
      // Merge entities from current with session
      nlpResult.entities = { ...session.lastEntities, ...nlpResult.entities };
    }

    // Update session
    contextService.updateContext(userId, nlpResult.intent, nlpResult.entities, message);

    let reply = '';
    let handled = false;
    let comparisonData = null;

    // 2. Intent Routing
    if (nlpResult.intent === 'greeting') {
      reply = "Hello! I'm EduGuide AI. I can help you find courses, compare fees, and answer education-related questions. How can I assist you today?";
      handled = true;
    } else if (['course_search', 'fee_query', 'duration_query'].includes(nlpResult.intent)) {
      const courses = await dbService.findCourses(nlpResult.entities);
      
      if (courses.length > 0) {
        reply = `I found ${courses.length} course(s) that match your criteria:\n`;
        courses.forEach(c => {
          reply += `- **${c.name}** at ${c.university} (${c.field}). Fee: ${c.fee}. Duration: ${c.duration}.\n`;
        });
        handled = true;
      }
    } else if (nlpResult.intent === 'comparison') {
      const comp = await comparisonService.compareCourses(nlpResult.entities);
      if (comp) {
        reply = `Here is the comparison between ${comp.c1.name} and ${comp.c2.name}:`;
        comparisonData = comp;
        handled = true;
      }
    }

    // 3. FAQ Check
    if (!handled) {
      const faqAnswer = await dbService.findFaq(message);
      if (faqAnswer) {
        reply = faqAnswer;
        handled = true;
      }
    }

    // 4. AI Fallback
    if (!handled || nlpResult.intent === 'unknown') {
      reply = await geminiService.getAIResponse('', message);
      await dbService.saveTrainingData(message, reply);
    }

    // 5. Generate Recommendation
    const recommended = await recommendationService.getRecommendations(userId, session.history);

    // 6. Save History
    await dbService.saveChatHistory(userId, message, reply);

    res.json({
      reply,
      intent: nlpResult.intent,
      entities: nlpResult.entities,
      comparison: comparisonData,
      recommendation: recommended
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error processing chat' });
  }
};

module.exports = { handleChat };
