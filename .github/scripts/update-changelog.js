'use strict';

// Appends the merged PR's "## Changelog" section to components/changelog.yaml under
// today's date heading. Expects the PR body in the PR_BODY environment variable
// (never interpolate it directly into a shell command).
//
// Exits with code 0 and makes no changes if the section is missing/empty/"None" —
// the caller (update-changelog.yml) should skip committing in that case.

const { extractChangelogSection, appendChangelogEntry } = require('./changelog-lib');

const { bullets, isNone } = extractChangelogSection(process.env.PR_BODY);

if (isNone || !bullets.length) {
  console.log('No public changelog entry for this PR — skipping components/changelog.yaml update.');
  process.exit(0);
}

const updated = appendChangelogEntry(bullets);
if (updated) {
  console.log(`Appended ${bullets.length} line(s) to components/changelog.yaml:\n${bullets.join('\n')}`);
}
