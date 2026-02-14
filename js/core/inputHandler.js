let keywordsData = null;

export async function loadKeywords() {
  try {
    const response = await fetch('/data/metadata/keywords.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    keywordsData = await response.json();
    console.log(`✅ LOADED ${Object.keys(keywordsData).length} DISEASES`);
  } catch (error) {
    console.error('Keywords failed:', error);
    keywordsData = {};
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
    console.log('⚠️ Keywords not loaded');
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
