// 시뮬레이션 테스트 묶음. 실행: node seal/tests/sim.test.js (TEST_SEED=숫자 로 시드 변경)
const { boot, ok, summary } = require('./harness');
const { t, store } = boot(); const { T, idx } = t; const WW = 214;
const run = sec => { for (let i = 0; i < sec * 60; i++) t.step(1 / 60); };

// ===== 경로·둥지·균열·제단·하드모드·잔해·코어 포 =====
console.log('\n# 경로·둥지·균열·제단·하드모드·잔해·코어 포');
{
// 1 path rule
t.newGame(); let s=t.get(); for(const k in s.res) s.res[k]=1e5; s.P.x=999*16; s.P.alive=false; s.P.respawnT=1e9;
let placed=0, rejected=[];
for(let y=40;y<=60;y++)for(let x=32;x<=52;x++){const d=Math.hypot(x-42,y-50); if(d>=6.5&&d<7.5){ s.tile[idx(x,y)]=T.GRASS; }}
s.G.ver++;
for(let y=40;y<=60;y++)for(let x=32;x<=52;x++){const d=Math.hypot(x-42,y-50); if(d>=6.5&&d<7.5){ const w=t.canPlace('wall',x,y); if(!w){t.applyCommand(0,{type:'build',sid:'wall',tx:x,ty:y});placed++;} else rejected.push(w);}}
ok(rejected.filter(r=>r.includes('길')).length>=1 && t.pathOK(-1), `ring: placed ${placed}, path-rejected ${rejected.filter(r=>r.includes('길')).length}, pathOK ${t.pathOK(-1)}`);
// enemies route around (none destroyed by rats)
t.spawnFlood({rat:8}); run(40); s=t.get(); ok(s.S.lost===0, `rats maze: lost walls ${s.S.lost}, home ${s.cores[0].hp|0}`);
// 2 nests
t.newGame(); s=t.get(); s.P.alive=false; s.P.respawnT=1e9; t.calm(); t.openSeal(); run(2); t.calm();
const nests=()=>s.gates.filter(g=>g.type==='nest'&&!g.dead);
const g0=nests()[0]; const e0=s.res.essence; for(let k=0;k<60&&!g0.dead;k++){ t.hurtNest(g0,3); run(.05);} 
ok(g0.dead && s.res.essence===e0+5 && s.tile[idx(g0.x,g0.y)]===T.CRYF && s.G.gotEss, `nest destroyed, essence ${s.res.essence}, spawned guards ${t.get().enemies.filter(e=>!e.dead).length}`);
// growth at dawn
t.calm(); const before=nests().length; const cyc=105+45; s.G.clock=Math.floor(s.G.clock/cyc)*cyc+cyc-0.5; s.G.night=true; run(1);
ok(nests().length===before+1, `nest grew: ${before} -> ${nests().length}`);
// 3 extra cracks
t.newGame(); s=t.get(); s.P.alive=false; s.P.respawnT=1e9;
const cracks=()=>s.gates.filter(g=>g.type==='crack'&&g.open).length;
for(let n=0;n<5;n++){ t.calm(); s.G.clock=n*cyc+105-10+0.01; s.G.warned=false; s.G.nights=n; s.G.night=false; run(.1); console.log('  before night',n+1,'open cracks',cracks()); }
ok(cracks()===4,'4 cracks by night 5');
// 4 sword hits nest
t.newGame(); s=t.get(); t.calm(); t.openSeal(); run(1); t.calm();
const g1=nests()[0]; s.P.x=(g1.x-1.2)*16; s.P.y=(g1.y+1)*16+6; const hp0=g1.hp;
t.applyCommand(0,{type:'intent',mvx:0,mvy:0,mx:(g1.x+1)*16,my:(g1.y+1)*16,attack:true,dig:false}); run(.5);
ok(g1.hp<hp0, `sword hits nest: ${hp0} -> ${g1.hp}`);
// 5 research
for(const k in s.res) s.res[k]=200; s.G.gotEss=true; for(const id of ['ess1','ess2','ess3','ess4']) t.applyCommand(0,{type:'research',id});
ok(s.tech.ess1&&s.tech.ess4&&s.P.max===16, `ess research, P.max ${s.P.max}`);
// 6 altar -> guardian -> hardmode -> lord -> win
t.newGame(); s=t.get(); t.calm(); t.openSeal(); run(2); t.calm();
const forceCores=()=>{ if(!s.G.seal2Open){ t.openSeal2(); run(1.2); t.calm(); } if(!s.G.highOpen){ for(let y=36;y<=44;y++) for(let x=146;x<=151;x++) if(s.tile[idx(x,y)]===T.ICEW||s.tile[idx(x,y)]===T.ICES) s.tile[idx(x,y)]=T.SNOW; s.G.ver++; t.openHigh(); t.calm(); } for(const c of s.cores){ c.state='active'; c.connected=true; c.hp=c.max=1e5; } };
forceCores(); s.P.x=(131+1)*16; s.P.y=(49+3)*16; s.P.hp=s.P.max=1e4;
t.useAltar(s.P); ok(!s.G.finale, 'altar refuses without offering: '+t.objective());
s.P.offer=1; t.useAltar(s.P); let F=s.G.finale; ok(F&&F.boss&&F.boss.k==='guardian', 'guardian summoned at altar');
F.boss.hp=1; s.P.x=F.boss.x-12; s.P.y=F.boss.y; s.P.inv=999; s.P.cur='sword';
t.applyCommand(0,{type:'intent',mvx:0,mvy:0,mx:F.boss.x,my:F.boss.y,attack:true,dig:false}); run(.4); t.applyCommand(0,{type:'intent',mvx:0,mvy:0,mx:0,my:0,attack:false,dig:false});
let iron=0, blight=0; for(const v of s.tile){ if(v===13) iron++; if(v===14) blight++; }
ok(s.G.hard && !s.G.over && iron>50 && blight>50 && s.gates.filter(g=>g.abyss).length===2, `hardmode: iron ${iron}, blight ${blight}, abyss ${s.gates.filter(g=>g.abyss).length}, over ${s.G.over}`);
ok(t.pathOK(-1), 'paths still valid after hardmode');
if (process.env.DBG && !t.pathOK(-1)) { const W2=214, TL=t.TILES; const pass=j=>!(TL[s.tile[j]].solid||TL[s.tile[j]].pit); for (const c of s.cores) { const m=new Uint8Array(s.tile.length), q=[]; for (let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++){ if(Math.abs(dx)<2&&Math.abs(dy)<2) continue; const j=idx(c.x+dx,c.y+dy); if(pass(j)){m[j]=1;q.push(j);} } while(q.length){const i=q.pop(),x=i%W2,y=(i/W2)|0; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const j=idx(x+dx,y+dy); if(!m[j]&&pass(j)){m[j]=1;q.push(j);}}} console.log('CORE', c.name, s.gates.filter(g=>!g.dead&&!(g.type==='nest'&&!g.open)&&!(g.ruin&&!g.open)&&!(g.high&&!g.open)).map(g=>(g.type[0])+(g.ruin?'R':g.high?'H':g.abyss?'A':'')+':'+(m[idx(g.x,g.y)]||m[idx(g.x+1,g.y)]||m[idx(g.x,g.y+1)]?1:0)).join(' ')); } }
// night in hardmode spawns shades
t.calm(); forceCores(); const cyc3=150; s.G.clock=Math.floor(s.G.clock/cyc3)*cyc3+104.9; s.G.night=false; s.G.warned=true; run(6);
const shades=t.get().enemies.filter(e=>!e.dead&&e.k==='shade'); ok(shades.length>0 && shades.some(e=>e.max===15), `hard night shades ${shades.length}, hp ${shades[0]&&shades[0].max}`);
t.calm(); forceCores(); s.P.x=(131+1)*16; s.P.y=(49+3)*16; s.P.offer=2; t.useAltar(s.P); F=s.G.finale; ok(F&&F.boss.k==='lord', 'lord summoned');
run(31); ok(F.pulse>=2 && t.get().enemies.filter(e=>!e.dead).length>20, `lord pulses ${F.pulse}, enemies ${t.get().enemies.filter(e=>!e.dead).length}`);
F.boss.hp=1; F.boss.sleep=false; s.P.alive=true; s.P.x=F.boss.x-12; s.P.y=F.boss.y; s.P.inv=999;
t.applyCommand(0,{type:'intent',mvx:0,mvy:0,mx:F.boss.x,my:F.boss.y,attack:true,dig:false}); run(.4);
ok(s.G.ending && s.G.postGame && !s.G.over, 'lord killed -> ending, post-game');
// 8 draw in states
t.newGame(); s=t.get(); t.openSeal(); run(3); s.P.offer=1; t.summonBoss('guardian'); run(1); try{ t.draw(); s.G.build=true; t.draw(); ok(true,'draw ok'); }catch(e){ ok(false,'draw '+e.stack); }
// 9 ruins restore at dawn
t.newGame(); s=t.get(); s.P.alive=false; s.P.respawnT=1e9; t.calm(); for(const k in s.res) s.res[k]=100;
let rx=null; for(let y=40;y<60&&!rx;y++)for(let x=30;x<55&&!rx;x++) if(!t.canPlace('xbow',x,y)){ t.applyCommand(0,{type:'build',sid:'xbow',tx:x,ty:y}); rx=[x,y]; }
let tw=t.get().structs.find(q=>q.x===rx[0]&&q.y===rx[1]); tw.lv=1; t.damageStruct(tw,999); run(.1);
const w0=s.res.wood, gone=!t.get().structs.some(q=>!q.dead&&q.x===rx[0]&&q.y===rx[1]);
const cyc2=150; s.G.clock=Math.floor(s.G.clock/cyc2)*cyc2+cyc2-0.2; s.G.night=true; run(.5);
const back=t.get().structs.find(q=>!q.dead&&q.x===rx[0]&&q.y===rx[1]);
ok(gone&&back&&back.lv===1&&s.res.wood===w0-3, `ruin restored lv${back&&back.lv}, wood paid ${w0-s.res.wood}`);
// 10 home cannon fires
t.newGame(); s=t.get(); s.P.alive=false; s.P.respawnT=1e9; t.calm(); t.spawnFlood({rat:4}); run(30); ok(t.get().S.kills.rat>0, `home cannon kills ${t.get().S.kills.rat}`);
// 11 copper count
let cu=0; for(const v of s.tile) if(v===T.COPPER) cu++; ok(cu>150, `copper tiles ${cu}`);

}

// ===== 장신구 =====
console.log('\n# 장신구');
{
t.newGame(); s=t.get(); t.calm(); const P=s.P;
// quality distribution
const qs=[0,0,0,0,0]; for(let i=0;i<5000;i++){ s.G.loot.length=0; const a=t.dropAcc(0,0); qs[a.q-1]++; } s.G.loot.length=0;
ok(Math.abs(qs[0]/5000-.4)<.03 && qs[4]>80, 'quality dist '+qs);
// pickup
t.dropAcc(P.x+20,P.y); run(1); ok(P.bag.length===1 && s.G.loot.length===0, 'magnet pickup, bag '+P.bag.length);
// equip rings set
P.bag=[{id:'miner',q:5,uid:901},{id:'miner',q:1,uid:902},{id:'guard',q:5,uid:903},{id:'blink',q:5,uid:904},{id:'engineer',q:5,uid:905}];
t.applyCommand(0,{type:'equip',uid:901,slot:'ring0'}); t.applyCommand(0,{type:'equip',uid:902,slot:'ring1'});
ok(P.mods.set==='miner' && Math.abs(P.mods.dig-.8)<1e-6 && P.mods.minerSet===.15, `ring set miner dig ${P.mods.dig}`);
t.applyCommand(0,{type:'equip',uid:903,slot:'neck'}); ok(!P.eq.neck, 'neck locked before first nest');
s.S.nests=1; t.applyCommand(0,{type:'equip',uid:903,slot:'neck'}); ok(P.eq.neck && P.max===18, 'guard neck +6 -> max '+P.max);
t.applyCommand(0,{type:'unequip',slot:'neck'}); ok(P.max===12 && P.hp<=12, 'unequip restores max '+P.max+' hp '+P.hp);
// charm locked until guardian
t.applyCommand(0,{type:'equip',uid:904,slot:'charm'}); ok(!P.eq.charm,'charm locked'); s.G.guardianDown=true; t.applyCommand(0,{type:'equip',uid:904,slot:'charm'}); ok(P.eq.charm,'charm equipped');
// blink via Space(dash cmd)
const x0=P.x; t.applyCommand(0,{type:'intent',mvx:0,mvy:0,mx:P.x+500,my:P.y,attack:false,dig:false}); t.applyCommand(0,{type:'charm'}); ok(P.x-x0>10 && P.charmCD>0, `blink moved ${(P.x-x0).toFixed(1)} cd ${P.charmCD}`);
// engineer build cost
s.S.nests=1; t.applyCommand(0,{type:'equip',uid:905,slot:'neck'}); const D={cost:{stone:4,copper:8}}; 
for(const k in s.res) s.res[k]=100; const st0=s.res.stone; let placed=false; for(let y=45;y<56&&!placed;y++)for(let x=36;x<48&&!placed;x++) if(!t.canPlace('wall',x,y)){ t.applyCommand(0,{type:'build',sid:'wall',tx:x,ty:y}); placed=true;}
ok(st0-s.res.stone===2, 'engineer q5 wall cost stone '+(st0-s.res.stone)+' (base 3 -> round(2.25)=2)');
// reroll never lowers, salvage
P.bag.push({id:'wind',q:2,uid:950}); s.res.essence=30; for(let i=0;i<8;i++) t.applyCommand(0,{type:'reroll',uid:950}); const w=P.bag.find(a=>a.uid===950); ok(w.q>=2 && (w.q===5 || s.res.essence===6), `reroll q ${w.q} essence ${s.res.essence}`);
const e0=s.res.essence; t.applyCommand(0,{type:'salvage',uid:950}); ok(s.res.essence===e0+1 && !P.bag.find(a=>a.uid===950),'salvage');
// quake + sentry + shield
P.bag.push({id:'quake',q:5,uid:960},{id:'sentry',q:5,uid:961},{id:'shield',q:5,uid:962});
t.applyCommand(0,{type:'equip',uid:960,slot:'charm'}); P.charmCD=0; t.spawnFlood({rat:0}); 
const rats=[]; for(let k=0;k<5;k++){} 
P.charmCD=0; t.applyCommand(0,{type:'charm'}); ok(P.charmCD>0,'quake used cd '+P.charmCD);
t.applyCommand(0,{type:'equip',uid:961,slot:'charm'}); P.charmCD=0; t.applyCommand(0,{type:'charm'}); ok(s.G.temps.length===1,'sentry placed'); run(11); ok(t.get().G.temps.length===0,'sentry expires');
t.applyCommand(0,{type:'equip',uid:962,slot:'charm'}); P.charmCD=0; t.applyCommand(0,{type:'charm'}); ok(P.inv>=2.9 && P.shieldT>0,'shield invuln');
// elite drop
let el2=0; for(let i=0;i<2000;i++){ const e=t.get(); } 
// gamble disables dash
P.bag.push({id:'gamble',q:1,uid:970}); t.applyCommand(0,{type:'equip',uid:970,slot:'charm'}); const dc=P.dashCD; P.dash=0; t.applyCommand(0,{type:'intent',mvx:1,mvy:0,mx:0,my:0,attack:false,dig:false}); t.applyCommand(0,{type:'dash'}); ok(P.dash===0 && P.mods.gamble===.5,'gamble no dash');
try{ t.draw(); ok(true,'draw ok'); }catch(e){ ok(false,'draw '+e.stack); }

}

