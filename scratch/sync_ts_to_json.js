import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const part1Path = path.join(__dirname, '..', 'src', 'stories_part1.ts');
const part2Path = path.join(__dirname, '..', 'src', 'stories_part2.ts');

const jsonFiles = [
  'expanded_stories_data.json',
  'horror_stories_data.json',
  'classics_stories_data.json',
  'new_30_stories_data.json',
  'daily_stories_data.json',
  'new_20_stories.json'
].map(f => path.join(__dirname, '..', f));

function loadStoriesFromFile(filePath, varName) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return [];
  }
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

function run() {
  console.log("Loading stories from TS files...");
  const stories1 = loadStoriesFromFile(part1Path, 'STORIES_PART1');
  const stories2 = loadStoriesFromFile(part2Path, 'STORIES_PART2');
  
  const allTsStories = [...stories1, ...stories2];
  console.log(`Loaded ${allTsStories.length} stories from TS files.`);
  
  const tsStoriesMap = new Map();
  for (const s of allTsStories) {
    tsStoriesMap.set(s.id, s);
  }
  
  let totalUpdated = 0;
  
  for (const jsonPath of jsonFiles) {
    if (!fs.existsSync(jsonPath)) {
      console.log(`JSON file not found: ${jsonPath}`);
      continue;
    }
    
    console.log(`Processing ${path.basename(jsonPath)}...`);
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let updatedFile = false;
    
    for (const sId of Object.keys(data)) {
      if (tsStoriesMap.has(sId)) {
        const tsStory = tsStoriesMap.get(sId);
        const jsonStory = data[sId];
        
        // Compare and update if different
        let isDifferent = false;
        
        // Deep compare paragraphs
        if (JSON.stringify(jsonStory.en) !== JSON.stringify(tsStory.en) ||
            JSON.stringify(jsonStory.tr) !== JSON.stringify(tsStory.tr) ||
            JSON.stringify(jsonStory.words) !== JSON.stringify(tsStory.words)) {
          isDifferent = true;
        }
        
        if (isDifferent) {
          jsonStory.en = tsStory.en;
          jsonStory.tr = tsStory.tr;
          jsonStory.words = tsStory.words;
          
          // Also sync level, title, author if they differ
          if (jsonStory.level !== tsStory.level) jsonStory.level = tsStory.level;
          if (jsonStory.title !== tsStory.title) jsonStory.title = tsStory.title;
          if (jsonStory.author !== tsStory.author) jsonStory.author = tsStory.author;
          
          updatedFile = true;
          totalUpdated++;
          console.log(`  Updated story: ${sId}`);
        }
      }
    }
    
    if (updatedFile) {
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`  Saved changes to ${path.basename(jsonPath)}`);
    } else {
      console.log(`  No changes for ${path.basename(jsonPath)}`);
    }
  }
  
  console.log(`Sync completed. Total stories updated in JSON databases: ${totalUpdated}`);
}

run();
