import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load word_cefr_levels.json
const cefrDbFile = path.join(__dirname, '..', 'src', 'word_cefr_levels.json');
const cefrDb = JSON.parse(fs.readFileSync(cefrDbFile, 'utf8'));

// Helper to get CEFR level of a word
function getWordLevel(word) {
  const cleanWord = word.toLowerCase().replace(/[^a-z']/g, '').trim();
  if (!cleanWord) return null;
  
  // Direct check
  if (cefrDb[cleanWord]) {
    return cefrDb[cleanWord].level;
  }
  
  // Plurals, past tense, etc. simple lemmatization
  if (cleanWord.endsWith('s') && cefrDb[cleanWord.slice(0, -1)]) {
    return cefrDb[cleanWord.slice(0, -1)].level;
  }
  if (cleanWord.endsWith('es') && cefrDb[cleanWord.slice(0, -2)]) {
    return cefrDb[cleanWord.slice(0, -2)].level;
  }
  if (cleanWord.endsWith('ed') && cefrDb[cleanWord.slice(0, -2)]) {
    return cefrDb[cleanWord.slice(0, -2)].level;
  }
  if (cleanWord.endsWith('ed') && cefrDb[cleanWord.slice(0, -1)]) {
    return cefrDb[cleanWord.slice(0, -1)].level;
  }
  if (cleanWord.endsWith('ing') && cefrDb[cleanWord.slice(0, -3)]) {
    return cefrDb[cleanWord.slice(0, -3)].level;
  }
  if (cleanWord.endsWith('ing') && cefrDb[cleanWord.slice(0, -3) + 'e']) {
    return cefrDb[cleanWord.slice(0, -3) + 'e'].level;
  }
  if (cleanWord.endsWith('ly') && cefrDb[cleanWord.slice(0, -2)]) {
    return cefrDb[cleanWord.slice(0, -2)].level; // adverbs
  }
  
  return null;
}

// We will read stories_part1.ts and stories_part2.ts
// To load them, we'll write a simple regex parser or we can just import them since this is node.
// But importing them directly might be tricky because of TypeScript types.
// A regex parser is extremely reliable since the format is very structured:
// id: '...', title: '...', level: '...', en: [...]

function extractStories(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match stories
  const regex = /\{\s*id:\s*'([^']+)'[\s\S]*?title:\s*"([^"]+)"[\s\S]*?level:\s*'([^']+)'[\s\S]*?en:\s*\[([\s\S]*?)\]/g;
  let match;
  const stories = [];
  while ((match = regex.exec(content)) !== null) {
    const id = match[1];
    const title = match[2];
    const level = match[3];
    const enContent = match[4];
    
    // Parse en paragraphs
    // The en content is a list of strings like: "...", or `...`
    // Let's extract the strings inside the array
    const paragraphRegex = /(?:"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|`([^`\\]*(?:\\.[^`\\]*)*)`)/g;
    let pMatch;
    const paragraphs = [];
    while ((pMatch = paragraphRegex.exec(enContent)) !== null) {
      paragraphs.push(pMatch[1] || pMatch[2] || pMatch[3] || '');
    }
    
    stories.push({ id, title, level, paragraphs });
  }
  return stories;
}

const stories1 = extractStories(path.join(__dirname, '..', 'src', 'stories_part1.ts'));
const stories2 = extractStories(path.join(__dirname, '..', 'src', 'stories_part2.ts'));
const allStories = [...stories1, ...stories2];

console.log(`Loaded ${allStories.length} total stories for analysis.`);

const levelHierarchy = {
  'A1': 1,
  'A2': 2,
  'B1': 3,
  'B2': 4,
  'C1': 5,
  'C2': 6,
  'Özel İsim': 0
};

allStories.forEach(story => {
  if (story.level !== 'A1' && story.level !== 'A2') return;
  
  const targetLevelVal = levelHierarchy[story.level];
  const outOfLevelWords = {};
  let totalWords = 0;
  
  story.paragraphs.forEach(p => {
    // Split into words
    const words = p.split(/\s+/);
    words.forEach(w => {
      const clean = w.toLowerCase().replace(/[^a-z']/g, '').trim();
      if (!clean) return;
      totalWords++;
      
      const wordLevel = getWordLevel(clean);
      if (wordLevel && wordLevel !== 'Özel İsim') {
        const wordLevelVal = levelHierarchy[wordLevel];
        if (wordLevelVal > targetLevelVal) {
          // It's out of level!
          outOfLevelWords[clean] = (outOfLevelWords[clean] || 0) + 1;
        }
      }
    });
  });
  
  const count = Object.keys(outOfLevelWords).length;
  if (count > 0) {
    console.log(`\n[Story ID: ${story.id}] Level: ${story.level} - Total Words: ${totalWords}`);
    console.log(`Found ${count} unique out-of-level words. Top 15 examples:`);
    const sorted = Object.entries(outOfLevelWords)
      .map(([word, freq]) => {
        return { word, freq, level: getWordLevel(word) };
      })
      .sort((a, b) => b.freq - a.freq)
      .slice(0, 15);
    
    sorted.forEach(item => {
      console.log(`  - "${item.word}" (${item.level}): used ${item.freq} times`);
    });
  }
});