// ===== 층 왕복·감사 회귀 =====
console.log('\n# 층 왕복·감사 회귀');
{
t.newGame(); s=t.get(); for(const k in s.res) s.res[k]=200;
// build some stuff, open seal, enemies around, then snapshot
let n=0; for(let y=44;y<58&&n<6;y++)for(let x=36;x<50&&n<6;x++) if(!t.canPlace('xbow',x,y)){ t.applyCommand(0,{type:'build',sid:'xbow',tx:x,ty:y}); n++; }
t.openSeal(); run(25); s=t.get();
const snap=()=>{ const g=t.get(); let h=0; for(let i=0;i<g.tile.length;i++) h=(h*31+g.tile[i])|0; return JSON.stringify({h, tl:g.tile.length, st:g.structs.filter(q=>!q.dead).map(q=>[q.type,q.x,q.y,q.lv,Math.round(q.hp)]), co:g.cores.map(c=>[c.state,Math.round(c.hp),c.connected]), en:g.enemies.filter(e=>!e.dead).map(e=>[e.k,Math.round(e.x),Math.round(e.y),e.hp]), gates:g.gates.map(q=>[q.type,q.x,q.y,q.open,!!q.dead]), clock:g.G.clock.toFixed(3), nights:g.G.nights, seal:g.G.sealOpen}); };
const before=snap(); const resB=JSON.stringify(s.res), PB=s.P.bag.length;
t.enterAbyss(1); let L=t.layerInfo(); ok(L.kind==='abyss'&&L.W===60&&t.get().tile.length===3600, `in abyss ${JSON.stringify(L)}`);
const ab=t.get(); ok(ab.cores.length===1 && ab.cores[0].state==='active' && ab.enemies.length===0, 'abyss core active, no enemies');
// move & dig & build in abyss for 20s
for(const k in ab.res) ab.res[k]+=0; let nb=0; for(let y=24;y<36&&nb<3;y++)for(let x=24;x<36&&nb<3;x++) if(!t.canPlace('wall',x,y)){ t.applyCommand(0,{type:'build',sid:'wall',tx:x,ty:y}); nb++; }
run(20); try{ t.draw(); ok(true,'draw in abyss'); }catch(e){ ok(false,'draw abyss '+e.stack); }
ok(t.get().structs.filter(q=>!q.dead).length===nb && nb>0, `built ${nb} in abyss`);
t.leaveAbyss(); L=t.layerInfo(); ok(L.kind==='valley'&&L.W===WW, 'back in valley '+JSON.stringify(L));
const after=snap(); ok(before===after, 'valley state identical after round trip'+(before===after?'':'\n'+before.slice(0,300)+'\n'+after.slice(0,300)));
ok(t.get().P.bag.length>=PB, 'player state carried (bag kept across layers, may grow from pickups)');
run(10); try{ t.draw(); ok(true,'draw valley after'); }catch(e){ ok(false,'draw '+e.stack); }
// second trip creates fresh abyss
t.enterAbyss(1); ok(t.get().structs.length===0,'fresh abyss on re-entry'); t.leaveAbyss();
// audit regressions
t.newGame(); s=t.get(); t.calm(); run(200); s.P.hp=5; s.P.lastHit=s.G.runT; // hit in valley at high clock
t.enterAbyss(1); run(8); ok(t.get().P.hp>5, 'regen works in abyss after valley hit (hp '+t.get().P.hp+')'); t.leaveAbyss();
s=t.get(); s.P.hp=3; s.S.nests=1; s.P.bag=[{id:'guard',q:5,uid:77}]; t.applyCommand(0,{type:'equip',uid:77,slot:'neck'}); const hpA=s.P.hp; t.applyCommand(0,{type:'unequip',slot:'neck'}); t.applyCommand(0,{type:'equip',uid:77,slot:'neck'});
ok(s.P.hp===3 && hpA===3 && s.P.max===18, 'no heal from equip toggling (hp '+s.P.hp+', max '+s.P.max+')');

}

// ===== 저장 =====
console.log('\n# 저장');
{
  t.newGame(); let s = t.get(); for (const k in s.res) s.res[k] = 150;
  let n = 0; for (let y = 44; y < 58 && n < 5; y++) for (let x = 36; x < 50 && n < 5; x++) if (!t.canPlace('xbow', x, y)) { t.applyCommand(0, { type: 'build', sid: 'xbow', tx: x, ty: y }); n++; }
  t.openSeal(); run(30); s = t.get(); s.P.bag.push({ id: 'miner', q: 4, uid: 4242 }); s.tech.def1 = true; s.G.hints.test = true;
  const snap = () => { const g = t.get(); let h = 0; for (let i = 0; i < g.tile.length; i++) h = (h * 31 + g.tile[i]) | 0; return JSON.stringify({ h, st: g.structs.filter(q => !q.dead).map(q => [q.type, q.x, q.y, q.lv, Math.round(q.hp)]), co: g.cores.map(c => [c.state, Math.round(c.hp), c.connected, c.lv]), en: g.enemies.filter(e => !e.dead).map(e => [e.k, Math.round(e.x), Math.round(e.y), e.hp, !!e.elite]), gates: g.gates.map(q => [q.type, q.x, q.y, q.open, !!q.dead, q.hp]), clock: g.G.clock.toFixed(2), nights: g.G.nights, seal: g.G.sealOpen, res: g.res, tech: g.tech, P: [Math.round(g.P.x), Math.round(g.P.y), g.P.hp, g.P.max, g.P.bag.length], hints: g.G.hints }); };
  const KEY = 'beyond-the-seal-save', reload = () => { const saved = store.get(KEY); t.newGame(); store.set(KEY, saved); return t.loadGame(); };
  const a = snap(); ok(t.saveGame(), 'saveGame writes');
  const size = store.get(KEY).length; ok(size < 400000, `save size ${Math.round(size / 1024)} KB`);
  ok(reload() && snap() === a, 'load restores identical state');
  t.newGame(); ok(snap() !== a, 'new game overwrites save (R twice = fresh run)');
  run(5); try { t.draw(); ok(true, 'runs and draws after load'); } catch (e) { ok(false, 'draw after load ' + e.stack); }
  // finale boss reference survives
  s = t.get(); for (const c of s.cores) { c.state = 'active'; c.connected = true; c.hp = c.max = 1e5; } s.G.sealOpen = true; s.P.offer = 1; t.summonBoss('guardian'); const bhp = s.G.finale.boss.hp - 37; s.G.finale.boss.hp = bhp; t.saveGame(); reload();
  s = t.get(); ok(s.G.finale && s.G.finale.boss && s.G.finale.boss.hp === bhp && s.enemies.includes(s.G.finale.boss), 'finale boss linked after load');
  // save while in abyss
  t.calm(); s.G.finale = null; t.enterAbyss(1); run(2); t.saveGame(); reload(); ok(t.layerInfo().kind === 'abyss', 'resume inside abyss'); t.leaveAbyss(); ok(t.layerInfo().kind === 'valley' && t.get().tile.length === 214 * 272, 'leave abyss after load');
  // game over clears save
  t.saveGame(); ok(store.has(KEY), 'save exists before loss'); t.damageCore(t.get().cores[0], 1e9); ok(t.get().G.over === 'lose' && !store.has(KEY), 'loss deletes save');
  // boss summons never elite
  t.newGame(); s = t.get(); t.calm(); s.P.offer = 1; for (const c of s.cores) { c.state = 'active'; c.connected = true; c.hp = c.max = 1e5; } t.summonBoss('guardian');
  for (let i = 0; i < 60 * 120; i++) t.step(1 / 60);
  const minions = t.get().enemies.filter(e => (e.k === 'wisp' || e.k === 'beetle') && !e.dead); ok(t.get().enemies.every(e => !e.elite || !(e.k === 'wisp' || e.k === 'beetle')) , `boss minions never elite (${minions.length} alive)`);
}

