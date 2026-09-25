import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const b=await chromium.launch({headless:true,channel:'msedge'});
for(const region of ['Negros','Zamboanga']){
 const p=await b.newPage({viewport:{width:390,height:844}});await p.goto(pathToFileURL(`${root}/${region}/ROSH ${region} Pricing v.03.html`).href);
 if(await p.locator('#quotation-panel').isVisible())throw Error('Invalid quote visible');
 await p.locator('#area').fill('600');await p.locator('#quotation-panel summary').click();
 let text=await p.locator('#quotation-text').inputValue();if(!text.includes('1. Verify lot’s boundaries as per official records.')||!text.includes('Total quotation: ₱10,000'))throw Error('Relocation quote');
 await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedQuote=text;}}}));await p.locator('#copy-quotation').click();if(await p.evaluate(()=>window.copiedQuote)!==text)throw Error('Copy failed');
 await p.locator('#service').selectOption('Subdivide');await p.locator('#equal').check();await p.locator('#count').fill('3');text=await p.locator('#quotation-text').inputValue();if(!text.includes('5. Process subdivision plan approval at DENR.')||!text.includes('Total quotation: ₱28,500')||!text.includes('Price per lot: ₱9,500'))throw Error('Subdivision quote');
 await p.locator('#report').selectOption('yes');if(!(await p.locator('#quotation-text').inputValue()).includes('Survey report: Included'))throw Error('Report stale');
 await p.locator('[name=distanceMode][value=manual]').check();await p.locator('#km').fill('15');if(!(await p.locator('#quotation-text').inputValue()).includes('exact location to be confirmed'))throw Error('Missing manual location');
 await p.locator('#count').fill('19');if(await p.locator('#quotation-panel').isVisible()||await p.locator('#quotation-text').inputValue()!=='')throw Error('Stale invalid quote');await p.locator('#count').fill('3');
 await p.setViewportSize({width:320,height:850});if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow');await p.screenshot({path:`${root}/web/previews/${region}-quotation.png`,fullPage:true});
 console.log(region+': scope text, current pricing, copy, report, manual location, invalid-input clearing and mobile layout passed.');await p.close();
}await b.close();
