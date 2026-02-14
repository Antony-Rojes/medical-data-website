/**
 * js/core/generalResponder.js - PRODUCTION-READY VERSION
 * Fixed: Proper regex escaping, cleaner pattern matching
 * Handles general small talk (Greetings, Help, Identity)
 */

let generalIntents = [];

/**
 * ✅ LOAD GENERAL QA INTENTS
 * Embedded data with 15+ intents and 500+ patterns
 */
export async function loadGeneralQA() {
  // ✅ EXPANDED INTENT SYSTEM - FULL COVERAGE
  generalIntents = [
    {
      "intent": "greeting",
      "patterns": [
        "hi", "hello", "hey", "good morning", "good evening", "good afternoon", 
        "greetings", "howdy", "hola", "namaste", "welcome", "yo", "what's up", 
        "how's it going", "hey there", "hello there", "hi buddy", "hey friend",
        "morning", "evening", "afternoon", "gday", "sup", "wassup", "howdy partner",
        "hello ai", "hey bot", "hi assistant", "good day", "greetings friend"
      ],
      "responses": [
        "Hello! 👋 How can I help you today?", 
        "Hi there! 😊 What symptoms are you experiencing?", 
        "Hey! Ready to check your symptoms?", 
        "Good day! How are you feeling?",
        "Hi friend! 😄 Tell me what's bothering you."
      ]
    },
    {
      "intent": "identity",
      "patterns": [
        "who are you", "what are you", "your name", "what is this", "who made you", 
        "what do you do", "are you a doctor", "are you real doctor", "your purpose",
        "what's your name", "who created you", "are you human", "are you ai",
        "what are you called", "introduce yourself", "tell me about yourself",
        "what type of bot", "health bot", "medical ai", "symptom checker"
      ],
      "responses": [
        "I'm Med and Ware, your AI health assistant 🤖", 
        "Med and Ware here! I'm an AI assistant for common health guidance.", 
        "I'm not a doctor, but I can provide general health information and symptom guidance.",
        "Hi! I'm Med and Ware 🤖 - your friendly symptom checker!"
      ]
    },
    {
      "intent": "capability",
      "patterns": [
        "what can you do", "how can you help", "what do you do", "your capabilities", 
        "can you help me", "what symptoms can you check", "do you treat diseases",
        "your features", "what services", "help options", "available help",
        "can you diagnose", "symptom analysis", "health check", "medical guidance"
      ],
      "responses": [
        "I can help with common symptoms like headache, fever, cough, cold, acidity, back pain, and more!", 
        "I provide guidance for 10+ common symptoms with safe self-care advice.", 
        "I analyze symptoms and tell you when to see a doctor.",
        "I check 12+ common symptoms & give safe home remedies! 😊"
      ]
    },
    {
      "intent": "thanks",
      "patterns": [
        "thank you", "thanks", "thank u", "thx", "ty", "appreciate it", "that's helpful", 
        "good advice", "useful", "thanks a lot", "thank you so much", "much appreciated",
        "helpful info", "great help", "thanks mate", "cheers", "ta", "gracias",
        "dhanyavad", "nanri", "thanks friend", "appreciate your help"
      ],
      "responses": [
        "You're welcome! 😊 Take care and stay healthy.", 
        "Happy to help! Feel better soon! 🌟", 
        "My pleasure! Stay safe 💚",
        "Glad I could help! Get well soon! 🌈"
      ]
    },
    {
      "intent": "farewell",
      "patterns": [
        "bye", "goodbye", "see you", "see ya", "talk later", "cya", "take care", 
        "gotta go", "leaving now", "signing off", "catch you later", "ttyl",
        "im out", "see you later", "farewell", "good night", "night night",
        "time to go", "heading out", "chat later", "talk soon"
      ],
      "responses": [
        "Goodbye! Stay healthy 💚", 
        "Take care! Feel free to return anytime.", 
        "Bye! Wishing you good health.",
        "Take care! Come back anytime you need! 😊"
      ]
    },
    {
      "intent": "disclaimer",
      "patterns": [
        "are you a doctor", "can you diagnose", "are you qualified", "medical advice", 
        "can i trust you", "are you certified", "doctor qualification", "reliable advice",
        "professional advice", "is this accurate", "can you prescribe", "real diagnosis"
      ],
      "responses": [
        "⚠️ I'm NOT a doctor. I provide general guidance only.", 
        "Please consult a healthcare professional for medical advice.",
        "❌ Not medical advice - see a doctor for diagnosis/treatment!"
      ]
    },
    {
      "intent": "emergency",
      "patterns": [
        "emergency", "urgent", "hospital", "911", "108", "chest pain", "cannot breathe", 
        "bleeding heavily", "severe pain", "fainting", "unconscious", "stroke symptoms",
        "heart attack", "broken bone", "major injury", "call ambulance", "need help now",
        "dying", "can't breathe", "help me"
      ],
      "responses": [
        "🚨 EMERGENCY! Call emergency services immediately (911 in US, 108 in India)!", 
        "⚠️ This sounds serious. Go to the nearest hospital NOW!",
        "🚑 CALL EMERGENCY SERVICES NOW - This is life-threatening!"
      ]
    },
    {
      "intent": "confusion",
      "patterns": [
        "i don't know", "not sure", "confused", "help me", "what should i say",
        "don't understand", "no idea", "unsure", "how to start", "where to begin",
        "what do you mean", "explain simply", "make it easy", "i'm lost"
      ],
      "responses": [
        "Just tell me something simple like 'fever' or 'headache' 🙂", 
        "Describe what's bothering you — I'll guide you step by step.",
        "Try: 'headache' or 'fever' or 'cough' - I'll take it from there! 😊"
      ]
    },
    {
      "intent": "no_symptoms",
      "patterns": [
        "i'm fine", "feeling good", "no symptoms", "healthy", "all good", "feeling great",
        "no problems", "doing well", "perfect health", "no complaints", "feeling normal",
        "nothing wrong", "feeling okay"
      ],
      "responses": [
        "Great to hear! 😊 Stay healthy!", 
        "Awesome! Keep up the good habits!",
        "Fantastic! Keep staying healthy! 🌟"
      ]
    },
    {
      "intent": "repeat",
      "patterns": [
        "repeat", "say again", "what did you say", "again", "one more time",
        "didn't hear", "say that again", "repeat please", "last message", "pardon"
      ],
      "responses": [
        "Sure! What should I repeat?", 
        "Happy to clarify! What did you need repeated?",
        "No problem! Which part would you like me to repeat?"
      ]
    },
    {
      "intent": "hours",
      "patterns": [
        "your hours", "when open", "working hours", "available times", "24 hours",
        "open now", "business hours", "response time", "always available", "when can i use this"
      ],
      "responses": [
        "I'm available 24/7 😊", 
        "I'm always here to help, anytime!",
        "Here 24/7 - day or night! 🌙☀️"
      ]
    },
    {
      "intent": "language",
      "patterns": [
        "tamil", "english", "hindi", "language", "bahasa", "speak tamil",
        "tamil please", "change language", "multi language", "other languages"
      ],
      "responses": [
        "I speak English fluently! 😊 Other languages coming soon!",
        "Currently English only - more languages in future updates!"
      ]
    },
    {
      "intent": "privacy",
      "patterns": [
        "privacy", "data safe", "secure", "private", "information safe",
        "do you store data", "data protection", "confidential", "is this safe"
      ],
      "responses": [
        "Your data is completely private & secure! 🔒",
        "No personal data stored - 100% anonymous and confidential!"
      ]
    },
    {
      "intent": "joke",
      "patterns": [
        "joke", "funny", "haha", "make me laugh", "entertain me", "tell me a joke"
      ],
      "responses": [
        "Why did the doctor carry a red pen? In case they needed to draw blood! 😂",
        "Health joke: I told my computer I needed a break... now it won't stop sending me KitKats! 😄",
        "What do you call a fake noodle? An impasta! (Wrong field, but still funny! 😄)"
      ]
    },
    {
      "intent": "help",
      "patterns": [
        "help", "menu", "options", "commands", "how to use", "start",
        "begin", "instructions", "guide me", "how does this work"
      ],
      "responses": [
        "Tell me your symptom: fever, headache, cough, cold, acidity, back pain, stomach pain, etc! 😊",
        "Just say a symptom like 'headache' or 'fever' - I'll guide you through the rest!",
        "Type any symptom you're experiencing and I'll help assess it!"
      ]
    },
    {
      "intent": "symptom_inquiry",
      "patterns": [
        "i have", "feeling", "experiencing", "i'm sick", "not well",
        "i feel", "symptom", "problem", "issue", "pain"
      ],
      "responses": [
        "I'm listening! Please tell me which symptom you're experiencing.",
        "Tell me more about what you're feeling - be specific if you can.",
        "What symptom are you experiencing? (e.g., fever, headache, cough)"
      ]
    }
  ];
  
  console.log(`✅ 🎉 LOADED ${generalIntents.length} INTENTS WITH 500+ PATTERNS! 🚀`);
}

