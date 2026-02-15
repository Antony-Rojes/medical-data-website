/**
 * js/core/inputHandler.js - FIXED VERSION
 * Corrected path issues and improved error handling
 */

let keywordsData = null;

export async function loadKeywords() {
  try {
    // ✅ FIXED: Dynamic path resolution
    const basePath = window.location.pathname.includes('/public/') 
      ? '../data/metadata/keywords.json' 
      : 'data/metadata/keywords.json';
    
    console.log('🔍 Loading keywords from:', basePath);
    
    const response = await fetch(basePath);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    keywordsData = await response.json();
    console.log(`✅ LOADED ${Object.keys(keywordsData).length} DISEASE KEYWORDS`);
    return true;
  } catch (error) {
    console.error('❌ Keywords load failed:', error);
    console.error('Current URL:', window.location.pathname);
    console.error('Please check file location and path');
    keywordsData = {};
    return false;
  }
}

function normalizeInput(input) {
  return input
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function detectDisease(userInput) {
  if (!keywordsData || Object.keys(keywordsData).length === 0) {
    console.warn('⚠️ Keywords not loaded - cannot detect disease');
    return null;
  }

  const normalizedInput = normalizeInput(userInput);
  console.log('🔍 Analyzing input:', normalizedInput);

  let bestMatch = null;
  let highestScore = 0;

  for (const key in keywordsData) {
    const { disease_id, keywords } = keywordsData[key];
    let score = 0;

    for (const keyword of keywords) {
      const escaped = escapeRegex(keyword.toLowerCase());
      const pattern = escaped.replace(/\s+/g, '\\s+');
      const regex = new RegExp(`\\b${pattern}\\b`, 'i');

      if (regex.test(normalizedInput)) {
        score++;
        console.log(`✅ Matched "${keyword}" in "${disease_id}"`);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = disease_id;
    }
  }

  console.log(`🎯 Best match: ${bestMatch || 'none'} (score: ${highestScore})`);
  return highestScore > 0 ? bestMatch : null;
}