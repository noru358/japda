const { setup, OY } = require('./_lib.cjs');
(async () => {
  const T = await setup(), { pg, ev, ok } = T;
  const home = () => ev(() => { const s = __seal.get(); s.P.x = 42.5 * 16; s.P.y = 53.5 * 16; for (const k in s.res) s.res[k] = 99; __seal.calm(); });
  await home();
  // E: 맥락 패널 열고 닫기
  await pg.mouse.move(1200, 600); await T.key('KeyE'); const e1 = await ev(() => !!__seal.get().sel); const up = await T.find('sel-up');
  await T.key('KeyE'); const e2 = await ev(() => !!__seal.get().sel);
  ok(e1 && !e2 && !!up, 'E opens/closes core context panel (canvas)');
  // T: 연구 탭 → 클릭으로 연구 → T 닫기
  await T.key('KeyT'); const s1 = await T.st(); await T.click('res-def1'); const got = await ev(() => !!__seal.get().tech.def1);
  await T.key('KeyT'); const s2 = await T.st();
  ok(s1.menu && s1.tab === 'research' && got && !s2.menu, `T opens research tab, click researches (${got}), T closes`);
  // 창을 클릭으로 닫은 뒤에도 키보드가 바로 먹는다 (v17까지의 버그)
  await T.key('KeyC'); await T.click('menu-close'); const fc = await T.focus();
  const x0 = await ev(() => __seal.get().P.x); await pg.keyboard.down('KeyD'); await pg.waitForTimeout(300); await pg.keyboard.up('KeyD'); const x1 = await ev(() => __seal.get().P.x);
  ok(x1 - x0 > 10 && fc === 'CANVAS', `move right right after closing menu with mouse (moved ${(x1 - x0).toFixed(1)}, focus ${fc})`);
  await home();
  // 제작: 클릭 한 번 → 초점은 캔버스
  await T.key('KeyC'); await T.click('cat-0'); await T.click('craft-xbow'); const hasX = await ev(() => __seal.get().P.weapons.xbow); const fc2 = await T.focus();
  await T.key('KeyC'); ok(hasX && fc2 === 'CANVAS' && !(await T.st()).menu, `craft by click (${hasX}), focus ${fc2}, C closes`);
  // 메뉴가 열려 있는 동안 혼자면 시간이 멈춘다
  await T.key('Tab'); const c0 = await ev(() => __seal.get().G.clock); await pg.waitForTimeout(500); const c1 = await ev(() => __seal.get().G.clock);
  await T.click('tab-craft'); const tabNow = (await T.st()).tab;
  await pg.mouse.click(640, 400, { button: 'right' }); await pg.waitForTimeout(150); const closedR = !(await T.st()).menu;
  ok(c1 === c0 && tabNow === 'craft' && closedR, `menu pauses solo (clock ${c0.toFixed(2)}→${c1.toFixed(2)}), tab click, right-click closes`);
  // 툴팁: 하단 바 칸에 올리면 뜬다
  await T.hover('hb-build'); const hv = (await T.st()).hover; ok(hv === 'hb-build', 'hover registers on hotbar slot: ' + hv);
  // 휠 · Q
  const w0 = await ev(() => __seal.get().P.cur); await pg.mouse.move(640, 400); await pg.mouse.wheel(0, 100); await pg.waitForTimeout(150); const w1 = await ev(() => __seal.get().P.cur);
  await T.key('KeyQ'); const sk = await ev(() => { const p = __seal.get().P; return p.skillCD && p.skillCD[p.cur] > 0; });
  ok(w0 !== w1 && sk, `wheel ${w0}->${w1}, Q uses weapon skill (${sk})`);
  // 평소 좌클릭은 선택하지 않는다
  await pg.mouse.click(640, 330); await pg.waitForTimeout(150); ok(!(await ev(() => !!__seal.get().sel)), 'left click does not open selection');
  // 건설 바: 탭과 숫자
  await T.key('KeyB'); await T.key('Digit1'); const bs = await ev(() => __seal.get().G.bsel); await T.key('KeyQ'); const bs2 = await ev(() => __seal.get().G.bsel); await T.click('build-trap'); const bs3 = await ev(() => __seal.get().G.bsel);
  await pg.mouse.click(640, 400, { button: 'right' }); await pg.waitForTimeout(120);
  ok(bs === 'xbow' && bs2 === 'wall' && bs3 === 'trap' && !(await ev(() => __seal.get().G.build)), `build bar: 1 ${bs} → Q ${bs2} → click ${bs3}, right-click closes`);
  // 똑똑한 캐기: 옆 칸 돌을 좌클릭
  await home(); await ev(() => { const s = __seal.get(); const tx = Math.floor(s.P.x / 16) + 1, ty = Math.floor(s.P.y / 16); s.tile[__seal.idx(tx, ty)] = __seal.T.STONE; window.__dt = [tx, ty]; });
  await pg.waitForTimeout(400);
  const pos = await ev(() => { const s = __seal.get(); return [s.P.x, s.P.y]; }), st0 = await ev(() => __seal.get().res.stone);
  const Z = await ev(() => __seal.zoom()); await pg.mouse.move(640 + ((Math.floor(pos[0] / 16) + 1.5) * 16 - pos[0]) * Z, OY + 360 + ((Math.floor(pos[1] / 16) + .5) * 16 - pos[1] + 8) * Z - 10 * Z);
  await pg.mouse.down(); await pg.waitForTimeout(1600); await pg.mouse.up();
  const st1 = await ev(() => __seal.get().res.stone), tl = await ev(() => { const [tx, ty] = window.__dt; return __seal.get().tile[__seal.idx(tx, ty)]; });
  ok(st1 > st0 || tl !== 5, `left-click smart dig: stone ${st0}->${st1}, tile ${tl}`);
  await pg.screenshot({ path: T.D + 'controls.png' });
  await T.done();
})();
