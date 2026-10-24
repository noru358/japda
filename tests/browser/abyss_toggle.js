const { chromium } = require(process.env.PW_PATH||'/home/claude/.npm-global/lib/node_modules/playwright');
const fs=require('fs'); const path=require('path'); const D=path.join(__dirname,'..','.tmp')+'/'; require('fs').mkdirSync(D,{recursive:true}); require('fs').writeFileSync(D+'host.html','<!doctype html><body style="margin:0"><iframe id=f src="frame.html" style="position:absolute;top:30px;left:0;width:1280px;height:720px;border:0" sandbox="allow-scripts allow-same-origin"></iframe></body>');
fs.writeFileSync(D+'frame.html','<!doctype html><html><head><meta charset=utf-8></head><body style="margin:0">'+fs.readFileSync(path.join(__dirname,'..','..','index.html'),'utf8')+'</body></html>');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const pg=await b.newPage({viewport:{width:1280,height:760}});
 const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
 await pg.goto('file://'+D+'host.html'); await pg.waitForTimeout(800); const fr=pg.frames()[1]; await fr.evaluate(()=>__seal.closeSlots&&__seal.closeSlots());
 await pg.mouse.click(640,330); await pg.keyboard.press('Shift+Digit3'); await pg.waitForTimeout(700);
 ok((await fr.evaluate(()=>__seal.layerInfo().kind))==='abyss','Shift+3 enters abyss');
 await pg.keyboard.press('Shift+Digit3'); await pg.waitForTimeout(500);
 ok((await fr.evaluate(()=>__seal.layerInfo().kind))==='valley','Shift+3 returns');
 ok((await fr.evaluate(()=>__seal.get().P.cur))==='sword','Shift+3 did not switch weapon');
 await pg.keyboard.press('Shift+Digit1'); ok(await fr.evaluate(()=>__seal.get().G.debug),'Shift+1 debug panel');
 ok(errs.length===0,'no page errors '+errs.join('|')); await b.close();
})();
