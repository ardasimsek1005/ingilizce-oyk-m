import { STORIES_PART1 } from '../src/stories_part1';
import { STORIES_PART2 } from '../src/stories_part2';

const stories = [...STORIES_PART1, ...STORIES_PART2];

console.log(`Total stories found: ${stories.length}`);

let issuesCount = 0;

stories.forEach((story, idx) => {
  if (!story) {
    console.error(`Error: Story at index ${idx} is undefined or null!`);
    issuesCount++;
    return;
  }
  
  if (!story.id) {
    console.error(`Error: Story at index ${idx} has no id!`);
    issuesCount++;
  }
  
  if (!story.title) {
    console.error(`Error: Story [${story.id || idx}] has no title!`);
    issuesCount++;
  }
  
  if (!story.en || !Array.isArray(story.en)) {
    console.error(`Error: Story [${story.title || story.id}] has no 'en' array!`);
    issuesCount++;
  } else if (story.en.length === 0) {
    console.error(`Error: Story [${story.title || story.id}] has empty 'en' array!`);
    issuesCount++;
  } else {
    story.en.forEach((para, pIdx) => {
      if (typeof para !== 'string') {
        console.error(`Error: Story [${story.title || story.id}] 'en' paragraph ${pIdx} is not a string:`, para);
        issuesCount++;
      } else if (!para.trim()) {
        console.error(`Error: Story [${story.title || story.id}] 'en' paragraph ${pIdx} is empty string!`);
        issuesCount++;
      }
    });
  }

  if (!story.tr || !Array.isArray(story.tr)) {
    console.error(`Error: Story [${story.title || story.id}] has no 'tr' array!`);
    issuesCount++;
  } else if (story.en && story.tr.length !== story.en.length) {
    console.warn(`Warning: Story [${story.title || story.id}] has paragraph count mismatch! 'en'=${story.en.length}, 'tr'=${story.tr.length}`);
  }
});

console.log(`Diagnostic completed. Total issues/warnings found: ${issuesCount}`);
