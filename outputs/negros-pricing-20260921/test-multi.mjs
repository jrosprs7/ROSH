import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const b=await chromium.launch({headless:true,channel:'msedge'});
for(const region of ['Negros','Zamboanga']){
 const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(pathToFileURL(`${root}/${region}/ROSH ${region} Pricing v.02.html`).href);
 const report=await p.evaluate(()=>{
  const c=ROSH.getConfig();let checks=0;const check=(a,b)=>{checks++;if(Math.abs(a-b)>1e-6||typeof a!==typeof b)throw Error(JSON.stringify({a,b}));};
  const j={service:'Relocate',area:600,multi:true,relocationLots:[2000,12000],sameVisit:true,proximity:'adjacent',distanceMode:'manual',km:0,site:'',report:false};
  check(ROSH.calculate(c,j).total,26000);check(ROSH.calculate(c,{...j,proximity:'nearby'}).total,31000);check(ROSH.calculate(c,{...j,report:true}).total,41000);check(ROSH.calculate(c,{...j,proximity:'nearby',report:true}).total,46000);
  const normal=a=>{let h=Math.floor(a/5000)*.5;return (a<1000?10000:a<10000?13000:15000)+Math.max(0,Math.min(h,5)-1)*5000+Math.max(0,Math.min(h,10)-5)*3000+Math.max(0,h-10)*2500;};
  for(let n=2;n<=30;n++)for(const a of [600,999.99,1000,9999.99,10000,14999.99,15000,50000,105000])for(const proximity of ['adjacent','nearby'])for(const report of [false,true]){
   const areas=Array.from({length:n},(_,i)=>a+(i%3)*5000),fees=areas.map(normal),max=Math.max(...fees),service=max+(fees.reduce((s,x)=>s+x,0)-max)*(proximity==='adjacent'?.5:.7),total=Math.floor(Math.round((service+1000+(report?n*5000:0))*100)/100000)*1000;
   const got=ROSH.calculate(c,{...j,area:areas[0],relocationLots:areas.slice(1),km:15,proximity,report});check(got.total,total);check(got.travel,1000);check(got.report,report?n*5000:0);
   areas.reverse();check(ROSH.calculate(c,{...j,area:areas[0],relocationLots:areas.slice(1),km:15,proximity,report}).total,total);
  }
  for(const patch of [{sameVisit:false},{proximity:'bad'},{relocationLots:[]},{relocationLots:Array(30).fill(100)},{relocationLots:[0]},{relocationLots:['']},{relocationLots:[-1]}])if(ROSH.calculate(c,{...j,...patch}).ok)throw Error('Invalid multi accepted');
  const edit=structuredClone(c);edit.rates[43]=25;check(ROSH.calculate(edit,j).total,32000);edit.rates[43]=101;if(!ROSH.validateConfig(edit))throw Error('Discount 101 accepted');edit.rates[43]=0;check(ROSH.calculate(edit,j).total,38000);edit.rates[43]=100;check(ROSH.calculate(edit,j).total,15000);
  return checks;
 });
 await p.locator('#area').fill('600');await p.locator('#multi').check();await p.locator('#same-visit').check();await p.locator('#add-relocation').click();await p.locator('.relocation-area').nth(0).fill('2000');await p.locator('#add-relocation').click();await p.locator('.relocation-area').nth(1).fill('12000');
 if(await p.locator('#total').textContent()!=='₱26,000')throw Error('UI total');await p.locator('#quotation-panel summary').click();const quote=await p.locator('#quotation-text').inputValue();if(!quote.includes('Lot 3: 12,000 sqm — ₱15,000')||!quote.includes('Total quotation: ₱26,000'))throw Error('Multi quote');
 await p.locator('#report').selectOption('yes');if(!(await p.locator('#quotation-text').inputValue()).includes('Included for 3 lots'))throw Error('Report quote');await p.locator('#report').selectOption('no');
 await p.locator('#proximity').selectOption('nearby');if(await p.locator('#total').textContent()!=='₱31,000')throw Error('Nearby UI');
 await p.locator('#quotation-panel summary').click();await p.locator('h1').click();for(const width of [320,1100]){await p.setViewportSize({width,height:900});if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow');await p.screenshot({path:`${root}/web/previews/${region}-multi-${width}.png`,fullPage:true});}
 for(let i=2;i<29;i++){await p.locator('#add-relocation').click();await p.locator('.relocation-area').nth(i).fill('100');}if(!await p.locator('#add-relocation').isDisabled())throw Error('30 limit');await p.locator('.relocation-row .remove').last().click();if(await p.locator('#add-relocation').isDisabled())throw Error('Remove limit');
 await p.locator('#service').selectOption('Original survey');if(await p.locator('#total').textContent()!=='₱30,000')throw Error('Original changed');await p.locator('#service').selectOption('Subdivide');await p.locator('#equal').check();await p.locator('#count').fill('3');if(await p.locator('#total').textContent()!=='₱28,500')throw Error('Equal changed');
 await p.locator('#service').selectOption('Relocate');await p.locator('#multi').uncheck();if(await p.locator('#total').textContent()!=='₱10,000')throw Error('Single changed');if(errors.length)throw Error(errors.join('\n'));
 console.log(`${region}: ${report} multi-lot calculations/order checks plus UI, reports, quotation, limits and service-switch checks passed.`);await p.close();
}await b.close();