// ===== 무한 심연 =====
console.log('\n# 무한 심연');
{
  const KEY = 'beyond-the-seal-save';
  t.newGame(); let s = t.get(); t.calm(); t.openSeal(); run(1); t.calm();
  for (const c of s.cores) { c.state = 'active'; c.connected = true; c.hp = c.max = 1e5; } for (const k in s.res) s.res[k] = 300;
  // 엔딩
  s.P.offer = 2; s.G.hard = true; t.summonBoss('lord'); s.G.finale.boss.hp = 1; s.P.x = s.G.finale.boss.x - 12; s.P.y = s.G.finale.boss.y; s.P.inv = 999;
  t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: s.G.finale.boss.x, my: s.G.finale.boss.y, attack: true, dig: false }); run(.4); t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: 0, my: 0, attack: false, dig: false });
  s = t.get(); ok(s.G.ending && s.G.postGame && !s.G.over && s.G.tablets.length === 1 && store.has(KEY), 'lord -> ending screen, tablet 1, save kept');
  const clk = s.G.clock; run(2); ok(t.get().G.clock === clk, 'world frozen on ending screen'); t.endContinue(); ok(!t.get().G.ending, 'continue after ending');
  // 1층 사냥
  const tab = s.G.tablets[0]; tab.obj = 'hunt'; tab.mods = []; t.enterTablet(tab); let L = t.abyssLayer();
  ok(L.kind === 'abyss' && L.ab && L.ab.obj.need === 42 && t.get().gates.filter(g => g.type === 'crack').length === 3, `floor 1 hunt need ${L.ab.obj.need}, cracks ${t.get().gates.length}`);
  s = t.get(); s.P.hp = s.P.max = 999; s.P.inv = 999; run(10); ok(t.get().enemies.filter(e => !e.dead).length > 0, 'waves spawn in abyss');
  const e0 = t.get().enemies.find(e => !e.dead); ok(e0 && e0.dm > 1 && e0.max >= Math.round(e0.K.hp * 1.15), `enemy scaled hp ${e0 && e0.max} dm ${e0 && e0.dm}`);
  L.ab.obj.have = L.ab.obj.need; run(.2); ok(L.ab.bossPhase && L.ab.boss.length >= 3, 'objective done -> warden pack');
  const sh0 = t.get().res.shard; for (const e of L.ab.boss) { e.hp = 0; e.dead = true; } run(.2);
  s = t.get(); ok(L.ab.cleared && s.res.shard === sh0 + 6 && s.G.tablets.some(x => x.depth === 2) && !s.G.tablets.some(x => x.depth === 1) && s.G.bestDepth === 1, 'floor clear: shards +6, tablet 2, best 1');
  // 다음 층(바로)
  t.setSel(s.cores[0]); t.applyCommand(0, { type: 'abyssNext' }); L = t.abyssLayer(); ok(L.kind === 'abyss' && L.depth === 2, 'next floor directly');
  // 저장 후 이어하기(심연 안, 목표 진행 유지)
  L.ab.obj.have = 7; t.saveGame(); const saved = store.get(KEY); t.newGame(); store.set(KEY, saved); t.loadGame(); L = t.abyssLayer();
  ok(L.kind === 'abyss' && L.depth === 2 && L.ab.obj.have === 7 && t.get().G.postGame, 'resume in abyss with objective progress');
  // 실패: 코어 붕괴
  s = t.get(); const tabsBefore = s.G.tablets.length; t.damageCore(s.cores[0], 1e9); run(.1);
  ok(t.abyssLayer().kind === 'valley' && !t.get().G.over && t.get().G.tablets.length === tabsBefore, 'abyss core loss = floor fail, tablet kept, no game over');
  // 5층 보스, 채굴/굴 파기 목표 생성
  s = t.get(); for (const c of s.cores) { c.state = 'active'; c.connected = true; } s.G.tablets.push({ uid: 9001, depth: 5, obj: 'mine' });
  t.enterTablet(s.G.tablets.find(x => x.uid === 9001)); L = t.abyssLayer(); let ab = 0; for (const v of t.get().tile) if (v === T.ABYSS) ab++;
  ok(ab >= 30, `mine floor has ${ab} abyss stones`); L.ab.obj.have = 30; run(.2); ok(L.ab.boss && L.ab.boss[0] && L.ab.boss[0].k === 'guardian' && L.ab.boss[0].max > 900, `depth 5 boss guardian hp ${L.ab.boss && L.ab.boss[0].max}`);
  t.applyCommand(0, { type: 'abyssLeave' }); s = t.get(); s.G.tablets.push({ uid: 9002, depth: 3, obj: 'nests' }); t.enterTablet(s.G.tablets.find(x => x.uid === 9002));
  ok(t.get().gates.filter(g => g.type === 'nest' && !g.dead).length === 3, 'nests floor has 3 nests');
  const g1 = t.get().gates.find(g => g.type === 'nest'); while (!g1.dead) t.hurtNest(g1, 50); ok(t.abyssLayer().ab.obj.have === 1, 'nest kill counts');
  try { t.draw(); ok(true, 'draw abyss with objective HUD'); } catch (e2) { ok(false, 'draw ' + e2.stack); }
  ok(t.pathOK(-1), 'abyss path rule ok');
}
// ===== 심연 변조·파편 =====
console.log('\n# 심연 변조·파편');
{
  t.newGame(); let s = t.get(); t.calm(); s.G.postGame = true; for (const k in s.res) s.res[k] = 500;
  const cnt = d => { let mx = 0, goodOk = true; for (let i = 0; i < 200; i++) { const tb = t.makeTablet(d); mx = Math.max(mx, tb.mods.length); if (tb.mods.filter(k => k === 'bounty' || k === 'swift').length > 1) goodOk = false; } return [mx, goodOk]; };
  const [m1] = cnt(1), [m5] = cnt(5), [m10, g10] = cnt(10); ok(m1 === 1 && m5 === 2 && m10 === 3 && g10, `mods per depth 1/5/10 = ${m1}/${m5}/${m10}, max one good`);
  const enter = mods => { s = t.get(); const tb = { uid: 5000 + Math.random(), depth: 2, obj: 'hunt', mods }; s.G.tablets.push(tb); t.enterTablet(tb); s = t.get(); s.P.hp = s.P.max = 999; return t.abyssLayer(); };
  let L = enter(['fort']); let placed = null; for (let y = 25; y < 36 && !placed; y++) for (let x = 25; x < 36 && !placed; x++) if (!t.canPlace('wall', x, y)) { const st0 = s.res.stone; t.applyCommand(0, { type: 'build', sid: 'wall', tx: x, ty: y }); placed = st0 - s.res.stone; }
  ok(placed === 6, 'fort: wall costs 6 stone (x2), paid ' + placed); t.applyCommand(0, { type: 'abyssLeave' });
  L = enter(['explode']); let wx = null; for (let y = 25; y < 36 && !wx; y++) for (let x = 25; x < 36 && !wx; x++) if (!t.canPlace('wall', x, y)) { t.applyCommand(0, { type: 'build', sid: 'wall', tx: x, ty: y }); wx = [x, y]; }
  const w = t.get().structs.find(q => q.x === wx[0] && q.y === wx[1]); const e = t.get().enemies; t.spawnFlood && 0;
  const sp = t.get(); const en = { dead: false }; 
  { const g = t.get(); const ee = g.enemies; }
  // spawn one rat next to the wall and kill it
  run(9); const victim = t.get().enemies.find(q => !q.dead); if (victim) { victim.x = (wx[0] + .5) * 16; victim.y = (wx[1] + 1.5) * 16; victim.hp = 1; t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: 0, my: 0, attack: false, dig: false }); }
  const hp0 = w.hp; if (victim) { const g = t.get(); g.P.x = victim.x + 10; g.P.y = victim.y; g.P.inv = 999; t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: victim.x, my: victim.y, attack: true, dig: false }); run(.3); t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: 0, my: 0, attack: false, dig: false }); run(2); }
  ok(victim && w.hp < hp0, `explode: wall damaged ${hp0} -> ${Math.round(w.hp)}`); t.applyCommand(0, { type: 'abyssLeave' });
  L = enter(['rocks', 'quake']); run(10.2); ok((L.ab.rocks || []).length === 3, 'rocks: 3 warnings after 10s'); run(3.1); ok((L.ab.rocks || []).length === 0, 'rocks land after 3s'); run(12); ok(L.ab.slowT > 0, 'quake slows after 25s'); t.applyCommand(0, { type: 'abyssLeave' });
  L = enter(['bounty']); const sh0 = t.get().res.shard; L.ab.obj.have = L.ab.obj.need; run(.2); for (const b of L.ab.boss) { b.hp = 0; b.dead = true; } run(.2); ok(t.get().res.shard - sh0 === 11, 'bounty: depth 2 clear gives 11 shards (7 x1.5) got ' + (t.get().res.shard - sh0)); t.applyCommand(0, { type: 'abyssLeave' });
  // shard uses
  s = t.get(); s.P.bag.push({ id: 'wind', q: 2, uid: 7777 }); const r0 = s.res.shard; t.applyCommand(0, { type: 'accUp', uid: 7777 }); ok(s.P.bag.find(a => a.uid === 7777).q === 3 && r0 - s.res.shard === 20, 'accUp +1 quality costs q*10');
  const tb = t.makeTablet(3); s.G.tablets.push(tb); const r1 = s.res.shard; t.applyCommand(0, { type: 'tabletUp', uid: tb.uid }); ok(tb.depth === 4 && r1 - s.res.shard === 15, 'tablet up 3->4 costs 15');
  s.G.bestDepth = 7; const n0 = s.G.tablets.length; t.applyCommand(0, { type: 'tabletMake', depth: 6 }); t.applyCommand(0, { type: 'tabletMake', depth: 11 }); ok(s.G.tablets.length === n0 + 1, 'checkpoint 6 allowed, 11 refused (best 7)');
  // turret level 4
  let tw = null; for (let y = 44; y < 58 && !tw; y++) for (let x = 36; x < 50 && !tw; x++) if (!t.canPlace('xbow', x, y)) { t.applyCommand(0, { type: 'build', sid: 'xbow', tx: x, ty: y }); tw = t.get().structs.find(q => q.x === x && q.y === y); }
  tw.lv = 3; s.G.postGame = false; t.setSel(tw); t.applyCommand(0, { type: 'upgrade' }); ok(tw.lv === 3, 'lv5 locked before ending'); s.G.postGame = true; t.applyCommand(0, { type: 'upgrade' }); ok(tw.lv === 4 && tw.max === 140, 'lv5 심연 각인 after ending');
  try { t.draw(); ok(true, 'draw ok'); } catch (e2) { ok(false, 'draw ' + e2.stack); }
}
// v18 캔버스 UI: 모든 탭·패널·툴팁을 진행 단계별로 그려도 예외가 없어야 한다
{
  const { t } = boot(); let s = t.get(); t.calm();
  const sweep = (tag) => {
    let tips = 0, err = null;
    try {
      t.draw(); tips += t.drawTips();
      for (const tab of ['char', 'craft', 'research', 'log', 'altar']) { t.openMenu(tab); t.draw(); tips += t.drawTips(); }
      t.closeMenu(); s.G.build = true; for (const g of ['atk', 'def', 'eco']) { s.G.bsel = { atk: 'xbow', def: 'wall', eco: 'drill' }[g]; t.draw(); tips += t.drawTips(); } s.G.build = false;
      for (const c of s.cores) { t.setSel(c); t.draw(); tips += t.drawTips(); }
      for (const st of s.structs.slice(0, 6)) { t.setSel(st); t.draw(); tips += t.drawTips(); } t.setSel(null);
    } catch (e) { err = e.stack; }
    ok(!err && tips > 20, `UI sweep ${tag}: ${tips} tooltips ${err || ''}`);
  };
  s.P.bag = [{ id: 'miner', q: 3, uid: 1 }, { id: 'blink', q: 5, uid: 2 }, { id: 'guard', q: 1, uid: 3 }];
  for (const [x, y, k] of [[45, 47, 'xbow'], [39, 47, 'wall'], [44, 55, 'trap'], [47, 50, 'pylon']]) { s.tile[t.idx(x, y)] = 0; for (const r in s.res) s.res[r] = 99; t.applyCommand(0, { type: 'build', sid: k, tx: x, ty: y }); }
  sweep('early');
  t.openSeal(); for (let i = 0; i < 60; i++) t.step(1 / 60); s.S.nests = 1; s.G.gotEss = true; s.G.gotCrystal = true; sweep('seal open');
  t.enterHardmode(); s.G.guardianDown = true; s.G.gotIron = true; s.P.eq.charm = { id: 'shield', q: 2, uid: 9 }; sweep('hardmode');
  t.calm(); t.reachEnding(); t.endContinue(); s.res.shard = 40; s.P.x = (131 + 1) * 16; s.P.y = (49 + 4) * 16; sweep('post-game at altar');
  // 메뉴가 열려 있으면(혼자) 시간이 멈춘다
  t.openMenu('char'); const c0 = s.G.clock; t.step(1 / 60); t.step(1 / 60); ok(s.G.clock === c0, 'solo menu pauses step'); t.closeMenu(); t.step(1 / 60); ok(s.G.clock > c0, 'closing menu resumes');
  // 분해 → 되돌리기 명령
  const n0 = s.P.bag.length, e0 = s.res.essence; t.applyCommand(0, { type: 'salvage', uid: s.P.bag[0].uid }); t.applyCommand(0, { type: 'unsalvage' }); ok(s.P.bag.length === n0 && s.res.essence === e0, 'salvage + unsalvage restores item and essence');
  t.enterAbyss(1); for (let i = 0; i < 120; i++) t.step(1 / 60); s = t.get(); sweep('abyss');
}
// v19 주인공 성장 · 무기 단계 · 구리 생산
{
  const { t } = boot(); const s = t.get(); t.calm(); for (const k in s.res) s.res[k] = 200; s.G.gotCrystal = s.G.gotEss = s.G.gotIron = true;
  const d0 = t.wDmg(s.P, 'sword'); t.applyCommand(0, { type: 'craft', id: 'w_sword_1' }); t.applyCommand(0, { type: 'craft', id: 'w_sword_2' }); t.applyCommand(0, { type: 'craft', id: 'w_sword_3' });
  ok(s.P.wlv.sword === 3 && t.wDmg(s.P, 'sword') > d0, `sword +3 crafted, dmg ${d0}→${t.wDmg(s.P, 'sword')}`);
  t.applyCommand(0, { type: 'craft', id: 'w_sword_5' }); ok(s.P.wlv.sword === 3, 'cannot skip tiers');
  t.applyCommand(0, { type: 'craft', id: 'w_xbow_1' }); ok(!s.P.wlv.xbow, 'xbow +1 needs xbow first');
  const L0 = s.P.lvl, m0 = s.P.max; t.gainXP(s.P, 200); ok(s.P.lvl > L0 && s.P.max > m0, `level ${L0}→${s.P.lvl}, max hp ${m0}→${s.P.max}`);
  const c = s.cores[2]; c.state = 'active'; c.connected = true; const cu0 = s.res.copper; s.G.prodT = 99; t.step(1 / 60); ok(s.res.copper >= cu0 + 1, 'crystal core also gives copper');
}
// v20 버그 수정 회귀
{
  const { t } = boot(); const s = t.get(); t.calm(); for (const k in s.res) s.res[k] = 200; s.tech.def1 = true;
  // 전신주 업그레이드 즉시 영역 확대
  let pyl = null; for (let x = 49; x < 56 && !pyl; x++) { s.tile[t.idx(x, 50)] = 0; if (!t.canPlace('pylon', x, 50)) { t.applyCommand(0, { type: 'build', sid: 'pylon', tx: x, ty: 50 }); pyl = t.get().structs.find(q => q.type === 'pylon'); } }
  t.step(1 / 60); const cnt = () => t.get().terrConn.reduce((a, v) => a + v, 0), a0 = cnt();
  t.setSel(pyl); t.applyCommand(0, { type: 'upgrade' }); t.step(1 / 60); const a1 = cnt();
  ok(pyl.lv === 1 && a1 > a0, `pylon upgrade grows territory right away ${a0}→${a1}`);
  // 내가 선 칸에 벽을 지으면 지어지고 나는 밀려난다
  const tx = Math.floor(s.P.x / 16), ty = Math.floor(s.P.y / 16); s.tile[t.idx(tx, ty)] = 0;
  const why = t.canPlace('wall', tx, ty); t.applyCommand(0, { type: 'build', sid: 'wall', tx, ty });
  const w = t.get().structs.find(q => q.type === 'wall' && q.x === tx && q.y === ty), inside = Math.floor(s.P.x / 16) === tx && Math.floor(s.P.y / 16) === ty;
  ok(!why && !!w && !inside, `build on own tile: ${why} built=${!!w} pushed=${!inside}`);
  // 포탑은 바위 너머를 조준하지 않는다
  const [cx, cy] = [(42 + .5) * 16, (50 + .5) * 16]; ok(t.losClear(cx, cy, cx + 32, cy), 'los open ground');
  s.tile[t.idx(44, 50)] = t.T.STONE; ok(!t.losClear(cx, cy, cx + 64, cy), 'los blocked by stone');
  // 엔딩 후 목표
  t.reachEnding(); t.endContinue(); ok(/심연/.test(t.objective()), 'post-game objective: ' + t.objective());
}
// v21 특수 적 · 플레이 기록 · 목표 화살표
{
  const { t } = boot(); const s = t.get(); t.calm(); for (const k in s.res) s.res[k] = 300; s.P.inv = 999; s.P.hp = s.P.max = 99;
  const run = n => { for (let i = 0; i < n * 60; i++) t.step(1 / 60); };
  // 부풀이: 벽에 닿으면 터져서 벽이 상한다
  let wall = null; for (let x = 46; x < 52 && !wall; x++) { s.tile[t.idx(x, 50)] = 0; if (!t.canPlace('wall', x, 50)) { t.applyCommand(0, { type: 'build', sid: 'wall', tx: x, ty: 50 }); wall = t.get().structs.find(q => q.type === 'wall'); } }
  s.P.x = 30 * 16; s.P.y = 40 * 16; const b = t.makeEnemy('bomber', (wall.x + 1.6) * 16, (wall.y + .5) * 16, true); const hp0 = wall.hp, ch0 = s.cores[0].hp;
  for (let i = 0; i < 240 && !b.dead; i++) { s.cores[0].cd = 99; t.step(1 / 60); } ok(b.dead && (wall.dead || wall.hp < hp0 || s.cores[0].hp < ch0), `bomber explodes on contact: wall ${hp0}→${wall.dead ? 'destroyed' : wall.hp}, core ${ch0}→${s.cores[0].hp}`);
  // 갈고리: 시야가 트이면 플레이어를 끌어당긴다
  t.calm(); s.P.x = 42.5 * 16; s.P.y = 55 * 16; for (let x = 38; x < 47; x++) for (let y = 55; y < 58; y++) s.tile[t.idx(x, y)] = 0;
  s.P.inv = 0; const hk = t.makeEnemy('hook', s.P.x + 4.5 * 16, s.P.y, true); hk.hookCD = 0; const px0 = s.P.x; let pulled = false;
  for (let i = 0; i < 90; i++) { s.P.inv = 0; t.step(1 / 60); if (s.P.pullT > 0) pulled = true; }
  ok(pulled && s.P.x > px0, `hook pulls player toward it (${px0.toFixed(0)}→${s.P.x.toFixed(0)})`); s.P.inv = 999;
  // 마비 정령: 포탑에 붙으면 그 포탑은 쏘지 않는다
  t.calm(); s.P.x = 30 * 16; s.P.y = 40 * 16; let tw = null; for (let x = 44; x < 50 && !tw; x++) { s.tile[t.idx(x, 47)] = 0; if (!t.canPlace('xbow', x, 47)) { t.applyCommand(0, { type: 'build', sid: 'xbow', tx: x, ty: 47 }); tw = t.get().structs.find(q => q.type === 'xbow'); } }
  const hx = t.makeEnemy('hex', (tw.x + .5) * 16, (tw.y + .5) * 16 - 4, true); run(.5);
  ok(hx.att === tw && tw.jamT > s.G.clock, 'hex latched and jammed turret');
  const shots0 = t.get().enemies.length; tw.cd = 0; const fired = (() => { t.step(1 / 60); return tw.cd > 0; })();
  ok(!fired, 'jammed turret does not fire');
  // 기록
  ok(Array.isArray(s.G.stats) && s.G.stats.length >= 1 && s.G.spent && s.G.spent.stone > 0, `stats ${s.G.stats.length} samples, spent stone ${s.G.spent && s.G.spent.stone}`);
  // 목표 화살표: 열쇠를 가지면 봉인 쪽
  s.P.keys = 1; ok(!!t.objTarget(), 'objective arrow target when key in hand');
  try { t.openMenu('log'); t.draw(); t.drawTips(); t.closeMenu(); t.draw(); ok(true, 'draw log tab with stats + special enemies'); } catch (e) { ok(false, 'draw ' + e.stack); }
}
// v22 다른 코어 옆에서도 제작
{
  const { t } = boot(); const s = t.get(); t.calm(); for (const k in s.res) s.res[k] = 99;
  const c = s.cores[1]; s.P.x = (c.x + .5) * 16; s.P.y = (c.y + 3.5) * 16;
  t.applyCommand(0, { type: 'craft', id: 'armor1' }); ok(!s.P.gear.armor, 'dormant/unlinked grove core: no crafting');
  c.state = 'active'; c.connected = true; t.applyCommand(0, { type: 'craft', id: 'armor1' }); ok(s.P.gear.armor === 1, 'connected grove core: crafting works');
}
// ===== v23 남쪽 유적 =====
console.log('\n# v23 남쪽 유적');
{
  t.newGame(); let s = t.get(); t.calm(); t.openSeal(); run(1.2); t.calm(); const R = { x0: 8, x1: 118, y0: 98, y1: 146 };
  const cnt = v => { let n = 0; for (const q of s.tile) if (q === v) n++; return n; };
  const relics = () => s.structs.filter(q => !q.dead && q.type === 'relic');
  const rg = s.gates.find(g => g.ruin), rc = s.cores.find(c => c.ruin);
  ok(cnt(T.SUN) > 60 && cnt(T.RUNE) > 60 && cnt(T.SEAL2) > 4 && cnt(T.CACHE) >= 5, `ruin gen: sun ${cnt(T.SUN)} rune ${cnt(T.RUNE)} seal2 ${cnt(T.SEAL2)} cache ${cnt(T.CACHE)}`);
  ok(relics().length >= 4 && relics().every(q => q.hostile), `hostile relics ${relics().length}`);
  ok(rg && !rg.open && rc && rc.state === 'dormant' && t.pathOK(-1), 'ruin gate closed, ruin core dormant, paths ok before seal2');
  ok(t.zoneAt(63, 120) === 'ruin' && t.zoneAt(100, 30) === 'cave' && t.zoneAt(42, 50) === 'surface', 'zones');
  // 봉인 띠 바깥에서 유적까지 이어지는지(봉인을 바닥으로 보면)
  const reach = (sx, sy, passSeal) => { const m = new Uint8Array(s.tile.length), q = [idx(sx, sy)]; m[q[0]] = 1; while (q.length) { const i = q.pop(), x = i % WW, y = (i / WW) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = idx(x + dx, y + dy); if (x + dx < 0 || x + dx >= WW || y + dy < 0 || y + dy >= 150 || m[j]) continue; const v = s.tile[j]; if (v === T.GRASS || v === T.DIRTF || v === T.RUINF || v === T.CARPET || v === T.WATER || v === T.CRYF || v === T.CRACK || v === T.SEAL || v === T.BLIGHT || (passSeal && v === T.SEAL2)) { m[j] = 1; q.push(j); } } } return m; };
  let m = reach(42, 50, true); ok(m[idx(rc.x, rc.y + 2)] && m[idx(rg.x, rg.y)], 'home connects to ruin core & gate through seal1+caves+seal2');
  m = reach(42, 50, false); ok(!m[idx(rc.x, rc.y + 2)], 'seal2 closes the ruins');
  // 두 번째 봉인 열기: 열쇠 → E
  s.P.keys2 = 1; const st = []; for (let i = 0; i < s.tile.length; i++) if (s.tile[i] === T.SEAL2) st.push(i);
  s.P.x = ((st[0] % WW) + .5) * 16; s.P.y = (((st[0] / WW) | 0) - 1 + .5) * 16; if (t.get().tile[t.idx(Math.floor(s.P.x / 16), Math.floor(s.P.y / 16))] === T.BEDROCK) s.P.y += 32;
  t.interact(s.P); run(1.5); s = t.get();
  ok(s.G.seal2Open && cnt(T.SEAL2) === 0 && rg.open && s.enemies.some(e => e.k === 'colossus' && e.sleep), `seal2 opened: keys2 ${s.P.keys2}, gate open ${rg.open}`);
  ok(t.pathOK(-1), 'paths ok after seal2');
  ok(/수호 골렘|봉인|코어/.test(t.objective()), 'objective after seal2: ' + t.objective());
  // 적대 고대 포탑: 시야 안이면 나를 쏜다
  t.calm(); const r0 = relics().find(q => q.hostile); s.P.hp = s.P.max = 50; s.P.inv = 0;
  let spot = null; for (let d = 2; d <= 5 && !spot; d++) for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) { const x = r0.x + dx, y = r0.y + dy; if (s.tile[idx(x, y)] === T.RUINF && t.losClear((r0.x + .5) * 16, (r0.y + .5) * 16 - 4, (x + .5) * 16, (y + .5) * 16 - 4)) { spot = [x, y]; break; } }
  s.P.x = (spot[0] + .5) * 16; s.P.y = (spot[1] + .5) * 16; s.P.alive = true; run(4);
  ok(s.P.hp < 50, `hostile relic shoots me: hp ${s.P.hp}`);
  // 되찾기: 룬석 없으면 실패, 있으면 성공
  t.calm(); s.res.rune = 0; s.P.x = (r0.x + .5) * 16 + (spot[0] - r0.x) * 16 / Math.max(1, Math.abs(spot[0] - r0.x) + Math.abs(spot[1] - r0.y)) * 1.2; s.P.y = (r0.y + .5) * 16 + (spot[1] - r0.y) * 16 / Math.max(1, Math.abs(spot[0] - r0.x) + Math.abs(spot[1] - r0.y)) * 1.2;
  ok(t.nearRelic(s.P) === r0, 'near relic');
  t.interact(s.P); ok(r0.hostile, 'reclaim needs rune: ' + t.relicWhy(r0));
  s.res.rune = 10; t.interact(s.P); ok(!r0.hostile && s.res.rune === 6, 'relic reclaimed for 4 rune');
  // 영역 없이도 적을 쏜다
  const e = t.makeEnemy('rat', (spot[0] + .5) * 16, (spot[1] + .5) * 16, true); e.hp = e.max = 999; s.P.x = 9999; s.P.alive = false; s.P.respawnT = 1e9; run(3);
  ok(e.hp < 999, `reclaimed relic fires without territory: rat hp ${e.hp}`);
  t.applyCommand(0, { type: 'demolish', tx: r0.x, ty: r0.y }); ok(!r0.dead, 'relic cannot be demolished');
  // 고대 코어: 골렘 전엔 못 깨운다
  t.calm(); s.P.alive = true; s.P.x = (rc.x + .5) * 16; s.P.y = (rc.y + 2.5) * 16; for (const k in s.res) s.res[k] = 100;
  t.interact(s.P); ok(rc.state === 'dormant', 'ruin core locked by colossus');
  s.G.colossusDown = true; t.interact(s.P); ok(rc.state === 'active', 'ruin core wakes after colossus');
  s.G.colossusDown = false; rc.state = 'dormant';
  // 고대 수호 골렘: 묶여 있고 내려찍는다
  t.calm(); const b = t.makeEnemy('colossus', (rc.x + .5) * 16, (rc.y - 3.5) * 16, true); b.home = [b.x, b.y]; s.P.hp = s.P.max = 100; s.P.inv = 0; s.P.x = b.x + 30; s.P.y = b.y; run(6);
  ok(s.P.hp < 100 && b.woke, `colossus hurts me up close: hp ${s.P.hp}`);
  s.P.x = b.x + 40 * 16; s.P.y = b.y; s.P.inv = 999; run(12); const dh = Math.hypot(b.x - b.home[0], b.y - b.home[1]) / 16;
  ok(dh < 3, `colossus returns home when I leave (${dh.toFixed(1)} tiles from home)`);
  b.hp = 1; s.P.x = b.x - 12; s.P.y = b.y; s.P.cur = 'sword'; t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: b.x, my: b.y, attack: true, dig: false }); run(.5); t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: 0, my: 0, attack: false, dig: false });
  ok(b.dead && s.G.colossusDown && s.G.gotRuin && !s.G.finale, 'colossus down → flag, ruin res, no finale');
  // 연구 4단계: 유적 광물이 있어야
  t.newGame(); s = t.get(); t.calm(); for (const k in s.res) s.res[k] = 300; s.G.gotCrystal = true; s.P.x = (42 + .5) * 16; s.P.y = (53 + .5) * 16;
  for (const id of ['atk1', 'atk2', 'atk3', 'def1', 'def2', 'def3', 'eco1', 'eco2', 'eco3']) t.applyCommand(0, { type: 'research', id });
  t.applyCommand(0, { type: 'research', id: 'atkS' }); ok(!s.tech.atkS, 'atkS locked without ruin ores');
  s.G.gotRuin = true; for (const id of ['atkS', 'defS', 'ecoS']) t.applyCommand(0, { type: 'research', id });
  ok(s.tech.atkS && s.tech.defS && s.tech.ecoS, 'tier-4 ruin research done');
  s.G.gotIron = true; t.applyCommand(0, { type: 'research', id: 'atk4' }); ok(s.tech.atk4, 'iron research follows ruin research');
  // 화상: 포탑에 맞으면 불탄다
  const tx = 42, ty = 44; for (let yy = ty - 6; yy <= ty; yy++) s.tile[idx(tx, yy)] = T.GRASS; s.G.ver++; t.applyCommand(0, { type: 'build', sid: 'xbow', tx, ty }); const xb = s.structs.find(q => q.type === 'xbow');
  const e2 = t.makeEnemy('golem', (tx + .5) * 16, (ty - 4.5) * 16, true); e2.hp = e2.max = 500; e2.vx = e2.vy = 0; run(.1);
  for (let k = 0; k < 120 && !(e2.burn > 0); k++) run(1 / 60);
  ok(xb && e2.burn > 0, `turret hit sets burn (${(e2.burn || 0).toFixed(1)})`);
  // 룬 벽 가시
  const w = (s.tile[idx(46, 50)] = T.GRASS, s.G.ver++, t.applyCommand(0, { type: 'build', sid: 'wall', tx: 46, ty: 50 }), s.structs.find(q => q.type === 'wall' && q.x === 46));
  ok(w && t.get().structs.includes(w), 'wall built');
  for (let k = 0; k < 3; k++) { t.setSel(w); t.applyCommand(0, { type: 'upgrade' }); }
  ok(w.lv === 3, 'wall reaches rune tier: lv ' + w.lv);
  // 유물 상자
  const cs = []; for (let i = 0; i < s.tile.length; i++) if (s.tile[i] === T.CACHE) cs.push(i);
  const r1 = { ...s.res }; t.openCache(cs[0] % WW, (cs[0] / WW) | 0); ok(s.res.copper > r1.copper && (s.res.sun > r1.sun || s.res.rune > r1.rune), 'cache gives copper + ruin ore');
  // 저장: 적대 표시와 남쪽 봉인 상태가 남는다
  t.calm(); t.openSeal2(); run(1.2); t.calm(); const hostN = t.get().structs.filter(q => q.hostile).length; t.saveGame();
}

