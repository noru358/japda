// 브라우저 테스트 공용: Claude 앱처럼 iframe(샌드박스) 안에 게임을 띄우고, 캔버스 UI를 id로 누른다.
const { chromium } = require(process.env.PW_PATH || '/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const D = path.join(__dirname, '..', '.tmp') + '/'; fs.mkdirSync(D, { recursive: true });
fs.writeFileSync(D + 'host.html', '<!doctype html><body style="margin:0"><iframe id=f src="frame.html" style="position:absolute;top:30px;left:0;width:1280px;height:720px;border:0" sandbox="allow-scripts allow-same-origin"></iframe></body>');
fs.writeFileSync(D + 'frame.html', '<!doctype html><html><head><meta charset=utf-8></head><body style="margin:0">' + fs.readFileSync(path.join(__dirname, '..', '..', 'index.html'), 'utf8') + '</body></html>');
const OY = 30; // iframe이 호스트 페이지에서 내려온 만큼
async function setup() {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const pg = await b.newPage({ viewport: { width: 1280, height: 760 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + D + 'host.html'); await pg.waitForTimeout(900);
  const T = { b, pg, errs, D, fr: pg.frames()[1] };
  T.ev = (f, a) => T.fr.evaluate(f, a);
  T.ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
  T.ui = () => T.ev(() => __seal.ui());
  T.st = () => T.ev(() => __seal.uiState());
  T.find = async id => { await pg.waitForTimeout(60); return (await T.ui()).find(r => r.id === id) || null; };
  T.click = async (id, button = 'left') => { const r = await T.find(id); if (!r) { console.log('FAIL no ui element ' + id); return false; } await pg.mouse.click(r.x, r.y + OY, { button }); await pg.waitForTimeout(150); return true; };
  T.hover = async id => { const r = await T.find(id); if (!r) return false; await pg.mouse.move(r.x, r.y + OY); await pg.waitForTimeout(300); return true; };
  T.key = async (k, wait = 180) => { await pg.keyboard.press(k); await pg.waitForTimeout(wait); };
  T.focus = () => T.ev(() => document.activeElement && document.activeElement.tagName);
  T.done = async () => { T.ok(errs.length === 0, 'no page errors ' + errs.join('|')); await b.close(); };
  await T.ev(() => __seal.closeSlots && __seal.closeSlots()); // v36 시작 화면(월드 선택)을 닫고 시험
  await pg.mouse.click(640, 330);
  return T;
}
module.exports = { setup, OY };
