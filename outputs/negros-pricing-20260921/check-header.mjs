import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const b=await chromium.launch({headless:true,channel:'msedge'});
for(const region of ['Negros','Zamboanga']){
 const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(pathToFileURL(`${root}/${region}/ROSH ${region} Pricing v.02.html`).href);
 if(!await p.locator('.header-banner').evaluate(e=>e.complete&&e.naturalWidth>0))throw Error('Banner not loaded');
 await p.locator('#service').selectOption('Subdivide');await p.locator('#area').fill('600');await p.locator('#equal').check();await p.locator('#count').fill('3');if(await p.locator('#total').textContent()!=='₱28,500')throw Error('Price changed');
 for(const width of [320,390,1100]){await p.setViewportSize({width,height:900});await p.locator('h1').click();if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow');await p.screenshot({path:`${root}/web/previews/${region}-header-${width}.png`,fullPage:true});}
 await p.locator('#settings-open').click();if(!await p.locator('#password-dialog').isVisible())throw Error('Password gate missing');if(errors.length)throw Error(errors.join('\n'));console.log(`${region}: banner loaded, mobile/desktop widths checked, example price and settings gate passed.`);await p.close();
}await b.close();
