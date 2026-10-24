const { setup } = require('./_lib.cjs');
(async () => {
  const T = await setup(), { pg, ev, ok } = T;
  await ev(() => { const t = __seal, s = t.get(); t.calm(); s.S.nests = 1; s.res.essence = 20; const P = s.P; P.bag = [{ id: 'miner', q: 5, uid: 1 }, { id: 'miner', q: 2, uid: 2 }, { id: 'essneck', q: 4, uid: 3 }, { id: 'blink', q: 3, uid: 4 }, { id: 'glass', q: 5, uid: 5 }, { id: 'lantern', q: 1, uid: 6 }]; for (let i = 0; i < 3; i++) t.dropAcc(P.x + 40 + i * 12, P.y + 30); });
  await T.key('KeyI', 300); const s0 = await T.st(); ok(s0.menu && s0.tab === 'char', 'I opens character tab');
  await T.hover('bag-1'); ok((await T.st()).preview, 'hovering a bag item previews stat change');
  await T.click('bag-0'); await T.click('bag-0');
  const eq = await ev(() => { const e = __seal.get().P.eq; return [e.ring0 && e.ring0.id, e.ring1 && e.ring1.id, __seal.get().P.mods.set]; });
  ok(eq[0] === 'miner' && eq[1] === 'miner' && eq[2] === 'miner', 'two clicks equip both rings → set: ' + eq);
  ok((await T.focus()) === 'CANVAS', 'focus stays on canvas');
  await T.click('slot-ring1'); const un = await ev(() => !__seal.get().P.eq.ring1); ok(un, 'click equipped slot unequips');
  // 우클릭 분해 → 되돌리기
  const before = await ev(() => [__seal.get().P.bag.length, __seal.get().res.essence]);
  await T.click('bag-0', 'right'); const mid = await ev(() => [__seal.get().P.bag.length, __seal.get().res.essence]);
  await T.click('acc-undo'); const after = await ev(() => [__seal.get().P.bag.length, __seal.get().res.essence]);
  ok(mid[0] === before[0] - 1 && mid[1] === before[1] + 1 && after[0] === before[0] && after[1] === before[1], `right-click salvage ${before}→${mid}, undo → ${after}`);
  // 커서 올리고 R = 재련
  await T.hover('bag-2'); const e0 = await ev(() => __seal.get().res.essence); await T.key('KeyR'); const e1 = await ev(() => __seal.get().res.essence);
  ok(e1 === e0 - 3 && (await T.st()).menu, `R on hovered item rerolls (essence ${e0}→${e1}), menu stays open`);
  await pg.screenshot({ path: T.D + 'char.png' });
  await T.key('KeyI'); ok(!(await T.st()).menu, 'I closes');
  await pg.waitForTimeout(600); await pg.screenshot({ path: T.D + 'loot.png' });
  await T.done();
})();
