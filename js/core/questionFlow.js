/**
 * js/core/questionFlow.js - PRODUCTION-READY VERSION
 * Fixed: Proper question ID mapping to match JSON criteria
 */

/**
 * ✅ BUILDS USER CONDITION from questions and answers
 * Maps answers to proper field IDs that match JSON criteria
 */
export function buildUserCondition(questions, answers) {
  const condition = {};
  
  questions.forEach((q, index) => {
    // ✅ FIX: Use explicit ID from question if available
    // Falls back to type, then generated ID
    const fieldId = q.id || q.type || generateFieldId(q.question, index);
    
    // Store the answer
    condition[fieldId] = answers[index];
    
    console.log(`📝 Mapped: ${fieldId} = "${answers[index]}"`);
  });
  
  console.log('🔧 RAW CONDITION:', condition);
  return condition;
}

/**
 * ✅ GENERATES FIELD ID from question text
 * Smart detection based on question content
 */
function generateFieldId(question, index) {
  const text = question.toLowerCase();
  
  // Temperature questions
  if (text.includes('temperature') || text.includes('fever reading')) {
    return 'temperature';
  }
  
  // Duration questions
  if ((text.includes('day') || text.includes('duration')) && 
      (text.includes('last') || text.includes('how long') || text.includes('how many'))) {
    return 'duration_days';
  }
  
  // Vomiting questions
  if (text.includes('vomit')) {
    return 'vomiting';
  }
  
  // Other symptoms
  if (text.includes('other symptom') || text.includes('additional symptom')) {
    return 'other_symptoms';
  }
  
  // Pain level
  if (text.includes('pain') && (text.includes('level') || text.includes('severity'))) {
    return 'pain_level';
  }
  
  // Pain location
  if (text.includes('pain') && text.includes('where')) {
    return 'pain_location';
  }
  
  // Cough type
  if (text.includes('cough') && text.includes('type')) {
    return 'cough_type';
  }
  
  // Screen time (for headache)
  if (text.includes('screen')) {
    return 'screen_time';
  }
  
  // Triggers (for headache)
  if (text.includes('trigger')) {
    return 'triggers';
  }
  
  // Acidity/burning
  if (text.includes('burning') || text.includes('acidity')) {
    return 'acidity_severity';
  }
  
  // Food timing
  if (text.includes('food') || text.includes('eat')) {
    return 'food_timing';
  }
  
  // Fallback: use generic ID
  return `q${index + 1}`;
}

/**
 * ✅ NORMALIZES CONDITION for criteria matching
 * Standardizes answer formats to match JSON criteria exactly
 */
export function normalizeCondition(condition) {
  const normalized = {};
  
  Object.entries(condition).forEach(([key, value]) => {
    normalized[key] = normalizeAnswer(value, key);
  });
  
  console.log('🔄 NORMALIZED CONDITION:', normalized);
  return normalized;
}

/**
 * ✅ NORMALIZES INDIVIDUAL ANSWERS
 * Handles different answer formats and standardizes them
 */
function normalizeAnswer(answer, questionId) {
  if (!answer) return '';
  
  const normalized = answer.toLowerCase().trim();
  
  // Temperature normalization
  if (questionId === 'temperature') {
    if (normalized.includes('100.4') && normalized.includes('102')) {
      return '100.4-102°F';
    }
    if (normalized.includes('>102') || normalized.includes('above 102')) {
      return '>102°F';
    }
    if (normalized.includes('<100.4') || normalized.includes('below 100')) {
      return '<100.4°F';
    }
    // Return as-is if already formatted
    return answer.trim();
  }
  
  // Duration normalization
  if (questionId.includes('duration')) {
    if (normalized.includes('<2') || normalized.includes('less than 2')) {
      return '<2';
    }
    if (normalized.includes('2-3') || normalized.includes('2 to 3')) {
      return '2-3';
    }
    if (normalized.includes('>3') || normalized.includes('more than 3')) {
      return '>3';
    }
    return answer.trim();
  }
  
  // Vomiting normalization
  if (questionId === 'vomiting') {
    if (normalized.includes('no') || normalized === 'none') {
      return 'no';
    }
    if (normalized.includes('occasional') || normalized.includes('sometimes')) {
      return 'occasional';
    }
    if (normalized.includes('persistent') || normalized.includes('frequent')) {
      return 'persistent';
    }
    return answer.trim();
  }
  
  // Pain level normalization
  if (questionId === 'pain_level') {
    if (normalized.includes('mild') || normalized.includes('1-3')) {
      return 'mild';
    }
    if (normalized.includes('moderate') || normalized.includes('4-7')) {
      return 'moderate';
    }
    if (normalized.includes('severe') || normalized.includes('8-10')) {
      return 'severe';
    }
    return answer.trim();
  }
  
  // Multi-select answers (comma-separated) - keep as-is but lowercase
  if (answer.includes(',')) {
    return answer.split(',').map(s => s.trim().toLowerCase()).join(', ');
  }
  
  // Default: return trimmed, lowercase version
  return normalized;
}

/**
 * ✅ HELPER: Check if answer matches expected value
 * Used for validation and testing
 */
export function answerMatches(userAnswer, expectedValue) {
  if (!userAnswer || !expectedValue) return false;
  
  const userNorm = userAnswer.toLowerCase().trim();
  const expectedNorm = expectedValue.toLowerCase().trim();
  
  // Exact match
  if (userNorm === expectedNorm) return true;
  
  // Contains match
  if (userNorm.includes(expectedNorm)) return true;
  
  // Multi-value match (for comma-separated lists)
  if (expectedNorm.includes(',')) {
    const expectedList = expectedNorm.split(',').map(s => s.trim());
    return expectedList.some(item => userNorm.includes(item));
  }
  
  return false;
}

/**
 * ✅ HELPER: Validate question structure
 * Ensures questions have required fields
 */
export function validateQuestion(question, index) {
  const errors = [];
  
  if (!question.question || question.question.trim() === '') {
    errors.push(`Question ${index + 1}: Missing question text`);
  }
  
  if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
    errors.push(`Question ${index + 1}: Missing or invalid options array`);
  }
  
  if (!question.type) {
    errors.push(`Question ${index + 1}: Missing question type`);
  }
  
  if (!question.id && !question.type) {
    errors.push(`Question ${index + 1}: Missing both id and type fields`);
  }
  
  return errors;
}

/**
 * ✅ HELPER: Validate all questions in a disease file
 */
export function validateAllQuestions(questions) {
  const allErrors = [];
  
  questions.forEach((q, index) => {
    const errors = validateQuestion(q, index);
    allErrors.push(...errors);
  });
  
  if (allErrors.length > 0) {
    console.error('❌ Question validation errors:', allErrors);
    return false;
  }
  
  console.log('✅ All questions valid');
  return true;
}