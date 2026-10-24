// 브라우저 테스트 묶음(실제 Chromium). 실행: node seal/tests/browser.test.js
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'browser'); let pass = 0, fail = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) {
  let out = ''; try { out = execFileSync('node', [path.join(dir, f)], { encoding: 'utf8', timeout: 120000 }); } catch (e) { out = (e.stdout || '') + '\nFAIL crashed: ' + (e.message || '').split('\n')[0]; }
  const lines = out.split('\n').filter(l => /^(PASS|FAIL)/.test(l)); pass += lines.filter(l => l.startsWith('PASS')).length; fail += lines.filter(l => l.startsWith('FAIL')).length;
  console.log(`\n# ${f}\n` + lines.join('\n'));
}
console.log(`\n${pass} pass, ${fail} fail`); process.exitCode = fail ? 1 : 0;