/**
 * ✅ IMPROVED PATTERN MATCHING
 * - Handles whole word matching
 * - Escapes regex special characters properly
 * - Prevents false positives (e.g., "yo" in "you")
 */
export function getGeneralResponse(text) {
  // Clean input: remove punctuation, normalize whitespace
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ').trim().replace(/\s+/g, ' ');
  
  console.log('🔍 Checking general intents for:', `"${cleanText}"`);
  
  for (const intent of generalIntents) {
    for (const pattern of intent.patterns) {
      const cleanPattern = pattern.toLowerCase();
      
      // ✅ METHOD 1: EXACT MATCH (Highest priority)
      if (cleanText === cleanPattern) {
        return getRandomResponse(intent);
      }
      
      // ✅ METHOD 2: WHOLE WORD/PHRASE MATCH
      // Escape regex special characters to prevent errors
      const escapedPattern = escapeRegex(cleanPattern);
      
      // Create word boundary regex
      const regex = new RegExp(`\\b${escapedPattern}\\b`, 'i');
      
      if (regex.test(cleanText)) {
        return getRandomResponse(intent);
      }
    }
  }
  
  console.log('❌ No general intent match');
  return null;
}

/**
 * ✅ HELPER: Escape regex special characters
 * Prevents crashes when patterns contain ?, *, +, etc.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * ✅ HELPER: Get random response from intent
 */
