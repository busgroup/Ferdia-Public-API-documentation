'use strict';

// Fails the check if the PR description's "## Changelog" section is missing or empty.
// Expects the PR body in the PR_BODY environment variable (never interpolate it
// directly into a shell command — pass it as env to avoid script injection).

const { extractChangelogSection } = require('./changelog-lib');

const { bullets, isNone } = extractChangelogSection(process.env.PR_BODY);

if (isNone) {
  console.log('Changelog section is explicitly "None" — no public changelog entry will be added.');
  process.exit(0);
}

if (!bullets.length) {
  console.error(
    'Missing or empty "## Changelog" section in the PR description.\n' +
      'Add one or two user-facing lines describing this change under a "## Changelog" heading,\n' +
      'or write "None" if the change has no public-facing impact. See .github/PULL_REQUEST_TEMPLATE.md.'
  );
  process.exit(1);
}

console.log(`Changelog section OK (${bullets.length} line(s)).`);
