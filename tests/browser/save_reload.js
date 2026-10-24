const { chromium } = require(process.env.PW_PATH||'/home/claude/.npm-global/lib/node_modules/playwright');
const fs=require('fs'); const path=require('path'); const D=path.join(__dirname,'..','.tmp')+'/'; require('fs').mkdirSync(D,{recursive:true}); require('fs').writeFileSync(D+'host.html','<!doctype html><body style="margin:0"><iframe id=f src="frame.html" style="position:absolute;top:30px;left:0;width:1280px;height:720px;border:0" sandbox="allow-scripts allow-same-origin"></iframe></body>');
fs.writeFileSync(D+'frame.html','<!doctype html><html><head><meta charset=utf-8></head><body style="margin:0">'+fs.readFileSync(path.join(__dirname,'..','..','index.html'),'utf8')+'</body></html>');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const ctxb=await b.newContext({viewport:{width:1280,height:760}}); const pg=await ctxb.newPage();
 const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
 await pg.goto('file://'+D+'host.html'); await pg.waitForTimeout(800); let fr=pg.frames()[1]; await fr.evaluate(()=>__seal.closeSlots&&__seal.closeSlots());
 await pg.mouse.click(640,330);
 const before=await fr.evaluate(()=>{const s=__seal.get(); s.res.wood=777; s.P.bag.push({id:'wind',q:3,uid:999}); s.tech.eco1=true; __seal.openSeal(); for(let i=0;i<120;i++) __seal.step(1/60); __seal.saveGame(); return JSON.stringify([s.res.wood, s.P.bag.length, s.G.sealOpen, Math.round(s.P.x)]);});
 await pg.reload(); await pg.waitForTimeout(900); fr=pg.frames()[1]; await fr.evaluate(()=>__seal.closeSlots&&__seal.closeSlots());
 const after=await fr.evaluate(()=>{const s=__seal.get(); return JSON.stringify([s.res.wood, s.P.bag.length, s.G.sealOpen, Math.round(s.P.x)]);});
 ok(before===after, `reload resumes saved run ${after}`);
 ok((await fr.evaluate(()=>__seal.get().G.msg && __seal.get().G.msg.t))==='이어서 한다','resume message shown');
 // autosave on its own after 20s of play
 await fr.evaluate(()=>{const s=__seal.get(); s.res.wood=4321;}); await pg.waitForTimeout(21500);
 await pg.reload(); await pg.waitForTimeout(900); fr=pg.frames()[1]; await fr.evaluate(()=>__seal.closeSlots&&__seal.closeSlots());
 ok((await fr.evaluate(()=>__seal.get().res.wood))>=4321-50,'autosave captured later change');
 // R twice -> fresh run persisted
 await pg.mouse.click(640,330); await pg.keyboard.press('KeyR'); await pg.keyboard.press('KeyR'); await pg.waitForTimeout(300);
 await pg.reload(); await pg.waitForTimeout(900); fr=pg.frames()[1]; await fr.evaluate(()=>__seal.closeSlots&&__seal.closeSlots());
 ok((await fr.evaluate(()=>__seal.get().res.wood))===10,'R twice starts fresh and survives reload');
 ok(errs.length===0,'no page errors '+errs.join('|')); await b.close();
})();
