// scripts/lint-pure.js — pure modules must be deterministic.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const PURE = ['src/calc.js', 'src/format.js']; // extend as pure modules are added
const BANNED = [/new\s+Date\s*\(/, /Date\.now\s*\(/, /Math\.random\s*\(/];

let violations = 0;
for (const rel of PURE) {
  const lines = fs.readFileSync(path.join(ROOT, rel), 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.includes('@impure-ok')) return;
    for (const re of BANNED) {
      if (re.test(line)) {
        console.error(`IMPURE ${rel}:${i + 1}  ${line.trim()}`);
        violations++;
      }
    }
  });
}
if (violations) { console.error(`\n${violations} purity violation(s).`); process.exit(1); }
console.log('OK pure modules are deterministic');