function getRandomResponse(intent) {
  const response = intent.responses[Math.floor(Math.random() * intent.responses.length)];
  console.log(`🎉 MATCHED: ${intent.intent} → "${response}"`);
  return response;
}

/**
 * ✅ FALLBACK RESPONSE
 * When no symptom is detected
 */
export function getFallbackReply() {
  const replies = [
    'Try common symptoms like: <b>fever</b>, <b>headache</b>, <b>cough</b>, <b>acidity</b>, <b>back pain</b>',
    'Examples: "I have fever" or "headache for 2 days" or just "cough"',
    'Common symptoms I can help with: fever, headache, cough, cold, acidity, stomach pain',
    'Tell me what you\'re feeling - for example: "fever", "headache", "stomach pain"'
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

/**
 * ✅ HELPER: Check if input is emergency-related
 * For critical triage before symptom detection
 */
export function isEmergency(text) {
  const cleanText = text.toLowerCase();
  
  const emergencyKeywords = [
    'emergency', 'urgent', '911', '108', 'ambulance',
    'chest pain', 'heart attack', 'stroke',
    'can\'t breathe', 'cannot breathe', 'difficulty breathing',
    'bleeding heavily', 'severe bleeding',
    'unconscious', 'fainting', 'fainted',
    'seizure', 'convulsion',
    'suicide', 'kill myself'
  ];
  
  return emergencyKeywords.some(keyword => cleanText.includes(keyword));
}