// ===== v24 감사·연계·지형 =====
console.log('\n# v24 감사·연계·지형');
{
  // 원칙: 광물마다 장비(제작)·연구·건물/코어 업그레이드에 모두 쓰인다
  const uses = k => ({ gear: t.RECIPES.some(r => r.cost && r.cost[k]), tech: t.RESEARCH.some(r => r.cost[k]), up: Object.values(t.STRUCTURES).some(D => [D.cost, ...D.lv.map(l => l.up)].some(c => c && c[k])) || Object.values(t.CORE_LV).some(L => L.some(l => l.up && l.up[k])) });
  for (const k of ['wood', 'stone', 'copper', 'crystal', 'iron', 'sun', 'rune', 'meteor', 'pearl']) { const u = uses(k); ok(u.gear && u.tech && u.up, `mineral ${k} used in gear ${u.gear} tech ${u.tech} upgrade ${u.up}`); }
  t.newGame(); let s = t.get(); t.calm();
  const cnt = v => { let n = 0; for (const q of s.tile) if (q === v) n++; return n; };
  if (process.env.DBG) { const W2 = 214, TL = t.TILES, R = { x0: 8, x1: 118, y0: 98, y1: 146 }; let st = -1; for (let y = 100; y < 115 && st < 0; y++) for (let x = 55; x < 72; x++) if (s.tile[idx(x, y)] === T.RUINF) { st = idx(x, y); break; } const m = new Uint8Array(s.tile.length), q = [st]; m[st] = 1; const sg = new Set(s.structs.filter(q2 => !q2.dead).map(q2 => idx(q2.x, q2.y))); while (q.length) { const i = q.pop(), x = i % W2, y = (i / W2) | 0; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const j = idx(x+dx, y+dy); if (m[j] || TL[s.tile[j]].solid || TL[s.tile[j]].pit || sg.has(j)) continue; m[j] = 1; q.push(j); } } const un = []; for (let y = R.y0 + 1; y < R.y1; y++) for (let x = R.x0 + 1; x < R.x1; x++) if ((s.tile[idx(x,y)] === T.RUINF || s.tile[idx(x,y)] === T.WATER) && !sg.has(idx(x,y)) && !m[idx(x,y)]) un.push([x,y]); console.log('UNREACH', un.length, JSON.stringify(un.slice(0,8))); if (un.length) { const [ux, uy] = un[0]; for (let y = uy - 5; y <= uy + 5; y++) { let row = ''; for (let x = ux - 10; x <= ux + 10; x++) { const v = s.tile[idx(x, y)]; row += sg.has(idx(x,y)) ? 'R' : v === T.RUINF ? '.' : v === T.PIT ? 'o' : v === T.RWALL ? '#' : v === T.VAULTF ? 'v' : v === T.CACHE ? 'c' : v === T.STATUE ? 'S' : v === T.WATER ? '~' : TL[v].solid ? 'x' : ','; } console.log(row); } } }
  ok(cnt(T.WATER) > 20 && cnt(T.PIT) > 4 && cnt(T.GLOW) === 0 && cnt(T.RUBBLE) >= 2, `terrain: water ${cnt(T.WATER)} pit ${cnt(T.PIT)} glow ${cnt(T.GLOW)} rubble ${cnt(T.RUBBLE)}`);
  ok(t.pathOK(-1), 'paths ok with terrain');
  // 구덩이: 지상은 막히고 비행·시야는 지난다
  let pit = -1; for (let i = 0; i < s.tile.length; i++) if (s.tile[i] === T.PIT && !t.TILES[s.tile[i - 1]].solid && !t.TILES[s.tile[i + 1]].solid) { pit = i; break; }
  const px = pit % WW, py = (pit / WW) | 0;
  ok(t.blockedTile(px, py, 'g') && !t.blockedTile(px, py, 'f'), 'pit blocks ground, not flyers');
  ok(t.losClear((px - .5) * 16, (py + .5) * 16, (px + 1.5) * 16, (py + .5) * 16) , 'line of sight crosses a pit');
  ok(t.canPlace('wall', px, py) === '물·구덩이 위엔 지을 수 없다', 'cannot build on pit');
  // 유적: 구덩이·기둥이 있어도 모든 바닥이 이어져 있다
  t.openSeal(); run(1.2); t.openSeal2(); run(1.2); t.calm(); s = t.get(); ok(t.pathOK(-1), 'paths ok after seal2 with terrain');
  // 물: 지상 이동 -40%
  let wi = -1; for (let i = 0; i < s.tile.length; i++) if (s.tile[i] === T.WATER && s.tile[i + 1] === T.WATER && s.tile[i - 1] === T.WATER && (i / WW | 0) < 90) { wi = i; break; }
  const speed = () => { s.P.vx = s.P.vy = 0; const x0 = s.P.x; t.applyCommand(0, { type: 'intent', mvx: 1, mvy: 0, mx: s.P.x + 50, my: s.P.y, attack: false, dig: false }); run(.08); const v = Math.abs(s.P.vx); t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: 0, my: 0, attack: false, dig: false }); return v; };
  s.P.alive = true; s.P.x = 42.5 * 16; s.P.y = 53.5 * 16; const vLand = speed();
  s.P.x = ((wi % WW) + .5) * 16; s.P.y = (((wi / WW) | 0) + .5) * 16; const vWater = speed();
  ok(vWater < vLand * .7, `water slows: land ${vLand.toFixed(0)} water ${vWater.toFixed(0)}`);
  // 장비 연계: 룬 갑옷·태양 벼리기(화상)·태양 장화·룬 곡괭이
  t.newGame(); s = t.get(); t.calm(); for (const k in s.res) s.res[k] = 300; s.G.gotCrystal = true; s.P.x = 42.5 * 16; s.P.y = 53.5 * 16;
  for (const id of ['armor1', 'armor2', 'armor3', 'armorR', 'blade1', 'blade2', 'bladeS', 'boots', 'boots2', 'pick2', 'pick3', 'pick4']) t.applyCommand(0, { type: 'craft', id });
  ok(s.P.gear.armor === 3 && s.P.gear.blade === 2 && !s.P.gear.pick4, 'ruin gear locked before ruin ores');
  s.G.gotRuin = true; const hp0 = s.P.max; for (const id of ['armorR', 'bladeS', 'boots2', 'pick4']) t.applyCommand(0, { type: 'craft', id });
  ok(s.P.gear.armor === 4 && s.P.max === hp0 + 4 && s.P.gear.blade === 3 && s.P.gear.boots === 2 && s.P.gear.pick4, 'ruin gear crafted');
  s.G.gotIron = true; t.applyCommand(0, { type: 'craft', id: 'armor4' }); t.applyCommand(0, { type: 'craft', id: 'blade3' }); ok(s.P.gear.armor === 5 && s.P.gear.blade === 5, 'iron gear follows ruin gear');
  const e = t.makeEnemy('golem', s.P.x + 14, s.P.y, true); e.hp = e.max = 999; s.P.cur = 'sword'; t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: e.x, my: e.y, attack: true, dig: false }); run(.2); t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: 0, my: 0, attack: false, dig: false });
  ok(e.burn > 0, 'sun blade sets burn on sword hit');
  // 코어 4단계 (룬 굴착)
  for (const id of ['eco1', 'eco2', 'eco3', 'ecoS']) t.applyCommand(0, { type: 'research', id }); const h = s.cores[0]; t.setSel(h); for (let k = 0; k < 3; k++) t.applyCommand(0, { type: 'upgrade' });
  ok(h.lv === 3 && h.max === 900, 'home core lv4 with sun+rune: lv ' + h.lv);
  // 수치표: 태양 렌즈 사거리 +1 반영, 분당 수입에 둘째 생산물
  for (const id of ['atk1', 'atk2', 'atk3', 'atkS']) t.applyCommand(0, { type: 'research', id });
  ok(t.lvStats(t.STRUCTURES.xbow.lv[0], t.STRUCTURES.xbow).range === 8, 'stat range shows tech bonus');
  s.cores[2].state = 'active'; s.cores[2].connected = true; ok((t.incomeNow().inc.copper || 0) >= 6, 'income counts crystal core copper');
  // 고대 수호 골렘: 묶인 범위 밖이면 회복
  const b = t.makeEnemy('colossus', 63.5 * 16, 118.5 * 16, true); b.home = [b.x, b.y]; b.woke = true; b.hp = 300; s.P.x = b.x + 30 * 16; s.P.y = b.y; run(2);
  ok(b.hp > 300 + 650 * .04 * 1.5, `colossus regenerates out of leash: ${b.hp | 0}`);
}

