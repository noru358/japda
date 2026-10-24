const { setup } = require('./_lib.cjs');
(async()=>{
 const T=await setup(), {pg, fr}=T; const ev=(f,a)=>fr.evaluate(f,a); const ok=T.ok;
 await ev(()=>{const s=__seal.get(); for(const k in s.res) s.res[k]=500; __seal.calm();});
 // pylon territory: chain pylons north-east out of core range, then build xbow next to last pylon
 const r=await ev(()=>{const t=__seal, s=t.get(); const out=[]; let x=50,y=50;
   for(const [px,py] of [[50,50],[53,50],[56,50]]){ for(let dy=0;dy<4;dy++){ const yy=py+dy; s.tile[t.idx(px,yy)]=0; if(!t.canPlace('pylon',px,yy)){ t.applyCommand(0,{type:'build',sid:'pylon',tx:px,ty:yy}); out.push([px,yy]); for(let i=0;i<3;i++) t.step(1/60); break;} } }
   for(let i=0;i<5;i++) t.step(1/60);
   const last=out[out.length-1]; const tx=last[0]+1, ty=last[1]; s.tile[t.idx(tx,ty)]=0; s.G.ver++;
   const why=t.canPlace('xbow',tx,ty); const dHome=Math.hypot(tx-42,ty-50);
   return {out, why, dHome, conn:s.structs.filter(q=>q.type==='pylon').map(q=>q.connected)};});
 ok(r.why===null && r.dHome>10, `turret buildable next to pylon ${r.dHome.toFixed(1)} tiles from home: ${r.why} ${JSON.stringify(r)}`);
 // cluster turrets near home and E-target
 const tg=await ev(()=>{const t=__seal, s=t.get(); const pos=[]; for(const [x,y] of [[45,47],[46,47],[45,48],[46,48]]){ s.tile[t.idx(x,y)]=0; s.G.ver++; if(!t.canPlace('xbow',x,y)){t.applyCommand(0,{type:'build',sid:'xbow',tx:x,ty:y}); pos.push([x,y]);} } s.P.x=44.5*16; s.P.y=50*16; return pos;});
 await pg.waitForTimeout(300);
 const camp=await ev(()=>{return null});
 // move mouse onto turret (46,47): screen = (wx-camx)*2+640, (wy-camy)*2+380+30
 const sc=await ev(()=>{const s=__seal.get(); return {wx:(46.5)*16, wy:(47.5)*16-6};});
 const cam=await ev(()=>{ /* camera not exported; approximate by player */ const s=__seal.get(); return [s.P.x, s.P.y-8]; });
 await pg.waitForTimeout(800);
 await pg.mouse.move(640+(sc.wx-cam[0])*2, 410+(sc.wy-cam[1])*2);
 await pg.keyboard.press('KeyE'); await pg.waitForTimeout(200);
 const selName=await ev(()=>{const s=__seal.get(); return s.sel? (s.sel.o.isCore? 'core:'+s.sel.o.name : s.sel.o.type+'@'+s.sel.o.x+','+s.sel.o.y):null;});
 ok(selName && selName.startsWith('xbow'), 'E with cursor on clustered turret selects '+selName);
 // upgrade all
 await ev(()=>{__seal.get().tech.atk1=true;});
 await pg.keyboard.down('Alt'); await pg.keyboard.press('KeyF'); await pg.keyboard.up('Alt'); await pg.waitForTimeout(200);
 const lvs=await ev(()=>__seal.get().structs.filter(q=>!q.dead&&q.type==='xbow').map(q=>q.lv));
 ok(lvs.filter(v=>v===1).length>=4, 'Alt+F upgraded all: '+lvs);
 await pg.keyboard.press('KeyE');
 // craft armor
 await ev(()=>{const s=__seal.get(); s.P.x=42.5*16; s.P.y=53.5*16;}); await pg.waitForTimeout(200);
 await T.key('KeyC',250); await T.click('cat-1'); await T.click('craft-armor1');
 const a2=await T.find('craft-armor2'); const shown2=!!a2 && !a2.dis; await T.click('craft-boots'); await T.click('cat-0'); await T.click('craft-blade1');
 const P=await ev(()=>{const p=__seal.get().P; return {max:p.max,gear:p.gear};});
 ok(P.max===15 && shown2 && P.gear.boots && P.gear.blade===1, 'gear '+JSON.stringify(P)+' armor2 craftable '+shown2);
 await pg.screenshot({path:T.D+'v7craft.png'});
 await pg.keyboard.press('KeyC');
 await T.done();
})();
