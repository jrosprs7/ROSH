import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const browser=await chromium.launch({headless:true,channel:'msedge'});const reports=[];
for(const region of ['Negros','Zamboanga']){
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(`${root}/${region}/ROSH ${region} Pricing v.01.html`).href);
 const report=await page.evaluate(()=>{
  const c=ROSH.getConfig(),r=c.rates;let cases=0;const failures=[];
  const job={service:'Subdivide',area:600,equal:true,count:3,sublots:[200],distanceMode:'manual',km:0,site:'',report:false};
  function expected(c,j){const r=c.rates;const charge=(a,sub)=>{const rounded=Math.floor(Math.round(a*1000000)/(10000000000*r[31]))*r[31];let x=Math.max(0,rounded-r[28]),cost=0;for(const[capacity,rate]of [[r[29]-r[28],r[sub?25:22]],[r[30]-r[29],r[sub?26:23]],[Infinity,r[sub?27:24]]]){const units=Math.min(x,capacity);cost+=units*rate;x-=units;}return cost;};const base=a=>a<r[18]?r[15]:a<r[19]?r[16]:r[17];let fee;
   if(j.service==='Subdivide'){if(j.equal){const a=+j.area/+j.count;fee=r[14]+charge(a,true)+(+j.count-1)*(base(a)+charge(a,true));}else{const lots=j.sublots.map(Number).filter(x=>x>0);fee=r[14]+charge(+j.area-lots.reduce((a,b)=>a+b,0),true);for(const a of lots)fee+=base(a)+charge(a,true);}}
   else fee=(j.service==='Original survey'?r[39]:+j.area<r[10]?r[7]:+j.area<r[11]?r[8]:r[9])+charge(+j.area,false);
   const before=fee+Math.floor(+j.km/r[35]+.5)*r[34]+(j.report?r[36]:0),equal=j.service==='Subdivide'&&j.equal,per=equal?Math.floor(before/(+j.count*r[42]))*r[42]:null;
   return {total:equal?per*+j.count:Math.floor(before/r[37])*r[37],perLot:per};
  }
  function check(j,conf=c){cases++;const got=ROSH.calculate(conf,j),want=expected(conf,j);if(!got.ok||Math.abs(got.total-want.total)>1e-6||got.perLot!==want.perLot)failures.push({j,got,want});if(got.ok&&got.total>got.subtotal+1e-6)failures.push({issue:'rounding increased quote',j});}
  const areas=[.01,200,999.99,1000,4999.99,5000,5000.01,9999.99,10000,10000.01,14999.99,15000,15000.01,19999.99,20000,49999.99,50000,50000.01,99999.99,100000,100000.01,105000,1000000];
  for(let n=2;n<=18;n++)for(const a of areas)for(const km of [0,4.99,5,5.01,14.99,15,15.01,235,1000])for(const report of [false,true])check({...job,area:a*n,count:n,km,report});
  for(const service of ['Relocate','Original survey'])for(const area of areas)for(const km of [0,4.99,5,14.99,15,235])for(const report of [false,true])check({...job,service,area,km,report});
  for(let n=1;n<=17;n++)for(const a of [100,4999.99,5000,10000,15000,100000])for(const remainder of [100,15000,55000])check({...job,equal:false,area:n*a+remainder,sublots:Array(n).fill(a),report:true,km:235});
  // Deterministic mixed jobs and modified (valid) rate settings.
  let seed=210922;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<2000;i++){const conf=JSON.parse(JSON.stringify(c));if(i%3===0){for(const k of [7,8,9,14,15,16,17,22,23,24,25,26,27,34,36,39])conf.rates[k]=Math.floor(random()*100)*100;conf.rates[42]=[100,250,500,1000][i%4];}const count=2+Math.floor(random()*17),service=['Relocate','Original survey','Subdivide'][i%3],area=Math.round((1+random()*1000000)*100)/100;check({...job,service,area,count,km:Math.round(random()*20000)/100,report:i%2===0},conf);}
  const invalid=(patch)=>{cases++;const got=ROSH.calculate(c,{...job,...patch});if(got.ok)failures.push({issue:'invalid accepted',patch,got});};
  for(const count of ['',null,0,1,19,100,-1,2.2,'abc',true])invalid({count});for(const area of ['',null,0,-1,'abc',Infinity])invalid({area});for(const km of ['',null,-1,'abc',Infinity])invalid({km});for(const sublots of [[],[''],[-1],['abc'],[600],[300,300],[601],Array(18).fill(1)])invalid({equal:false,sublots});
  check({...job,area:'.5'});check({...job,area:'600.'});
  for(const k of Object.keys(r))for(const bad of ['',null,-1,'abc']){cases++;const conf=JSON.parse(JSON.stringify(c));conf.rates[k]=bad;if(!ROSH.validateConfig(conf))failures.push({issue:'invalid setting accepted',k,bad});}
  return {cases,failures:failures.slice(0,10),failureCount:failures.length};
 });
 if(report.failureCount)throw Error(JSON.stringify({region,...report}));
 await page.locator('#service').selectOption('Subdivide');await page.locator('#area').fill('600');await page.locator('#equal').check();await page.locator('#count').fill('3');
 const colors=await page.evaluate(()=>Object.fromEntries(['service','area','total'].map(id=>[id,getComputedStyle(id==='total'?document.querySelector('.total-box'):document.getElementById(id)).backgroundColor])));
 for(const[width,height]of [[320,700],[390,844],[768,1024],[1280,900]]){await page.setViewportSize({width,height});await page.locator('h1').click();if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow '+region+' '+width);await page.screenshot({path:`${root}/web/previews/${region}-review-${width}.png`,fullPage:true});}
 await page.setViewportSize({width:320,height:700});await page.locator('#equal').uncheck();await page.locator('#area').fill('1800');for(let i=0;i<17;i++){await page.locator('#add').click();await page.locator('.sublot-area').nth(i).fill('100');}if(await page.locator('#total').textContent()!=='₱149,000')throw Error('18 manual total');if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('18 lots overflow');await page.screenshot({path:`${root}/web/previews/${region}-18-mobile.png`,fullPage:true});
 await page.locator('#equal').check();await page.locator('#count').fill('18');if(await page.locator('#total').textContent()!=='₱144,000')throw Error('mode switch total');await page.locator('#equal').uncheck();if(await page.locator('.sublot-area').first().inputValue()!=='100')throw Error('lost manual value');await page.locator('.remove').last().click();if(await page.locator('#add').isDisabled())throw Error('remove did not release limit');
 await page.locator('#settings-open').click();await page.locator('#settings-password').fill(process.env.ROSH_SETTINGS_PASSWORD);await page.locator('#password-form button[type=submit]').click();await page.locator('#settings').waitFor({state:'visible'});await page.locator('#rates details').last().locator('summary').click();await page.locator('[data-rate="42"]').fill('0');await page.locator('#settings-save').click();if(!(await page.locator('#settings-message').textContent()).includes('above zero'))throw Error('settings validation UI');if(await page.evaluate(()=>document.getElementById('settings').scrollWidth>document.getElementById('settings').clientWidth))throw Error('settings overflow');await page.screenshot({path:`${root}/web/previews/${region}-settings-mobile.png`,fullPage:true});
 if(errors.length)throw Error(errors.join('\n'));reports.push({region,...report,colors});console.log(JSON.stringify(reports.at(-1)));await page.close();
}
await browser.close();await fs.writeFile(`${root}/web/previews/computation-review.json`,JSON.stringify(reports,null,2));