// ===== v25: 오염된 땅 · 피해 소수 · 부적 Shift · 체크포인트 =====
console.log('\n# v25');
{
  t.newGame(); let s = t.get(); t.calm(); s.P.alive = false; s.P.respawnT = 1e9;
  // blight: no build, faster ground enemies, cleansed in territory
  const hx = s.cores[0].x, hy = s.cores[0].y; const bi = idx(hx + 3, hy + 3); s.tile[bi] = T.BLIGHT; s.G.ver++;
  ok(/오염/.test(t.canPlace('wall', hx + 3, hy + 3) || ''), 'blight blocks building');
  t.recomputeNet(); s = t.get(); ok(s.terrConn[bi], 'blight tile inside home territory');
  t.blightTick(); ok(t.get().tile[bi] === T.GRASS, 'blight inside territory cleansed at dawn tick');
  const far = idx(5, 5); s.tile[far] = T.BLIGHT; t.blightTick(); ok(t.get().tile[far] === T.BLIGHT, 'blight outside territory stays');
  // float damage: level growth changes real damage every level
  const P = s.P; P.lvl = 1; const d1 = t.wDmg(P, 'sword'); P.lvl = 3; const d3 = t.wDmg(P, 'sword'); P.lvl = 1;
  ok(d3 > d1 && d1 % 1 === 0 && d3 % 1 !== 0, `damage not rounded: lv1 ${d1} lv3 ${d3}`);
  ok(t.hitsTo('sword', 2, 'brute') === 13 && t.hitsTo('sword', 3, 'golem') === 34 && t.hitsTo('staff', 3, 'golem') === 12, 'hitsTo with armor (staff ignores)');
  // charm on its own command; dash still works with charm equipped
  P.alive = true; s.G.guardianDown = true; P.bag.push({ id: 'quake', q: 1, uid: 990 }); t.applyCommand(0, { type: 'equip', uid: 990, slot: 'charm' });
  P.dashCD = 0; P.charmCD = 0; t.applyCommand(0, { type: 'intent', mvx: 1, mvy: 0, mx: 0, my: 0, attack: false, dig: false }); t.applyCommand(0, { type: 'dash' });
  ok(P.dash > 0 && P.charmCD === 0, `dash works with charm equipped (dash ${P.dash}, charmCD ${P.charmCD})`);
  t.applyCommand(0, { type: 'charm' }); ok(P.charmCD > 0, 'charm command uses charm');
  // checkpoint: written on dawn after a milestone, restored after home falls
  t.newGame(); s = t.get(); t.calm(); s.P.alive = false; s.P.respawnT = 1e9;
  ok(!t.readCheckpoint(), 'new game clears checkpoint');
  const cyc = 150; s.G.clock = cyc - .5; s.G.night = true; s.G.nights = 1; run(1); s.G.lastSave = -99; t.autoSave(); const cp = t.readCheckpoint();
  ok(cp && cp.label === '첫 새벽' && s.G.cpSig, `checkpoint label ${cp && cp.label}`);
  const woodAt = s.res.wood; s.res.wood += 500; s.cores[0].hp = 1; t.damageCore(s.cores[0], 99);
  s = t.get(); ok(s.G.over === 'lose' && s.G.cpAvail, 'home lost -> checkpoint offered');
  ok(t.restoreCheckpoint() && !t.get().G.over && t.get().res.wood === woodAt, `restored to checkpoint (wood ${t.get().res.wood} vs ${woodAt})`);
  t.get().P.x = -1;
}

// ===== v26: 포탑 역할 · 결계 등불 · 보스 액션 =====
console.log('\n# v26');
{
  t.newGame(); let s = t.get(); t.calm(); s.P.alive = false; s.P.respawnT = 1e9; for (const k in s.res) s.res[k] = 1e4; Object.assign(s.tech, { atk1: 1, atk2: 1, atk3: 1, def1: 1, def2: 1 });
  for (let y = 40; y <= 60; y++) for (let x = 44; x <= 80; x++) s.tile[idx(x, y)] = T.GRASS; s.G.ver++;
  t.applyCommand(0, { type: 'build', sid: 'cturret', tx: 49, ty: 50 }); const ct = s.structs.find(q => q.type === 'cturret'); t.recomputeNet();
  const w = t.makeEnemy('wisp', 53 * 16, 50 * 16, true, true); w.sleep = false; const whp = w.hp; for (let i = 0; i < 90; i++) { ct.cd = 0; w.x = 53 * 16; w.y = 50 * 16; t.step(1 / 60); }
  ok(w.hp === whp, 'crystal turret does not hit fliers');
  t.calm(); t.applyCommand(0, { type: 'build', sid: 'mortar', tx: 47, ty: 46 }); const mo = s.structs.find(q => q.type === 'mortar'); t.recomputeNet();
  const lone = t.makeEnemy('rat', 52 * 16, 46 * 16, true, true); const pack = []; for (let k = 0; k < 4; k++) pack.push(t.makeEnemy('rat', (55 + (k % 2) * .5) * 16, (52 + (k >> 1) * .5) * 16, true, true)); [lone, ...pack].forEach(e => { e.sleep = false; e.vx = e.vy = 0; });
  t.turretFire(mo, t.STRUCTURES.mortar.lv[0], (mo.x + .5) * 16, (mo.y + .5) * 16, 'shell'); const ang = mo.ang, toPack = Math.atan2(52.25 * 16 - (mo.y + .5) * 16, 55.25 * 16 - (mo.x + .5) * 16);
  ok(Math.abs(ang - toPack) < .3, `mortar aims at cluster (ang ${ang.toFixed(2)} vs ${toPack.toFixed(2)})`);
  ok(t.STRUCTURES.xbow.lv[2].pierce === 1 && t.STRUCTURES.mortar.lv[2].field && t.STRUCTURES.cturret.lv[2].mark, 'tier-3 perks defined');
  t.calm(); t.applyCommand(0, { type: 'build', sid: 'xbow', tx: 50, ty: 54 }); const xb = s.structs.find(q => q.type === 'xbow'); t.applyCommand(0, { type: 'build', sid: 'lamp', tx: 51, ty: 54 }); t.recomputeNet();
  ok(s.structs.some(q => q.type === 'lamp'), 'lamp built');
  const hx = t.makeEnemy('hex', 50.5 * 16, 53.5 * 16, true, true); hx.sleep = false; const hh = hx.hp; for (let i = 0; i < 150; i++) { xb.cd = 99; t.step(1 / 60); }
  ok(!(xb.jamT > s.G.clock) && (hx.dead || hx.hp < hh), `lamp: no jam, hex zapped ${hh}->${hx.hp}`);
  const rr = t.makeEnemy('brute', 52 * 16, 55 * 16, true, true); rr.sleep = false; t.step(1 / 60); ok(rr.slow >= .2, 'lamp slows ' + rr.slow + ' lamps ' + JSON.stringify(t.get().G.lamps) + ' dead ' + rr.dead);
  // boss damage rules
  t.calm(); const g = t.makeEnemy('guardian', 70 * 16, 44 * 16, true, true); g.sleep = false;
  const hit = (kind, pl) => { const a = g.hp; t.hurtEnemy(g, 8, kind, pl); return a - g.hp; };
  ok(hit('bolt', false) === 1 && hit('beam', false) === 2 && hit('shell', false) === 2, 'turrets deal 25% to boss');
  ok(hit('beam', true) === 8, 'player full damage to boss');
  g.open = 1; ok(hit('beam', true) === 16, 'opening doubles player damage'); g.open = 0;
  // boss telegraphs and charges into wall -> opening
  s.P.alive = true; s.P.inv = 0; s.P.x = 70 * 16; s.P.y = 50 * 16; g.x = 70 * 16; g.y = 44 * 16; g.bs = { st: 'idle', t: 0, cd: 0, stuck: 0 };
  for (let y = 40; y <= 60; y++) s.tile[idx(70, y)] = T.GRASS; s.tile[idx(70, 52)] = T.STONE; s.G.ver++;
  let sawTele = false, sawOpen = false; for (let i = 0; i < 240; i++) { t.step(1 / 60); s.P.x = 70 * 16; s.P.y = 50 * 16; if (g.bs.st === 'tele') sawTele = true; if (g.open > 0) sawOpen = true; }
  ok(sawTele && sawOpen, `boss telegraph -> charge -> opening (tele ${sawTele}, open ${sawOpen}, st ${g.bs.st})`);
  // night suspended during boss fight
  t.calm(); s.G.finale = { type: 'guardian', boss: g, t: 0, pulse: 0 }; s.G.clock = 104.9; s.G.night = false; s.G.warned = true; s.P.alive = false; run(.5);
  ok(s.G.night && !s.enemies.some(e => !e.dead && e !== g) && t.get().G.finale, 'night waves suspended during boss');
  s.G.finale = null;
}

// ===== v27: 무기 스킬(Q) · 보스 흔들림 =====
console.log('\n# v27');
{
  t.newGame(); let s = t.get(); t.calm(); const P = s.P; P.weapons.xbow = P.weapons.staff = true;
  for (let y = 44; y <= 60; y++) for (let x = 44; x <= 80; x++) s.tile[idx(x, y)] = T.GRASS; s.G.ver++;
  // sword dash: moves ~4 tiles, invulnerable, hits rats on the way
  P.x = 50 * 16; P.y = 52 * 16; P.cur = 'sword'; const rats = [53, 55].map(x => { const e = t.makeEnemy('brute', x * 16, 52 * 16 - 6, true, true); e.sleep = false; return e; });
  t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: 70 * 16, my: 52 * 16 - 6, attack: false, dig: false }); const x0 = P.x; t.applyCommand(0, { type: 'skill' });
  ok(P.inv > 0 && P.skillCD.sword > 0, 'sword skill: invulnerable + cooldown');
  for (let i = 0; i < 20; i++) t.step(1 / 60);
  ok(P.x - x0 > 3 * 16 && rats.every(e => e.hp < e.max), `dash moved ${((P.x - x0) / 16).toFixed(1)} tiles, hit both (${rats.map(e => e.hp | 0)})`);
  const cd0 = P.skillCD.sword; t.applyCommand(0, { type: 'skill' }); ok(P.skillCD.sword <= cd0, 'skill blocked during cooldown');
  // xbow heavy shot pierces all and marks
  t.calm(); P.cur = 'xbow'; P.x = 50 * 16; P.y = 56 * 16; const line = [53, 56, 59].map(x => { const e = t.makeEnemy('brute', x * 16, 56 * 16 - 6, true, true); e.sleep = false; return e; });
  t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: 70 * 16, my: 56 * 16 - 6, attack: false, dig: false }); t.applyCommand(0, { type: 'skill' }); for (let i = 0; i < 30; i++) t.step(1 / 60);
  ok(line.every(e => e.hp < e.max && e.markT > s.G.runT), `heavy bolt pierced+marked ${line.map(e => e.hp | 0)}`);
  // staff field slows and damages ground enemies
  t.calm(); P.cur = 'staff'; const b = t.makeEnemy('brute', 56 * 16, 50 * 16, true, true); b.sleep = false; t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: 56 * 16, my: 50 * 16, attack: false, dig: false }); P.x = 52 * 16; P.y = 50 * 16; t.applyCommand(0, { type: 'skill' }); const bh = b.hp;
  for (let i = 0; i < 70; i++) { t.step(1 / 60); }
  ok(b.hp < bh && t.get().G.pfields.length === 1, `staff field damages ${bh}->${b.hp | 0}`);
  // stagger: player hits fill gauge, full -> 3s opening; turrets do not fill
  t.calm(); const g = t.makeEnemy('guardian', 70 * 16, 46 * 16, true, true); g.sleep = false;
  t.hurtEnemy(g, 20, 'bolt', false); ok(!g.stag, 'turret hits do not fill stagger');
  t.hurtEnemy(g, 10, 'sword', true); ok(Math.abs(g.stag - (10 - 1) * 1.6) < .01, 'sword fills stagger x1.6 ' + g.stag);
  for (let k = 0; k < 60 && !(g.open > 0); k++) t.hurtEnemy(g, 10, 'sword', true);
  ok(g.open >= 2.9 && g.stagUntil > s.G.runT && g.stag === 0, 'stagger -> 3s down');
  const st = g.stag; t.hurtEnemy(g, 10, 'sword', true); ok(g.stag === st, 'no gauge gain while down');
}

// ===== v28: 고산지대 · 추위 · 갈고리 · 유적 개편 · 정화 =====
console.log('\n# v28');
{
  t.newGame(); let s = t.get(); t.calm(); const P = s.P; const HI = { x0: 150, entY: 40 };
  const cnt = v => { let n = 0; for (const q of s.tile) if (q === v) n++; return n; };
  ok(cnt(T.SNOW) + cnt(T.DRIFT) + cnt(T.ICEF) > 2000 && cnt(T.DRIFT) > 50 && cnt(T.METEOR) > 30 && cnt(T.ICEW) > 20 && cnt(T.PINE) > 100, `highland gen snow ${cnt(T.SNOW)} meteor ${cnt(T.METEOR)} ice ${cnt(T.ICEW)} pine ${cnt(T.PINE)}`);
  ok(t.zoneAt(180, 50) === 'high' && t.zoneAt(120, 50) === 'cave', 'highland zone');
  ok(cnt(T.VAULTF) >= 1 && cnt(T.STATUE) >= 3, `ruin vaults ${cnt(T.VAULTF)} statues ${cnt(T.STATUE)}`);
  const hc = s.cores.find(c => c.high); ok(hc && hc.state === 'dormant' && t.pathOK(-1), 'high core dormant, paths ok while ice closed');
  // ice needs torch
  const ix = 148, iy = HI.entY; ok(s.tile[idx(ix, iy)] === T.ICES, 'entrance sealed ice'); t.enterHardmode(); ok(s.tile[idx(ix, iy)] === T.ICEW, 'hardmode cracks the sealed ice');
  P.alive = true; P.x = 145.5 * 16; P.y = (iy + .5) * 16; P.pick2 = true; s.tile[idx(145, iy)] = T.CRYF; s.tile[idx(146, iy)] = T.CRYF;
  const dig = () => { t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: (147 + .5) * 16, my: (iy + .5) * 16, attack: false, dig: true }); run(1.5); t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: 0, my: 0, attack: false, dig: false }); };
  s.tile[idx(147, iy)] = T.ICEW; dig(); ok(s.tile[idx(147, iy)] === T.ICEW, 'ice does not melt without torch');
  P.torch = true; dig(); ok(s.tile[idx(147, iy)] !== T.ICEW, 'torch melts ice');
  // entering highland opens it
  P.x = 152.5 * 16; P.y = (iy + .5) * 16; run(.2); s = t.get(); ok(s.G.highOpen && s.enemies.some(e => e.k === 'frostgiant' && e.sleep) && s.gates.find(g => g.high).open, 'entering highland: open, giant asleep, frost crack open');
  // cold: accumulates outside, slows, hurts; warm in brazier
  t.calm(); P.hp = P.max = 50; P.cold = 0; P.x = 165.5 * 16; P.y = 60.5 * 16; for (let y = 56; y <= 64; y++) for (let x = 160; x <= 172; x++) s.tile[idx(x, y)] = T.SNOW; s.G.ver++;
  run(12); ok(P.cold >= 11, 'cold accumulates outside territory ' + P.cold.toFixed(1));
  const v = () => { P.vx = P.vy = 0; t.applyCommand(0, { type: 'intent', mvx: 1, mvy: 0, mx: P.x + 50, my: P.y, attack: false, dig: false }); run(.3); const sp = Math.abs(P.vx); t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: 0, my: 0, attack: false, dig: false }); P.x = 165.5 * 16; return sp; };
  P.cold = 21; const slow = v(); P.cold = 0; const fast = v(); ok(slow < fast * .6, `cold slows ${slow.toFixed(0)} vs ${fast.toFixed(0)}`);
  P.cold = 25; const hp0 = P.hp; P.inv = 0; run(4.5); ok(P.hp < hp0, `deep cold hurts ${hp0}->${P.hp}`);
  for (const k in s.res) s.res[k] = 100; t.applyCommand(0, { type: 'build', sid: 'brazier', tx: 166, ty: 61 }); ok(s.structs.some(q => q.type === 'brazier' && !q.dead), 'brazier builds outside territory');
  P.cold = 20; run(4); ok(P.cold < 1, 'brazier warms ' + P.cold.toFixed(1));
  P.coat = true; P.cold = 0; P.x = 170.5 * 16; run(4); const cc = P.cold; P.coat = false; P.cold = 0; run(4); ok(cc < P.cold * .7, `coat halves cold ${cc.toFixed(1)} vs ${P.cold.toFixed(1)}`);
  // grapple: dash crosses a 3-tile pit, without it you stay
  t.calm(); for (let y = 56; y <= 64; y++) for (let x = 160; x <= 175; x++) s.tile[idx(x, y)] = T.SNOW; for (let y = 56; y <= 64; y++) for (let x = 166; x <= 168; x++) s.tile[idx(x, y)] = T.CHASM; s.G.ver++;
  const tryDash = () => { P.x = 164.8 * 16; P.y = 60.5 * 16; P.vx = P.vy = 0; P.dashCD = 0; P.dash = 0; t.applyCommand(0, { type: 'intent', mvx: 1, mvy: 0, mx: P.x + 100, my: P.y, attack: false, dig: false }); t.applyCommand(0, { type: 'dash' }); run(.8); t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: 0, my: 0, attack: false, dig: false }); run(.2); return P.x / 16; };
  P.grapple = false; const x1 = tryDash(); P.grapple = true; const x2 = tryDash();
  ok(x1 < 166 && x2 > 169, `grapple crosses chasm (no ${x1.toFixed(1)} / yes ${x2.toFixed(1)})`);
  // giant breath: cone hits + chills
  t.calm(); const g = t.makeEnemy('frostgiant', 170 * 16, 50 * 16, true, true); g.sleep = false; g.home = [g.x, g.y]; g.woke = true; P.x = 166 * 16; P.y = 50 * 16; P.inv = 0; P.dash = 0; P.cold = 0; P.hp = 50;
  for (let y = 46; y <= 54; y++) for (let x = 160; x <= 176; x++) s.tile[idx(x, y)] = T.SNOW; s.G.ver++;
  g.bs = { st: 'tele', kind: 'breath', t: .01, dx: -1, dy: 0, cd: 5, stuck: 0 }; const h1 = P.hp; for (let i = 0; i < 3; i++) t.step(1 / 60);
  ok(P.hp < h1 && P.cold >= 8 && g.open > 0, `breath hit ${h1}->${P.hp}, cold ${P.cold.toFixed(1)}, opening`);
  g.dead = true;
  // relic outpost territory
  t.calm(); t.openSeal2(); run(1.2); t.calm(); const rl = s.structs.find(q => q.type === 'relic'); rl.hostile = false; t.recomputeNet(); ok(t.get().terrConn[idx(rl.x + 2, rl.y)], 'reclaimed relic gives territory');
  // ruin regrow at dawn
  const rb0 = cnt(T.RUBBLE); t.ruinRegrow(); ok(cnt(T.RUBBLE) > rb0, `ruin rubble regrows ${rb0}->${cnt(T.RUBBLE)}`);
  // purification
  for (const gg of s.gates) if (gg.type === 'nest' && gg.y < 50) gg.dead = true; const cn = s.cores.find(c => c.name === '수정 코어 북'); cn.state = 'active'; cn.connected = true; s.G.sealOpen = true; t.checkPurify(); ok(s.G.purified && s.G.purified.n && !s.G.purified.s, 'cave north purified');
  // vault cache gives bonus
  let vc = -1; for (let i = 0; i < s.tile.length; i++) if (s.tile[i] === T.CACHE && [1, -1, WW, -WW].some(d => s.tile[i + d] === T.VAULTF)) { vc = i; break; }
  const sun0 = s.res.sun + s.res.rune; t.openCache(vc % WW, (vc / WW) | 0); ok(vc >= 0 && s.res.sun + s.res.rune >= sun0 + 11, 'vault cache bonus');
  // objective chain mentions torch after ruin core
  for (const c of s.cores) if (!c.high) { c.state = 'active'; c.connected = true; } s.G.colossusDown = true; s.G.seaOpen = true; s.G.leviDown = true; s.G.guardianDown = true; s.G.hard = true; s.G.highOpen = false; P.torch = false; ok(/태양 횃불/.test(t.objective()), 'objective: torch → ' + t.objective());
}

