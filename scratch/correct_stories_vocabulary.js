import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const part1Path = path.join(__dirname, '..', 'src', 'stories_part1.ts');
const part2Path = path.join(__dirname, '..', 'src', 'stories_part2.ts');
const progressPath = path.join(__dirname, 'vocabulary_correction_progress.json');

const apiKey = process.env.GEMINI_API_KEY || "";
const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

async function callGemini(prompt) {
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };
  
  let attempts = 5;
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errText}`);
      }
      const resJson = await response.json();
      const text = resJson.candidates[0].content.parts[0].text;
      return JSON.parse(text);
    } catch (e) {
      console.log(`  [Gemini API Warning] (attempt ${i+1}/${attempts}): ${e.message}. Retrying in 15s...`);
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }
  throw new Error("Failed to call Gemini API after multiple retries");
}

function loadStoriesFromFile(filePath, varName) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Clean up TS elements so it is valid JS
  content = content.replace(/import\s+[\s\S]*?;/g, '');
  content = content.replace(/export\s+interface\s+RawStory[\s\S]*?(?=export\s+const)/g, '');
  content = content.replace(/:\s*RawStory\s*\[\s*\]/g, '');
  content = content.replace(/export\s+const\s+(\w+)/g, 'globalThis.$1');
  
  const context = { globalThis: {} };
  vm.createContext(context);
  vm.runInContext(content, context);
  
  return context.globalThis[varName] || [];
}

function findStoryBlock(fileContent, storyId) {
  const regex = new RegExp(`id:\\s*['"]${storyId}['"]`);
  const match = fileContent.match(regex);
  if (!match) return null;
  
  const idIndex = match.index;
  let openBraceIndex = -1;
  for (let i = idIndex; i >= 0; i--) {
    if (fileContent[i] === '{') {
      openBraceIndex = i;
      break;
    }
  }
  
  if (openBraceIndex === -1) return null;
  
  let braceCount = 1;
  let closeBraceIndex = -1;
  for (let i = openBraceIndex + 1; i < fileContent.length; i++) {
    if (fileContent[i] === '{') {
      braceCount++;
    } else if (fileContent[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        closeBraceIndex = i;
        break;
      }
    }
  }
  
  if (closeBraceIndex === -1) return null;
  
  return {
    start: openBraceIndex,
    end: closeBraceIndex + 1,
    content: fileContent.substring(openBraceIndex, closeBraceIndex + 1)
  };
}

