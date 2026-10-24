// 공용 하네스: index.html에서 게임 스크립트를 꺼내, 가짜 DOM·캔버스·저장소 위에서 돌린다.
// Math.random을 시드 고정 난수로 바꿔서 매번 같은 맵·같은 결과가 나온다(TEST_SEED로 바꿀 수 있음).
const fs = require('fs'), path = require('path');
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function boot(seed = +(process.env.TEST_SEED || 12345)) {
  Math.random = mulberry(seed);
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8'), code = html.split('<script>')[1].split('</script>')[0];
  const mkctx = () => new Proxy({}, { get: (t, k) => { if (k in t) return t[k]; if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => ({ addColorStop() {} }); if (k === 'createImageData') return (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }); if (k === 'measureText') return () => ({ width: 50 }); return () => {}; }, set: (t, k, v) => { t[k] = v; return true; } });
  const el = () => ({ style: {}, hidden: true, innerHTML: '', textContent: '', appendChild() {}, addEventListener() {}, querySelector: () => el(), getContext: () => mkctx(), getBoundingClientRect: () => ({ width: 1200, height: 700, left: 0, top: 0 }), focus() {}, clientWidth: 1200, clientHeight: 700, width: 0, height: 0 });
  const store = new Map();
  Object.assign(global, { document: { getElementById: () => el(), createElement: () => el(), addEventListener() {}, hasFocus: () => true, hidden: false }, matchMedia: () => ({ matches: false }), addEventListener: () => {}, devicePixelRatio: 1, ResizeObserver: class { observe() {} }, requestAnimationFrame: () => {}, window: global, setTimeout: () => {}, localStorage: { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) } });
  (0, eval)(code); if (window.__seal.closeSlots) window.__seal.closeSlots();
  return { t: window.__seal, store };
}
let fails = 0, passes = 0;
function ok(c, m) { if (c) passes++; else fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); }
function summary() { console.log(`\n${passes} pass, ${fails} fail`); process.exitCode = fails ? 1 : 0; }
module.exports = { boot, ok, summary };
