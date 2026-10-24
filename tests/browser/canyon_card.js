// v41 화석 협곡 · 지역 이름 카드 · 밤 물길을 실제 브라우저에서 그려 본다(예외 없이 그려지는지, 카드가 뜨는지)
const { setup } = require('./_lib.cjs');
(async () => {
  const T = await setup(), { pg, ev, ok } = T;
  await pg.waitForTimeout(1200);
  ok(await ev(() => { const c = __seal.get().G.card; return !!(c && c.z === 'surface' && c.big); }), 'region card on start');
  await pg.screenshot({ path: T.D + 'v41card.png' });
  await ev(() => { const t = __seal, s = t.get(), K = t.CONFIG.canyon; t.calm(); s.P.gear.pick3 = 1; for (let i = 0; i < s.tile.length; i++) if (s.tile[i] === t.T.SEDW) s.tile[i] = t.T.CANF; s.G.ver++; s.P.x = (K.x0 + 6) * 16; s.P.y = (K.entY + .5) * 16; s.P.inv = 1e9; s.G.nofog = true; });
  await pg.waitForTimeout(1500);
  const st = await ev(() => { const s = __seal.get(); return { open: s.G.canyonOpen, card: s.G.card && s.G.card.z, obj: __seal.objective() }; });
  ok(st.open && st.card === 'canyon', 'walking in opens canyon and shows its card: ' + JSON.stringify(st));
  await pg.screenshot({ path: T.D + 'v41canyon.png' });
  await ev(() => { const s = __seal.get(); s.G.clock = 105 + 3; });
  await pg.waitForTimeout(800);
  ok(await ev(() => __seal.get().G.flood), 'night floods the riverbed');
  await pg.screenshot({ path: T.D + 'v41flood.png' });
  await T.done();
})();
