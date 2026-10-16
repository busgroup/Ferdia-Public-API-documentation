'use strict';

const fs = require('fs');
const path = require('path');

const CHANGELOG_PATH = path.join(__dirname, '..', '..', 'components', 'changelog.yaml');
const DESCRIPTION_HEADER = 'description: |';
const BODY_INDENT = '  ';

/**
 * Extracts the content of the "## Changelog" section from a PR body.
 *
 * Returns:
 *   - { bullets: [], isNone: true }   when the section is explicitly "None" (no user-facing change)
 *   - { bullets: [...], isNone: false } when the section has one or more lines of content
 *   - { bullets: [], isNone: false }  when the section is missing or empty (invalid state)
 */
function extractChangelogSection(prBody) {
  const body = prBody || '';
  const lines = body.split(/\r?\n/);

  const headingIdx = lines.findIndex((line) => /^#{2,}\s*changelog\s*$/i.test(line.trim()));
  if (headingIdx === -1) {
    return { bullets: [], isNone: false };
  }

  const sectionLines = [];
  for (let i = headingIdx + 1; i < lines.length; i++) {
    if (/^#{2,}\s/.test(lines[i].trim())) {
      break;
    }
    sectionLines.push(lines[i]);
  }

  const sectionRaw = sectionLines
    .join('\n')
    // strip HTML comments, e.g. the instructional comment left in the PR template
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  if (!sectionRaw) {
    return { bullets: [], isNone: false };
  }

  if (/^none$/i.test(sectionRaw)) {
    return { bullets: [], isNone: true };
  }

  const bullets = sectionRaw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith('-') ? line : `- ${line}`));

  return { bullets, isNone: false };
}

/**
 * Inserts the given bullet lines into components/changelog.yaml under today's
 * "## YYYY-MM-DD" heading, reusing the heading if it's already the newest entry.
 */
function appendChangelogEntry(bullets, date = new Date()) {
  if (!bullets.length) {
    return false;
  }

  const todayHeading = `## ${date.toISOString().slice(0, 10)}`;
  const content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  const lines = content.split('\n');

  const headerIdx = lines.findIndex((line) => line.trim() === DESCRIPTION_HEADER.trim());
  if (headerIdx === -1) {
    throw new Error(`Could not find "${DESCRIPTION_HEADER}" in ${CHANGELOG_PATH}`);
  }

  const bulletLines = bullets.map((bullet) => BODY_INDENT + bullet);

  if (lines[headerIdx + 1] && lines[headerIdx + 1].trim() === todayHeading) {
    // Today's heading is already the newest entry — append bullets under it.
    lines.splice(headerIdx + 2, 0, ...bulletLines);
  } else {
    // Insert a new heading + bullets as the newest entry, followed by a blank separator line.
    const newBlock = [BODY_INDENT + todayHeading, ...bulletLines, ''];
    lines.splice(headerIdx + 1, 0, ...newBlock);
  }

  fs.writeFileSync(CHANGELOG_PATH, lines.join('\n'));
  return true;
}

module.exports = { extractChangelogSection, appendChangelogEntry, CHANGELOG_PATH };
