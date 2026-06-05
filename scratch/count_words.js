import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storiesFile = path.join(__dirname, '..', 'src', 'stories_part2.ts');
console.log('Loading stories from:', storiesFile);

const content = fs.readFileSync(storiesFile, 'utf8');

const regex = /\{\s*id:\s*'([^']+)'[\s\S]*?level:\s*'([^']+)'[\s\S]*?en:\s*\[([\s\S]*?)\]/g;
let match;
const results = [];

while ((match = regex.exec(content)) !== null) {
  const id = match[1];
  const level = match[2];
  const enArrayStr = match[3];
  
  // Count words inside the en array strings
  const wordsText = enArrayStr.replace(/["'`]/g, '');
  const wordCount = wordsText.split(/\s+/).filter(w => w.length > 0).length;
  
  results.push({ id, level, wordCount });
}

console.log('| Story ID | Level | Word Count |');
console.log('| :--- | :--- | :--- |');
results.forEach(r => {
  console.log(`| ${r.id} | ${r.level} | ${r.wordCount} |`);
});