// ===== v29: 진행 단계별 습격 예산 =====
console.log('\n# v29');
{
  t.newGame(); const s = t.get(); t.calm();
  const at = n => { s.G.nights = n; return t.threatN(); };
  ok(at(1) === 1 && at(3) === 3 && at(4) === 4 && at(12) === 4, 'valley: grows 1/night, capped at +3 (night 12 still 4)');
  t.openSeal(); ok(at(13) === 4 && at(14) === 5 && at(30) === 7, 'caves stage: base 4, cap 7');
  s.G.hard = true; ok(at(31) === 12 && at(40) === 15, 'hardmode stage: base 12, cap 15');
}

// ===== v30: 바이옴 순서·사원 미로·동굴 광맥·고산 능선·비행·목표 단계 =====
console.log('\n# v30');
{
  t.newGame(); let s = t.get(); t.calm(); const C = t.CONFIG, A = C.altar;
  const cnt = v => { let n = 0; for (const q of s.tile) if (q === v) n++; return n; };
  ok(s.tile[idx(A.x, A.y)] === T.ALTAR && t.zoneAt(A.x, A.y) === 'ruin' && A.y > 130, 'altar in temple sanctum (deep)');
  const sealYs = []; for (let i = 0; i < s.tile.length; i++) if (s.tile[i] === T.SEAL2) sealYs.push((i / WW) | 0);
  ok(sealYs.length >= 4 && sealYs.every(y => y >= 95 && y <= 97), 'seal2 sits between caves and temple ' + [...new Set(sealYs)]);
  ok(cnt(T.GLOW) === 0 && cnt(T.CARPET) > 10, `no glow mushrooms, carpet ${cnt(T.CARPET)}`);
  // crystal: no big blobs
  { const seen = new Uint8Array(s.tile.length); let maxC = 0, nC = 0; for (let i = 0; i < s.tile.length; i++) { if (s.tile[i] !== T.CRYSTAL || seen[i]) continue; nC++; let sz = 0; const q = [i]; seen[i] = 1; while (q.length) { const j = q.pop(); sz++; for (const d of [1, -1, WW, -WW]) if (s.tile[j + d] === T.CRYSTAL && !seen[j + d]) { seen[j + d] = 1; q.push(j + d); } } maxC = Math.max(maxC, sz); } ok(nC >= 20 && maxC <= 30, `crystal spread: ${nC} veins, biggest ${maxC}`); }
  // highland features
  ok(cnt(T.DRIFT) > 50 && cnt(T.ICES) >= 6, `highland drift ${cnt(T.DRIFT)}, sealed ice ${cnt(T.ICES)}`);
  // flyers over walls
  let rock = -1; for (let i = 0; i < s.tile.length; i++) if (s.tile[i] === T.STONE) { rock = i; break; }
  ok(!t.blockedTile(rock % WW, (rock / WW) | 0, 'f') && t.blockedTile(rock % WW, (rock / WW) | 0, 'g'), 'flyers pass over rock, ground does not');
  const sl = s.tile.findIndex(v => v === T.SEAL); ok(t.blockedTile(sl % WW, (sl / WW) | 0, 'f'), 'flyers stopped by seal');
  const hx = t.makeEnemy('hex', 44 * 16, 40 * 16, true, true); hx.sleep = false; t.applyCommand(0, { type: 'build', sid: 'xbow', tx: 44, ty: 47 }); for (let y = 41; y <= 45; y++) s.tile[idx(44, y)] = T.STONE; s.G.ver++; for (let i = 0; i < 240; i++) t.step(1 / 60);
  ok(hx.dead || Math.abs(hx.y - 47.5 * 16) < 20, `hex flew over wall to turret (y ${(hx.y / 16).toFixed(1)})`);
  // quest order
  t.calm(); for (const q2 of s.structs) if (q2.type === 'xbow') q2.dead = true; s.P.alive = false; s.P.respawnT = 1e9; const P = s.P; const ids = [];
  const q = () => { const c = t.currentQuest(); return c ? c.id : 'none'; };
  const steps = [
    () => { s.G.nights = 1; }, () => { P.keys = 1; }, () => { t.openSeal(); P.keys = 0; },
    () => { for (const c of s.cores) if (!c.ruin && !c.branch && !c.sea) { c.state = 'active'; c.connected = true; } },
    () => { P.keys2 = 1; }, () => { t.openSeal2(); P.keys2 = 0; }, () => { s.G.colossusDown = true; },
    () => { const c = s.cores.find(c2 => c2.ruin); c.state = 'active'; c.connected = true; },
    () => { P.raft = true; }, () => { t.openSea(); }, () => { s.G.leviDown = true; }, () => { const c = s.cores.find(c2 => c2.sea); c.state = 'active'; c.connected = true; },
    () => { P.offer = 1; }, () => { s.G.guardianDown = true; s.G.hard = true; }, () => { P.torch = true; }, () => { s.G.highOpen = true; },
    () => { s.G.giantDown = true; }, () => { const c = s.cores.find(c2 => c2.high); c.state = 'active'; c.connected = true; }, () => { s.G.volcOpen = true; }, () => { P.lantern = true; }, () => { s.G.flameDown = true; }, () => { const c = s.cores.find(c2 => c2.volc); c.state = 'active'; c.connected = true; }, () => { s.G.blightOpen = true; }, () => { s.G.heartsDown = 3; }, () => { s.G.motherDown = true; }, () => { const c = s.cores.find(c2 => c2.blight); c.state = 'active'; c.connected = true; }, () => { P.offer = 2; }, () => { s.G.postGame = true; } ];
  ids.push(q()); for (const f of steps) { f(); run(.05); ids.push(q()); }
  ok(ids.join(',') === 'turret,key,seal,cores,key2,seal2,colossus,ruincore,raft,sea,levi,seacore,offer1,guardian,torch,high,giant,highcore,volc,lantern,flame,volccore,blight,hearts,mother,blightcore,offer2,lord,none', 'quest order ' + ids.join(','));
  // every quest step has text; steps with places have arrows
  ok(t.QUESTS.every(qq => typeof qq.info === 'function'), 'quests have info');
  // altar: guardian ignores high core, lord needs it
  s.G.postGame = false; s.G.hard = false; s.G.guardianDown = false; P.offer = 1; const hc = s.cores.find(c2 => c2.high); hc.state = 'dormant'; hc.connected = false; P.alive = true; P.x = (A.x + 1) * 16; P.y = (A.y + 3) * 16;
  t.useAltar(P); ok(s.G.finale && s.G.finale.type === 'guardian', 'guardian summons without high core'); s.G.finale.boss.dead = true; s.G.finale = null;
  s.G.hard = true; P.offer = 2; t.useAltar(P); ok(!s.G.finale, 'lord needs high core'); hc.state = 'active'; hc.connected = true; t.useAltar(P); ok(s.G.finale && s.G.finale.type === 'lord', 'lord with all cores'); s.G.finale.boss.dead = true; s.G.finale = null;
}

// ===== v31: 사원 지름길(고대 승강석) =====
console.log('\n# v31');
{
  t.newGame(); const s = t.get(); t.calm(); t.openSeal(); t.openSeal2(); t.calm(); const P = s.P; P.alive = true;
  const ps = t.padList(); ok(ps.length === 2 && ps[0][1] < 115 * 16 && ps[1][1] > 130 * 16, 'two pads: entrance & sanctum ' + JSON.stringify(ps.map(q => q.map(v => (v / 16) | 0))));
  P.x = ps[0][0]; P.y = ps[0][1]; t.interact(P); ok(!s.G.padOn && Math.abs(P.y - ps[0][1]) < 2, 'entrance pad cannot wake it');
  P.x = ps[1][0]; P.y = ps[1][1]; t.interact(P); ok(s.G.padOn, 'sanctum pad wakes the pair');
  s.G.warpCD = 0; t.interact(P); ok(Math.abs(P.y - ps[0][1]) < 2 * 16, 'warp sanctum -> entrance');
  s.G.warpCD = 0; P.x = ps[0][0]; P.y = ps[0][1]; t.interact(P); ok(Math.abs(P.y - ps[1][1]) < 2 * 16, 'warp entrance -> sanctum');
}

// ===== v32: 지하 바다 =====
console.log('\n# v32');
{
  t.newGame(); let s = t.get(); t.calm(); const C = t.CONFIG, SE = C.sea, P = s.P;
  const cnt = v => { let n = 0; for (const q of s.tile) if (q === v) n++; return n; };
  ok(t.layerInfo().H === 272 && cnt(T.DEEP) > 3000 && cnt(T.SAND) > 400 && cnt(T.CLAM) > 20 && cnt(T.SEADOOR) >= 6, `sea gen deep ${cnt(T.DEEP)} sand ${cnt(T.SAND)} clam ${cnt(T.CLAM)} door ${cnt(T.SEADOOR)}`);
  ok(t.zoneAt(100, 180) === 'sea', 'sea zone');
  // door opens when colossus falls
  t.openSeal(); run(1.2); t.openSeal2(); run(1.2); t.calm(); const col = t.makeEnemy('colossus', 30 * 16, 140 * 16, true, true); t.hurtEnemy(col, 1e5, 'beam', true); ok(cnt(T.SEADOOR) === 0, 'sea door opens after colossus');
  // deep water: blocked without raft, passable with raft
  let dI = -1; for (let i = 0; i < s.tile.length; i++) if (s.tile[i] === T.DEEP && ((i / WW) | 0) > 165) { dI = i; break; } const dx = dI % WW, dy = (dI / WW) | 0;
  ok(t.blockedTile(dx, dy, 'g') && !t.blockedTile(dx, dy, 'gr') && !t.blockedTile(dx, dy, 'w') && !t.blockedTile(dx, dy, 'f'), 'deep: ground blocked, raft/swim/fly pass');
  ok(t.canPlace('wall', dx, dy) === '물·구덩이 위엔 지을 수 없다', 'cannot build on deep water');
  // enter sea opens it
  P.alive = true; P.x = (SE.x0 + 50) * 16; P.y = (SE.y0 + 3) * 16; run(.2); s = t.get(); ok(s.G.seaOpen && s.enemies.some(e => e.k === 'leviathan') && s.enemies.filter(e => e.k === 'lurker').length >= 6 && s.gates.find(g => g.sea).open, 'entering sea: levi, lurkers, gate');
  ok(t.pathOK(-1), 'paths ok with sea (island core and sea gate excluded)');
  if (!t.pathOK(-1)) { const W2=214, TL=t.TILES; const pass=j=>!(TL[s.tile[j]].solid||TL[s.tile[j]].pit||TL[s.tile[j]].deep); const c = s.cores[0]; const m=new Uint8Array(s.tile.length), q=[]; for (let dy2=-2;dy2<=2;dy2++) for(let dx2=-2;dx2<=2;dx2++){ if(Math.abs(dx2)<2&&Math.abs(dy2)<2) continue; const j=idx(c.x+dx2,c.y+dy2); if(pass(j)){m[j]=1;q.push(j);} } while(q.length){const i=q.pop(),x=i%W2,y=(i/W2)|0; for(const [ex,ey] of [[1,0],[-1,0],[0,1],[0,-1]]){const j=idx(x+ex,y+ey); if(!m[j]&&pass(j)){m[j]=1;q.push(j);}}} console.log('GATES', s.gates.filter(g=>!g.dead&&g.open).map(g=>(g.ruin?'R':g.high?'H':g.sea?'S':g.type[0])+'@'+g.x+','+g.y+':'+(m[idx(g.x,g.y)]?1:0)).join(' ')); }
  // lurker bites player on raft
  t.calm(); P.raft = true; P.hp = P.max = 50; P.inv = 0; for (let y = dy - 3; y <= dy + 3; y++) for (let x = dx - 6; x <= dx + 6; x++) s.tile[idx(x, y)] = T.DEEP; s.G.ver++; P.x = (dx + .5) * 16; P.y = (dy + .5) * 16; const lu = t.makeEnemy('lurker', (dx + 4.5) * 16, (dy + .5) * 16, true, true);
  for (let i = 0; i < 180; i++) { P.inv = Math.min(P.inv, .1); t.step(1 / 60); } ok(P.hp < 50, 'lurker bites raft player ' + P.hp);
  // leviathan: immune under water, telegraph -> opening
  t.calm(); const lv = t.makeEnemy('leviathan', (dx + 3.5) * 16, (dy + .5) * 16, true, true); lv.sleep = false; lv.home = [lv.x, lv.y]; lv.under = true; const h0 = lv.hp; t.hurtEnemy(lv, 50, 'sword', true); ok(lv.hp === h0, 'levi immune under water');
  let tele = false, open = false; P.hp = 50; for (let i = 0; i < 60 * 6; i++) { t.step(1 / 60); P.x = (dx + .5) * 16; P.y = (dy + .5) * 16; P.hp = Math.max(P.hp, 10); if (lv.ls && lv.ls.st === 'tele') tele = true; if (lv.open > 0) open = true; }
  ok(tele && open, `levi telegraph (${tele}) -> opening (${open})`); lv.open = 1; lv.under = false; t.hurtEnemy(lv, 50, 'beam', true); ok(lv.hp < h0, 'levi hit when surfaced');
  lv.hp = 1; lv.under = false; t.hurtEnemy(lv, 10, 'beam', true); ok(t.get().G.leviDown && t.get().res.pearl >= 12, 'levi down -> pearls');
}