async function run() {
  console.log("Starting CEFR Vocabulary Level Alignment with VM Parser in Sequential Mode...");
  
  // Load progress
  let progress = { processed: [], total_changed_words: 0 };
  if (fs.existsSync(progressPath)) {
    progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
    console.log(`Loaded progress: ${progress.processed.length} stories processed, ${progress.total_changed_words} words changed so far.`);
  }
  
  // Load stories accurately via VM execution
  const stories1 = loadStoriesFromFile(part1Path, 'STORIES_PART1').map(s => ({ ...s, filePath: part1Path }));
  const stories2 = loadStoriesFromFile(part2Path, 'STORIES_PART2').map(s => ({ ...s, filePath: part2Path }));
  
  const allStories = [...stories1, ...stories2];
  console.log(`Successfully loaded ${allStories.length} total stories.`);
  
  const targetStories = allStories.filter(s => (s.level === 'A1' || s.level === 'A2') && !progress.processed.includes(s.id));
  console.log(`Total A1/A2 stories: ${allStories.filter(s => s.level === 'A1' || s.level === 'A2').length}. Remaining to process: ${targetStories.length}`);
  
  for (let sIndex = 0; sIndex < targetStories.length; sIndex++) {
    const target = targetStories[sIndex];
    console.log(`\n[${sIndex + 1}/${targetStories.length}] Processing story "${target.id}" (Level: ${target.level}) in ${path.basename(target.filePath)}...`);
    
    // Read the current file content
    let fileContent = fs.readFileSync(target.filePath, 'utf8');
    const block = findStoryBlock(fileContent, target.id);
    if (!block) {
      console.log(`  Error: Could not find block for story "${target.id}" in file. Skipping.`);
      continue;
    }
    
    const prompt = `
You are a CEFR English language curriculum specialist and professional translator.
Analyze the following English paragraphs for a story of level ${target.level}.

Target Level constraints:
- For "A1": Replace any B1, B2, C1, or C2 words with A1/A2 equivalents (or basic sentence structures). Common words like "courage" (B1), "suddenly" (B1), "immediately" (B2), "wolf" (B2), "tin" (B1), "porridge" (C2), "forest" (A2) must be replaced with simpler words (e.g., "heart/bravery", "quickly/soon", "now", "wild dog", "metal", "warm food", "woods/trees") or restructured.
- For "A2": Replace any C1 or C2 words, and keep B1/B2 words to a bare minimum. Simplify words like "cottage" (B2) to "cabin/small house", "wealthy" (B2) to "rich", "status" (B1) to "position", etc.
- In both levels: Do NOT classify basic words like "mother", "father", "friend", "home" as out-of-level. They are fully A1/A2.
- Make sure that when you modify the English paragraph, you modify the corresponding Turkish paragraph at the same index so that translations remain perfectly aligned.
- Review the provided "words" list. If a word listed there was replaced, update the key/value pair in the returned "words" object.

Input English Paragraphs:
${JSON.stringify(target.en, null, 2)}

Input Turkish Paragraphs:
${JSON.stringify(target.tr, null, 2)}

Input Interactive Vocabulary (words):
${JSON.stringify(target.words, null, 2)}

Return a JSON object in this exact schema:
{
  "en": [ ...updated english paragraphs, same count as input... ],
  "tr": [ ...updated turkish paragraphs, same count as input... ],
  "words": { ...updated interactive vocabulary mapping... },
  "changes": [
    { "original": "courage", "replaced_with": "bravery", "reason": "B1 to A2 conversion" }
  ],
  "change_count": <integer count of unique word replacements made>
}
`;
    
    try {
      const response = await callGemini(prompt);
      
      if (!response.en || !response.tr || !response.words || response.en.length !== target.en.length || response.tr.length !== target.tr.length) {
        console.log(`  Error: Invalid Gemini response format or paragraph count mismatch. Retrying...`);
        sIndex--; // Retry
        await new Promise(resolve => setTimeout(resolve, 10000));
        continue;
      }
      
      const changeCount = response.change_count || response.changes.length || 0;
      console.log(`  Completed. Replaced ${changeCount} words:`, response.changes.map(c => `"${c.original}"->"${c.replaced_with}"`).join(', '));
      
      const newBlockContent = `{
    id: '${target.id}',
    title: "${target.title.replace(/"/g, '\\"')}",
    author: "${target.author.replace(/"/g, '\\"')}",
    level: '${target.level}',
    coverUrl: '${target.coverUrl}',
    en: ${JSON.stringify(response.en, null, 6)},
    tr: ${JSON.stringify(response.tr, null, 6)},
    words: ${JSON.stringify(response.words, null, 6)}
  }`;
      
      // Read file fresh to make sure we don't overwrite concurrent changes
      fileContent = fs.readFileSync(target.filePath, 'utf8');
      const freshBlock = findStoryBlock(fileContent, target.id);
      if (!freshBlock) {
        console.log(`  Error: Could not find block for "${target.id}" in file. Skipping.`);
        continue;
      }
      
      fileContent = fileContent.substring(0, freshBlock.start) + newBlockContent + fileContent.substring(freshBlock.end);
      fs.writeFileSync(target.filePath, fileContent, 'utf8');
      
      // Update progress
      progress.processed.push(target.id);
      progress.total_changed_words += changeCount;
      fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2), 'utf8');
      
      console.log(`  Saved progress. Total changed words: ${progress.total_changed_words}`);
      
      // Cooldown delay of 12 seconds between sequential requests to prevent 15 RPM rate limits
      await new Promise(resolve => setTimeout(resolve, 12000));
      
    } catch (e) {
      console.log(`  Error processing story: ${e.message}. Retrying in 10s...`);
      sIndex--; // Retry
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  console.log(`\nAll target stories aligned successfully!`);
  console.log(`Total unique words changed across all A1/A2 stories: ${progress.total_changed_words}`);
}

run().catch(console.error);
