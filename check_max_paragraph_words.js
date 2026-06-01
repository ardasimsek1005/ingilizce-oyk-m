import { STORIES_PART1 } from './src/stories_part1.js';
import { STORIES_PART2 } from './src/stories_part2.js';

console.log('--- PART 1 STORIES MAX PARAGRAPH WORDS ---');
STORIES_PART1.forEach(s => {
  let maxW = 0;
  s.en.forEach(p => {
    const words = p.split(/\s+/).filter(Boolean).length;
    if (words > maxW) maxW = words;
  });
  console.log(`${s.id}: max paragraph length = ${maxW} words. Total paragraphs = ${s.en.length}`);
});

console.log('--- PART 2 STORIES MAX PARAGRAPH WORDS ---');
STORIES_PART2.forEach(s => {
  let maxW = 0;
  s.en.forEach(p => {
    const words = p.split(/\s+/).filter(Boolean).length;
    if (words > maxW) maxW = words;
  });
  console.log(`${s.id}: max paragraph length = ${maxW} words. Total paragraphs = ${s.en.length}`);
});