// ===== v33: 화산 균열 · 오염지 · 세 갈래 =====
console.log('\n# v33');
{
  t.newGame(); let s = t.get(); t.calm(); const C = t.CONFIG, V = C.volc, B = C.blight, P = s.P, TL = t.TILES;
  const cnt = v => { let n = 0; for (const q of s.tile) if (q === v) n++; return n; };
  const zc = (v, z) => { let n = 0; for (let i = 0; i < s.tile.length; i++) if (s.tile[i] === v && t.zoneAt(i % WW, (i / WW) | 0) === z) n++; return n; };
  ok(cnt(T.LAVA) > 300 && cnt(T.OBSID) > 15 && cnt(T.BLIGHTC) > 15 && cnt(T.HSEAL) === 18 && zc(T.BLIGHT, 'blight') > 800, `branch gen lava ${cnt(T.LAVA)} obsid ${cnt(T.OBSID)} blightc ${cnt(T.BLIGHTC)} hseal ${cnt(T.HSEAL)} blight ${zc(T.BLIGHT, 'blight')}`);
  ok(t.zoneAt(50, 240) === 'volc' && t.zoneAt(160, 240) === 'blight' && t.zoneAt(50, 190) === 'sea', 'zones volc/blight/sea');
  const flood = (sx, sy, pass) => { const m = new Uint8Array(s.tile.length), q = [idx(sx, sy)]; m[q[0]] = 1; while (q.length) { const i = q.pop(), x = i % WW, y = (i / WW) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = idx(x + dx, y + dy); if (!m[j] && pass(s.tile[j])) { m[j] = 1; q.push(j); } } } return m; };
  const mv = flood(V.ent, V.y0 + 2, q => !TL[q].solid && !TL[q].lava);
  ok(mv[idx(V.gate[0], V.gate[1])] && !mv[idx(V.core[0], V.core[1] + 2)], 'volc: gate reachable on foot, core island only across lava');
  const ml = flood(V.ent, V.y0 + 2, q => !TL[q].solid);
  ok(ml[idx(V.core[0], V.core[1] + 2)], 'volc: core reachable once lava is cooled');
  const mb = flood(B.ent, B.y0 + 2, q => !TL[q].solid);
  ok(mb[idx(B.gate[0], B.gate[1])] && mb[idx(B.core[0], B.core[1] - 5)] && B.hearts.every(([x, y]) => mb[idx(x, y + 2)]), 'blight: gate, hearts, core reachable');
  ok(s.tile[idx(V.ent, C.sea.y1 - 8)] === T.SAND && s.tile[idx(B.ent, C.sea.y1 - 8)] === T.SAND, 'stairs start on sea sand');
  const hs = s.tile.findIndex(v => v === T.HSEAL); ok(t.blockedTile(hs % WW, (hs / WW) | 0, 'g') && t.blockedTile(hs % WW, (hs / WW) | 0, 'f'), 'sealed rock blocks walkers and flyers');
  let lv = -1; for (let i = 0; i < s.tile.length; i++) if (s.tile[i] === T.LAVA && t.zoneAt(i % WW, (i / WW) | 0) === 'volc') { lv = i; break; } const lx = lv % WW, ly = (lv / WW) | 0;
  ok(t.blockedTile(lx, ly, 'g') && t.blockedTile(lx, ly, 'gr') && t.blockedTile(lx, ly, 'w') && !t.blockedTile(lx, ly, 'f') && !!t.canPlace('wall', lx, ly), 'lava: blocks ground/raft/swim, not fly, no building');
  // hardmode cracks the sealed rock
  t.enterHardmode(); ok(cnt(T.HSEAL) === 0 && s.tile[hs] === T.VROCK, 'hardmode turns sealed rock to diggable rock');
  // entering volcano
  t.calm(); P.alive = true; P.hp = P.max = 60; P.x = (V.ent + .5) * 16; P.y = (V.y0 + 2.5) * 16; run(.1); s = t.get();
  ok(s.G.volcOpen && s.enemies.some(e => e.k === 'flamegiant' && e.sleep) && s.enemies.filter(e => e.k === 'salamander').length >= 5 && s.gates.find(g => g.volc).open && t.threatStage() === 5, 'entering volcano: giant asleep, salamanders, gate, threat stage 5');
  const q1 = t.branchInfo(); ok(q1 && q1.id === 'lantern' && q1.text.startsWith('화산 갈래'), 'quest follows the branch you stand in: ' + (q1 && q1.text));
  // lantern cools lava ahead
  t.calm(); for (let y = 240; y <= 244; y++) for (let x = 40; x <= 50; x++) s.tile[idx(x, y)] = x >= 45 ? T.LAVA : T.BASALT; s.G.ver++; P.lantern = true; P.x = 44.5 * 16; P.y = 242.5 * 16; t.applyCommand(0, { type: 'intent', mvx: 1, mvy: 0, mx: P.x + 50, my: P.y, attack: false, dig: false }); run(1.5);
  ok(s.tile[idx(45, 242)] === T.CRUST && P.x > 45.5 * 16, `lantern cools lava into a path (x ${(P.x / 16).toFixed(1)})`);
  t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: P.x, my: P.y, attack: false, dig: false });
  // eruptions outside territory, none inside
  t.calm(); P.x = 30.5 * 16; P.y = 235.5 * 16; s.G.eruptT = .01; P.hp = 60; run(.05); const nb = (s.G.bombs || []).length; ok(nb >= 3, 'eruption drops bombs outside territory ' + nb);
  s.G.bombs = []; P.inv = 0; const hp0 = P.hp; t.addBomb(P.x, P.y, .05, 20, 2, 10, '#f80'); run(.2); ok(P.hp === hp0 - 2, `bomb hits for 2 (${hp0} -> ${P.hp})`);
  P.gear.armor = 6; P.inv = 0; const hp1 = P.hp; t.addBomb(P.x, P.y, .05, 20, 2, 10, '#f80'); run(.2); ok(P.hp === hp1 - 1, 'obsidian armor halves bomb damage');
  // giant erupt telegraph -> bombs -> opening
  t.calm(); s.G.bombs = []; P.hp = 60; for (let y = 228; y <= 246; y++) for (let x = 20; x <= 50; x++) s.tile[idx(x, y)] = T.BASALT; s.G.ver++; P.x = 30.5 * 16; P.y = 237.5 * 16; const fg = t.makeEnemy('flamegiant', P.x + 5 * 16, P.y, true, true); fg.sleep = false; fg.home = [fg.x, fg.y]; let er = false, op = false; for (let i = 0; i < 60 * 12; i++) { if (fg.bs && fg.bs.st === 'idle' && !(fg.open > 0)) { fg.x = P.x + 5 * 16; fg.y = P.y; } t.step(1 / 60); P.x = 30.5 * 16; P.y = 237.5 * 16; P.vx = P.vy = 0; P.hp = Math.max(P.hp, 20); if (fg.bs && fg.bs.st === 'tele') (s.kd = s.kd || {})[fg.bs.kind] = 1; if (fg.bs && fg.bs.kind === 'erupt' && (t.get().G.bombs || []).length) er = true; if (fg.open > 0) op = true; }
  ok(er && op, `flame giant erupt (${er}) -> opening (${op}) ${JSON.stringify(s.kd)} d ${((fg.x - P.x) / 16).toFixed(1)}`); fg.hp = 1; t.hurtEnemy(fg, 50, 'beam', true); ok(s.G.flameDown && s.res.obsid >= 12, 'flame giant down -> obsidian');
  // blight: entering, hearts, cocoon
  t.calm(); s.G.bombs = []; P.x = (B.ent + .5) * 16; P.y = (B.y0 + 2.5) * 16; run(.1);
  s = t.get(); ok(s.G.blightOpen && s.enemies.filter(e => e.k === 'heart').length === 3 && s.enemies.some(e => e.k === 'mother' && e.sleep), 'entering blight: 3 hearts, mother cocooned');
  const mo = s.enemies.find(e => e.k === 'mother'), mh = mo.hp; t.hurtEnemy(mo, 100, 'beam', true); ok(mo.hp === mh && mo.sleep, 'mother immune while hearts live');
  const core = s.cores.find(c => c.blight); ok(/심장/.test(t.coreLock ? t.coreLock(core) : '심장'), 'blight core lock names hearts');
  // corrosion on blight tiles outside territory, cloak protects
  const clr = () => { for (const e of t.get().enemies) if (e.k !== 'heart' && e.k !== 'mother') e.dead = true; }; clr(); for (let y = 230; y <= 234; y++) for (let x = 140; x <= 146; x++) s.tile[idx(x, y)] = T.BLIGHT; s.G.ver++; P.x = 143.5 * 16; P.y = 232.5 * 16; P.hp = 30; P.inv = 0; run(3); ok(P.hp < 30, 'corrosion on blighted ground ' + P.hp);
  P.cloak = true; P.hp = 30; clr(); run(3); ok(P.hp === 30, 'cleansing cloak stops corrosion'); P.cloak = false;
  // territory pushes blight back
  const tc = idx(143, 232); s.terrConn ? 0 : 0; const lay = t.abyssLayer(); t.recomputeNet(); 
  const hearts = t.get().enemies.filter(e => e.k === 'heart'); for (const h of hearts) t.hurtEnemy(h, 1e5, 'beam', true);
  ok(t.heartsLeft() === 0 && s.G.heartsDown === 3 && s.res.blightc > 0, 'three hearts down');
  for (let i = 0; i < 60 * 8 && mo.sleep; i++) { P.x = mo.x; P.y = mo.y + 40; t.step(1 / 60); } ok(!mo.sleep, 'mother wakes once hearts are gone');
  const mh2 = mo.hp; t.hurtEnemy(mo, 30, 'beam', true); ok(mo.hp < mh2, 'mother hurtable after hearts'); mo.hp = 1; t.hurtEnemy(mo, 30, 'beam', true); ok(s.G.motherDown, 'mother down');
  // altar + offer2
  const R2 = t.RECIPES.find(r => r.id === 'offer2'); ok(R2.cost.obsid > 0 && R2.cost.blightc > 0 && R2.cost.meteor > 0, 'core of the seal needs all three branch minerals');
  s.G.postGame = false; s.G.finale = null; for (const c of s.cores) { c.state = 'active'; c.connected = true; } const vc = s.cores.find(c => c.volc); vc.state = 'dormant'; vc.connected = false; P.offer = 2; P.x = (C.altar.x + 1) * 16; P.y = (C.altar.y + 3) * 16;
  ok(/세 갈래/.test(t.altarHint(P)), 'altar asks for branch cores: ' + t.altarHint(P)); vc.state = 'active'; vc.connected = true; ok(t.altarHint(P).startsWith('E'), 'altar ready with all three');
  for (const c of s.cores) if (!c.home && !c.volc && !c.blight) { c.state = 'dormant'; c.connected = false; } ok(t.pathOK(-1), 'paths ok with branch cores (lava island excluded)');
  // save / load keeps branch flags
  t.calm(); t.saveGame(); const saved = localStorage.getItem('beyond-the-seal-save'); t.newGame(); localStorage.setItem('beyond-the-seal-save', saved); t.loadGame(); s = t.get(); // 뒤쪽 boot()가 저장소를 갈아 끼우므로 전역 localStorage를 쓴다
  ok(s.G.volcOpen && s.G.blightOpen && s.G.flameDown && s.G.motherDown && s.G.heartsDown === 3 && t.layerInfo().H === 272, 'save/load keeps branch progress');
}

// ===== v34: 피드백 묶음 =====
console.log('\n# v34');
{
  t.newGame(); let s = t.get(); t.calm(); const P = s.P;
  ok(t.jo('코어', '을') === '코어를' && t.jo('바다 코어', '이') === '바다 코어가' && t.jo('고대 수호 골렘', '이') === '고대 수호 골렘이' && t.jo('본거지', '으로') === '본거지로' && t.jo('산정 코어', '와') === '산정 코어와' && t.jo('룬석 4', '이') === '룬석 4가' && t.jo('본관', '으로') === '본관으로' && t.jo('서울', '으로') === '서울로', 'josa helper');
  ok(t.cleanNum('-11.000000001') === '-11' && t.cleanNum('공격 1.7발/초') === '공격 1.7발/초' && t.cleanNum(0.30000000004) === 0.3 && t.fN(5.5) === 6, 'damage integer, float tails trimmed, rates keep one decimal');
  let cl = 0; for (const v of s.tile) if (v === T.CLIFF) cl++; ok(cl > 40 && t.pathOK(-1), 'plains cliffs prototype ' + cl + ', paths ok');
  // recall
  const hx = s.cores[0].x, hy = s.cores[0].y; for (let x = hx; x <= hx + 30; x++) for (let y = hy - 1; y <= hy + 1; y++) s.tile[idx(x, y)] = T.GRASS; s.G.ver++;
  P.alive = true; P.x = (hx + 25) * 16; P.y = hy * 16; P.recallCD = 0; t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: P.x, my: P.y, attack: false, dig: false }); t.startRecall(P); run(1); ok(P.recallT > 0, 'recall channels');
  run(2); ok(Math.hypot(P.x - (hx + .5) * 16, P.y - (hy + .5) * 16) < 8 * 16 && P.recallCD > 50, 'recall returns home and starts cooldown');
  P.recallCD = 0; P.x = (hx + 25) * 16; t.startRecall(P); run(.5); P.inv = 0; P.dash = 0; t.makeEnemy; const hp0 = P.hp; s.G.bombs = []; t.addBomb(P.x, P.y, .05, 20, 1, 0, '#f80'); run(.3); ok(!(P.recallT > 0) && P.x > (hx + 20) * 16, 'getting hit cancels recall');
  s.G.finale = { type: 'guardian', t: 0, pulse: 0 }; P.recallCD = 0; t.startRecall(P); ok(!(P.recallT > 0), 'no recall during boss fight'); s.G.finale = null;
  // flyer routes around bedrock to its turret
  t.calm(); s = t.get(); for (let y = 34; y <= 46; y++) for (let x = 30; x <= 54; x++) s.tile[idx(x, y)] = T.GRASS; for (let x = 32; x <= 50; x++) s.tile[idx(x, 42)] = T.BEDROCK; s.G.ver++;
  for (const q of s.structs) if (q.D.turret) q.dead = true; for (const k in s.res) s.res[k] = 999; t.applyCommand(0, { type: 'build', sid: 'xbow', tx: 42, ty: 45 }); s = t.get(); const tur = s.structs.find(q => q.type === 'xbow' && !q.dead);
  const hx2 = t.makeEnemy('hex', 42.5 * 16, 37.5 * 16, true, true); hx2.sleep = false; P.x = 999 * 16; for (let i = 0; i < 60 * 10 && !hx2.att; i++) t.step(1 / 60);
  ok(tur && hx2.att === tur, `hex goes around bedrock to the turret (${(hx2.x / 16).toFixed(1)},${(hx2.y / 16).toFixed(1)}) att ${hx2.att && hx2.att.type + "@" + hx2.att.x + "," + hx2.att.y} tur ${tur && tur.x + "," + tur.y}`);
}

// ===== v35: 정수 표기 · 자원 밸런스(생산 축소 · 정제기) =====
console.log('\n# v35');
{
  t.newGame(); let s = t.get(); t.calm(); const P = s.P; for (const k in s.res) s.res[k] = 0;
  ok(t.CORE_LV.home.map(l => l.prod).join() === '1,2,2,3' && t.CORE_LV.other.map(l => l.prod).join() === '1,1,2,2', 'core production steps trimmed');
  ok(t.canPlace('drill', s.cores[0].x + 4, s.cores[0].y) === '더는 지을 수 없는 건물', 'refinery removed from building');
}

// ===== v36: 월드 슬롯 =====
console.log('\n# v36');
{
  for (let n = 0; n < 5; n++) { localStorage.removeItem(n ? 'beyond-the-seal-save-' + n : 'beyond-the-seal-save'); }
  t.setSlot(0); t.newGame(); let s = t.get(); s.res.wood = 777; s.G.nights = 3; t.saveGame(); const seed0 = t.slotInfo(0).seed;
  ok(t.slotInfo(0) && t.slotInfo(0).nights === 3 && !t.slotInfo(1), 'slot 0 saved, slot 1 empty');
  t.newSlot(1); s = t.get(); ok(t.slotNow() === 1 && s.res.wood !== 777 && t.slotInfo(1) && t.slotInfo(1).seed !== seed0, 'new world in slot 1 (fresh map)');
  s.res.wood = 555; t.saveGame(); t.pickSlot(0); s = t.get(); ok(t.slotNow() === 0 && s.res.wood === 777, 'switching back loads slot 0');
  t.pickSlot(1); ok(t.get().res.wood === 555, 'slot 1 kept its own progress');
  t.openSlots(); ok(!!t.uiSlots() && t.uiSlots().info.filter(Boolean).length === 2, 'world select lists two worlds'); const nt = t.get().G.runT; t.step(1 / 60); t.step(1 / 60); ok(t.get().G.runT === nt, 'game paused on world select'); t.closeSlots();
  t.deleteSlot(0); ok(!t.slotInfo(0) && t.slotNow() === 1, 'delete other slot');
  t.setSlot(0); t.newGame();
}

