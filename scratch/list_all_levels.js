import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const part1Path = path.join(__dirname, '..', 'src', 'stories_part1.ts');
const part2Path = path.join(__dirname, '..', 'src', 'stories_part2.ts');

function loadStoriesFromFile(filePath, varName) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/import\s+[\s\S]*?;/g, '');
  content = content.replace(/export\s+interface\s+RawStory[\s\S]*?(?=export\s+const)/g, '');
  content = content.replace(/:\s*RawStory\s*\[\s*\]/g, '');
  content = content.replace(/export\s+const\s+(\w+)/g, 'globalThis.$1');
  
  const context = { globalThis: {} };
  vm.createContext(context);
  vm.runInContext(content, context);
  
  return context.globalThis[varName] || [];
}

const stories1 = loadStoriesFromFile(part1Path, 'STORIES_PART1');
const stories2 = loadStoriesFromFile(part2Path, 'STORIES_PART2');
const allStories = [...stories1, ...stories2];

const levelCounts = {};
allStories.forEach(s => {
  levelCounts[s.level] = (levelCounts[s.level] || 0) + 1;
});
console.log('Level counts:', levelCounts);
console.log('Total stories:', allStories.length);

// Print A1 and A2 story IDs
const a1Stories = allStories.filter(s => s.level === 'A1').map(s => s.id);
const a2Stories = allStories.filter(s => s.level === 'A2').map(s => s.id);
console.log('A1 story IDs:', a1Stories);
console.log('A2 story IDs:', a2Stories);
