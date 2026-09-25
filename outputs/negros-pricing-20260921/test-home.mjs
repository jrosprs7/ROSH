import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
for(const region of ['Negros','Zamboanga']){
 const old=fs.readFileSync(`${root}/${region}/ROSH ${region} Pricing v.01.html`,'utf8');
 const fresh=fs.readFileSync(`${root}/${region}/ROSH ${region} Pricing v.02.html`,'utf8');
 assert.equal(fresh,old.replace('</title>',' · v.02</title>').replaceAll('Pricing v.01.html','Pricing v.02.html'));
}
const b=await chromium.launch({headless:true,channel:'msedge'});
try{
 const p=await b.newPage();
 for(const width of [320,1100]){
 await p.setViewportSize({width,height:800});await p.goto(pathToFileURL(`${root}/index.html`).href);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.equal(await p.locator('img').evaluate(e=>e.complete&&e.naturalWidth>0),true);
 await p.screenshot({path:`${root}/web/previews/home-${width}.png`});
 }
 for(const region of ['Negros','Zamboanga']){
 await p.goto(pathToFileURL(`${root}/index.html`).href);await p.getByRole('link',{name:region}).click();
 assert.ok(p.url().includes('v.02.html'));await p.locator('#area').fill('600');assert.equal(await p.locator('#total').textContent(),'₱10,000');
 }
 console.log('Both v.02 calculators differ only in version labels/download names; home links, banner and mobile/desktop overflow checks passed.');
}finally{await b.close();}