// ===== v40: 연결망 제거 · 전진기지 습격 · 함락 =====
console.log('\n# v40');
{
  t.newGame(); let s = t.get(); t.calm(); for (const k in s.res) s.res[k] = 999; s.tech.def1 = true;
  const H0 = s.cores[0], hx = H0.x, hy = H0.y;
  for (let x = hx; x <= hx + 20; x++) for (let y = hy - 2; y <= hy + 2; y++) s.tile[idx(x, y)] = T.GRASS; s.G.ver++;
  ok(/영역/.test(t.canPlace('pylon', hx + 20, hy) || ''), 'pylon only inside base territory');
  t.applyCommand(0, { type: 'build', sid: 'pylon', tx: hx + 10, ty: hy }); t.recomputeNet(); t.applyCommand(0, { type: 'build', sid: 'pylon', tx: hx + 13, ty: hy }); t.recomputeNet(); s = t.get();
  const pls = s.structs.filter(q => q.type === 'pylon' && !q.dead); ok(pls.length === 2 && pls.every(q => q.connected) && s.terrConn[idx(hx + 15, hy)], 'pylons at the edge extend the base step by step');
  // forward core: active = connected, produces without wires
  const fc = s.cores.find(c => !c.home && !c.beyond && !c.ruin && !c.branch && !c.sea); fc.state = 'active'; fc.hp = fc.max; t.recomputeNet(); ok(fc.connected, 'woken forward core is its own base (no wiring)');
  const before = s.res[fc.prod]; s.G.prodT = 999; t.step(1 / 60); ok(s.res[fc.prod] > before, 'forward core produces right away');
  // raid target + raids
  t.calm(); s = t.get(); const cav = s.cores.find(c => c.beyond); cav.state = 'active'; cav.hp = cav.max; t.recomputeNet(); t.openSeal(); run(1.2); t.calm();
  t.applyCommand(0, { type: 'build', sid: 'xbow', tx: fc.x + 2, ty: fc.y + 2 }); t.recomputeNet();
  s.G.raidTarget = -1; t.pickRaidTarget(); ok(s.G.raidTarget === cav.k || s.G.raidTarget === fc.k, 'dusk picks a forward base as main target');
  s.G.raidTarget = cav.k; const sq0 = t.spawnQLen(); t.spawnRaids(6); const raidQ = t.spawnQList().filter(q => q.g.raidK !== undefined);
  const onMain = raidQ.filter(q => q.g.raidK === cav.k).length, onOther = raidQ.filter(q => q.g.raidK === fc.k).length; ok(onMain > onOther && onOther > 0, `raids per base, main target heavier (${onMain} vs ${onOther})`);
  for (let i = 0; i < 60 * 3; i++) t.step(1 / 60); s = t.get(); const re = s.enemies.filter(e => !e.dead && e.rk === cav.k); ok(re.length > 0, 'raid enemies tagged to their base ' + re.length);
  // fall: buildings inside become ruins and stay down until re-woken
  t.calm(); s = t.get(); t.applyCommand(0, { type: 'build', sid: 'wall', tx: fc.x + 3, ty: fc.y - 2 }); const wn = s.structs.filter(q => !q.dead && Math.hypot(q.x - fc.x, q.y - fc.y) <= fc.r).length;
  t.damageCore(fc, 1e9); s = t.get(); ok(fc.state !== 'active' && s.G.ruins.filter(r => r.lostK === fc.k).length >= wn && wn >= 2, `fallen base: ${wn} buildings -> ruins`);
  t.restoreRuins(); s = t.get(); ok(!s.structs.some(q => !q.dead && Math.hypot(q.x - fc.x, q.y - fc.y) <= 3), 'dawn repair skips the fallen base');
  fc.state = 'active'; fc.hp = fc.max; t.recomputeNet(); t.restoreRuins(); s = t.get(); ok(s.structs.some(q => !q.dead && q.type === 'xbow' && Math.hypot(q.x - fc.x, q.y - fc.y) <= 4), 're-woken base can be repaired');
}

// ===== v41: 프리팹 입체 구조물 · 화석 협곡 · 지역 이름 카드 =====
console.log('\n# v41');
{
  const C = t.CONFIG, K = C.canyon;
  ok(Object.keys(t.PREFABS).every(id => t.prefabErrors(id).length === 0), 'every prefab passes its own grammar check (ledges fenced by cliffs, stairs one level apart)');
  ok(t.pfShape(['12', '..'], 1, false).map(r => r.join('')).join('|') === '.1|.2' && t.pfShape(['12'], 0, true)[0].join('') === '21', 'prefab rotate / mirror');
  t.newGame(); let s = t.get(); t.calm();
  const pl = t.prefabsPlaced(); ok(pl.surf.length >= 3 && pl.surf.some(a => a[0].startsWith('hill')), 'plains prefabs placed: ' + pl.surf.map(a => a[0]).join(','));
  ok(pl.canyon.length >= 3 && pl.canyon.some(a => a[0] === 'mesa'), 'canyon prefabs placed: ' + pl.canyon.map(a => a[0]).join(','));
  let cl = 0, hi = 0, st = 0; for (const v of s.tile) { if (v === T.CLIFF) cl++; if (v === T.LEDGE || v === T.LEDGE2) hi++; if (v === T.STAIR) st++; } ok(cl > 40 && hi > 40 && st >= 4 && t.pathOK(-1), `cliffs ${cl}, ledge ${hi}, stairs ${st}, paths ok`);
  // 평원 단 위 칸은 전부 본거지에서 걸어서 닿는다(계단으로)
  const hm = t.pfReach((x, y) => x >= 0 && y >= 0 && x < WW && y < 100, C.surface.cx, C.surface.cy + 2); let lost = 0; for (let y = 0; y < 100; y++) for (let x = 0; x < 100; x++) { const v = s.tile[idx(x, y)]; if ((v === T.LEDGE || v === T.LEDGE2 || v === T.STAIR) && !hm[idx(x, y)]) lost++; } ok(lost === 0, 'every plains ledge reachable by stairs, unreachable ' + lost);
  // 절벽 높이: 2층 단 옆 절벽은 2, 앞면은 아래가 낮을 때만
  { let ok2 = false; for (let i = 0; i < s.tile.length && !ok2; i++) if (s.tile[i] === T.LEDGE2) { const x = i % WW, y = (i / WW) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (s.tile[idx(x + dx, y + dy)] === T.CLIFF && t.cliffLv(x + dx, y + dy) === 2) ok2 = true; } ok(ok2 && t.lvAt(C.surface.cx, C.surface.cy) === 0, 'cliff height follows the ledge it fences'); }
  // 협곡: 구역·입구 굴·잠긴 코어
  ok(t.zoneAt(K.core[0], K.core[1]) === 'canyon' && t.zoneAt(60, 120) === 'ruin', 'canyon zone east of the temple');
  const sed = []; for (let x = C.ruins.x1; x <= K.x0 + 1; x++) sed.push(s.tile[idx(x, K.entY)]); ok(sed.filter(v => v === T.SEDW).length >= 3 && t.TILES[T.SEDW].pick3, 'entrance tunnel sealed by hardened sediment (crystal pickaxe)');
  const cc = s.cores.find(c => c.canyon); ok(cc && cc.optional && !t.baseCores().includes(cc) && t.coreLock(cc) && /거룡/.test(t.coreLock(cc)), 'canyon core is optional and held by the wyrm');
  // 협곡 안쪽은 굴 끝에서 코어·균열까지 걸어서 닿는다
  const inC = (x, y) => x > K.x0 && x < K.x1 && y > K.y0 && y < K.y1; const cm = t.pfReach(inC, K.x0 + 2, K.entY); ok(cm[idx(K.core[0], K.core[1] + 2)] && cm[idx(K.gate[0], K.gate[1])], 'canyon walkable from tunnel to core and crack');
  // 수정 곡괭이 없이는 퇴적층을 못 캔다
  { const P = s.P; P.alive = true; P.gear.pick3 = 0; const sx = C.ruins.x1 + 1; P.x = (sx - 1.5) * 16; P.y = (K.entY + .5) * 16; t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: (sx + .5) * 16, my: (K.entY + .5) * 16, attack: false, dig: true }); run(2); ok(s.tile[idx(sx, K.entY)] === T.SEDW, 'sediment needs crystal pickaxe');
    P.gear.pick3 = 1; run(4); ok(s.tile[idx(sx, K.entY)] !== T.SEDW, 'crystal pickaxe digs the sediment'); t.applyCommand(0, { type: 'intent', mvx: 0, mvy: 0, mx: 0, my: 0, attack: false, dig: false }); }
  // 걸어 들어가면 열린다: 거룡·균열·목표 줄
  s.P.x = (K.x0 + 4) * 16; s.P.y = (K.entY + .5) * 16; run(.2); s = t.get();
  ok(s.G.canyonOpen && s.enemies.some(e => e.k === 'wyrm' && e.sleep) && s.gates.some(g => g.canyon && g.open), 'entering opens the canyon: sleeping wyrm, crack open');
  ok(/화석 협곡 \(선택\)/.test(t.objective()), 'objective shows canyon steps inside: ' + t.objective());
  { t.openSeal(); run(2); t.openSeal2(); run(2); t.calm(); s = t.get(); for (let i = 0; i < s.tile.length; i++) if (s.tile[i] === T.SEDW) s.tile[i] = T.RUINF; s.G.ver++; ok(t.pathOK(-1), 'paths ok after canyon opens (temple open, tunnel dug)'); }
  // 밤 물길
  s.G.flood = true; const wi = s.tile.findIndex(v => v === T.WASH); ok(wi > 0 && t.wetAt(wi), 'dry riverbed floods at night'); s.G.flood = false; ok(!t.wetAt(wi), 'and is dry by day');
  t.calm(); s = t.get(); s.G.clock = 105 + 5; s.G.night = true; t.step(1 / 60); ok(s.G.flood, 'flood flag set while it is night'); s.G.clock = 0; s.G.night = false; t.step(1 / 60);
  // 고지대 포탑: 단 위면 사거리 +1
  { t.calm(); s = t.get(); const hy = C.surface.cy + 9, lx = C.surface.cx - 12, ly = hy, gx = C.surface.cx - 12, gy = hy + 2; for (let y = hy - 1; y <= hy + 3; y++) for (let x = lx - 1; x <= lx + 12; x++) s.tile[idx(x, y)] = T.GRASS; s.tile[idx(lx, ly)] = T.LEDGE; s.G.ver++;
    const L = t.STRUCTURES.xbow.lv[0], D = t.STRUCTURES.xbow, shoot = (x, y) => { t.calm(); const e = t.makeEnemy('rat', (x + .5) * 16 + (L.range + .5) * 16, (y + .5) * 16); e.sleep = false; const r = t.turretFire({ D, x, y, cd: 0 }, L, (x + .5) * 16, (y + .5) * 16, 'bolt'); e.dead = true; return !!r; };
    ok(shoot(lx, ly) && !shoot(gx, gy), 'turret on a ledge reaches 1 tile farther'); }
  // 거룡: 솟는 뼈 · 처치 · 코어
  { t.calm(); s = t.get(); const b = t.makeEnemy('wyrm', (K.core[0] + .5) * 16, (K.core[1] - 4) * 16, true); s.P.x = b.x - 60; s.P.y = b.y + 10; s.P.alive = true; const n0 = (s.G.bombs || []).length; t.boneSpikes(b, 1, false); const n1 = (s.G.bombs || []).length; t.boneSpikes(b, 1, true); const n2 = (s.G.bombs || []).length;
    ok(n1 > n0 && n2 - n1 > n1 - n0, `bone spikes telegraph a line (${n1 - n0}), three lines at half hp (${n2 - n1})`);
    b.hp = 1; t.hurtEnemy(b, 50, 'sword', true); run(.2); s = t.get(); ok(s.G.wyrmDown && s.res.fossil >= 12 && s.G.gotFossil && !t.coreLock(cc), 'wyrm down: fossils, core released'); }
  // 협곡 장비·연구
  { s = t.get(); for (const k in s.res) s.res[k] = 999; const m0 = s.P.max; s.P.x = (C.surface.cx + .5) * 16; s.P.y = (C.surface.cy + 2) * 16; t.applyCommand(0, { type: 'craft', id: 'bonemail' }); t.applyCommand(0, { type: 'craft', id: 'amberscope' }); s = t.get();
    ok(s.P.bonemail && s.P.max === m0 + 3 && s.P.amberscope && t.accMods(s.P).xbowRange >= .25, 'fossil pauldron and amber scope'); t.applyCommand(0, { type: 'research', id: 'defH' }); ok(s.tech.defH, 'high-ground research unlocks with fossils');
    const hx = C.surface.cx, hy = C.surface.cy + 4; s.tile[idx(hx + 3, hy)] = T.GRASS; s.G.ver++; t.recomputeNet(); t.applyCommand(0, { type: 'build', sid: 'wall', tx: hx + 3, ty: hy }); const w = t.get().structs.find(q => q.type === 'wall' && q.x === hx + 3 && q.y === hy);
    let drew = true; if (w) { w.lv = 4; try { t.drawStruct(w); t.draw(); } catch (e) { drew = false; console.log(e.stack); } } ok(w && drew && t.STRUCTURES.wall.lv[4].tech === 'defH', 'fossil-frame wall (wall lv5) draws');
    const f0 = s.res.fossil; t.openCache(K.core[0], K.core[1] + 6); ok(s.res.fossil > f0, 'canyon caches hold fossils and amber'); }
  // 지역 이름 카드
  { t.calm(); s = t.get(); s.G.zSeen = {}; s.G.zNow = null; s.G.card = null; s.P.alive = true; s.P.x = (C.surface.cx + .5) * 16; s.P.y = (C.surface.cy + 3) * 16; run(1); ok(s.G.card && s.G.card.z === 'surface' && s.G.card.big, 'first visit: big region card');
    s.P.x = (C.beyond.x0 + 6) * 16; s.P.y = 50 * 16; s.G.card = null; t.regionTick(.3); ok(!s.G.card, 'no card while just brushing a border'); t.regionTick(.5); ok(s.G.card && s.G.card.z === 'cave', 'card after staying');
    s.P.x = (C.surface.cx + .5) * 16; s.P.y = (C.surface.cy + 3) * 16; t.regionTick(.8); ok(s.G.card && s.G.card.z === 'surface' && !s.G.card.big, 'revisit: small card'); }
  // 저장·불러오기, 예전 저장(협곡 없음) 옮기기
  { t.calm(); t.saveGame(); s = t.get(); s.G.canyonOpen = false; t.loadGame(); s = t.get(); ok(s.G.canyonOpen && s.G.wyrmDown && s.G.zSeen && s.G.zSeen.cave, 'save/load keeps canyon progress and seen regions');
    t.newGame(); s = t.get(); t.calm(); for (let y = K.y0; y <= K.y1; y++) for (let x = K.x0; x <= K.x1; x++) s.tile[idx(x, y)] = T.BEDROCK; for (let x = C.ruins.x1 - 3; x < K.x0; x++) for (let dy = -1; dy <= 1; dy++) if (s.tile[idx(x, K.entY + dy)] === T.SEDW) s.tile[idx(x, K.entY + dy)] = T.BEDROCK;
    s.cores.splice(s.cores.findIndex(c => c.canyon), 1); s.gates.splice(s.gates.findIndex(g => g.canyon), 1); delete s.res.fossil; delete s.res.amber; t.saveGame(); t.loadGame(); s = t.get();
    ok(s.cores.some(c => c.canyon) && s.tile[idx(K.core[0], K.core[1])] !== T.BEDROCK && s.gates.some(g => g.canyon) && s.res.fossil === 0, 'old save without canyon gets it carved in on load'); }
  t.newGame();
}

summary();
