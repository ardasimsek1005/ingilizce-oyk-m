import { STORIES_PART1 } from './src/stories_part1.js';
import { STORIES_PART2 } from './src/stories_part2.js';

console.log('--- PART 1 STORIES ---');
STORIES_PART1.forEach(s => {
  console.log(`${s.id}: ${s.en.length} paragraphs. Level: ${s.level}`);
});

console.log('--- PART 2 STORIES ---');
STORIES_PART2.forEach(s => {
  console.log(`${s.id}: ${s.en.length} paragraphs. Level: ${s.level}`);
});
