/**
 * Prints the body under `## [version]` in CHANGELOG.md (Keep a Changelog).
 * Usage: node scripts/changelog-body-for-version.mjs [version]
 * Default version: package.json "version". Empty if section missing.
 */
import { readFileSync } from 'node:fs';

const ver =
  process.argv[2] ?? JSON.parse(readFileSync('package.json', 'utf8')).version;
const text = readFileSync('CHANGELOG.md', 'utf8');
const escaped = ver.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// With `m`, `$` matches end of every line (including blank lines after the header), so use
// `(?![\s\S])` for end-of-string only.
const re = new RegExp(
  `^## \\[${escaped}\\][^\\n]*\\n([\\s\\S]*?)(?=\\n## \\[|(?![\\s\\S]))`,
  'm',
);
const m = text.match(re);
process.stdout.write(m ? m[1].trim() : '');
