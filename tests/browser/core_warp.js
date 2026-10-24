const { setup } = require('./_lib.cjs');
(async () => {
  const T = await setup(), { pg, ev, ok } = T;
  await ev(() => { const t = __seal, s = t.get(); t.calm(); const c = s.cores[1]; c.state = 'active'; c.hp = c.max; s.G.netDirty = true; for (const k in s.res) s.res[k] = 99;
    for (const y of [44, 38, 32]) { s.tile[t.idx(42, y)] = 0; s.tile[t.idx(43, y)] = 0; t.applyCommand(0, { type: 'build', sid: 'pylon', tx: 43, ty: y }); for (let i = 0; i < 3; i++) t.step(1 / 60); }
    for (let i = 0; i < 10; i++) t.step(1 / 60); });
  ok(await ev(() => __seal.get().cores[1].connected), 'grove core connected');
  await pg.mouse.move(1200, 200); await T.key('KeyE', 300);
  const w = await T.find('warp-1'); ok(w && !w.dis, 'warp button in context panel: ' + JSON.stringify(w));
  await pg.screenshot({ path: T.D + 'v10sel.png' });
  await T.click('warp-1'); await pg.waitForTimeout(200);
  const d = await ev(() => { const s = __seal.get(), c = s.cores[1]; return Math.hypot(s.P.x / 16 - c.x - .5, s.P.y / 16 - c.y - .5); });
  ok(d < 8, 'teleported near grove core, dist ' + d.toFixed(1));
  await pg.mouse.move(1200, 200); await T.key('KeyE', 300);
  const back = await T.find('warp-0'); ok(back && back.dis, 'return warp disabled during cooldown: ' + JSON.stringify(back));
  await T.done();
})();
