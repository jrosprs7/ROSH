import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {SpreadsheetFile,FileBlob} from '@oai/artifact-tool';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
await fs.mkdir(root+'/web/previews',{recursive:true});
let checks=0;function eq(a,b,label){if(typeof a==='number'&&typeof b==='number'?Math.abs(a-b)>1e-7:JSON.stringify(a)!==JSON.stringify(b))throw Error(`${label}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);checks++;}
const browser=await chromium.launch({headless:true,channel:'msedge'});
for(const region of ['Negros','Zamboanga']){
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(`${root}/${region}/ROSH ${region} Pricing v.01.html`).href);
 await page.locator('#service').selectOption('Subdivide');await page.locator('#area').fill('600');await page.locator('#equal').check();await page.locator('#count').fill('3');
 eq(await page.locator('#total').textContent(),'₱28,500','equal total');eq(await page.locator('#per-lot').textContent(),'₱9,500 per lot × 3 lots','equal per lot');
 await page.locator('h1').click();await page.screenshot({path:`${root}/web/previews/${region}-mobile.png`,fullPage:true});
 eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile no horizontal overflow');
 await page.setViewportSize({width:1100,height:850});await page.screenshot({path:`${root}/web/previews/${region}-desktop.png`,fullPage:true});
 await page.locator('#count').fill('19');eq(await page.locator('#total').textContent(),'—','reject 19');
 await page.locator('#count').fill('18');eq(await page.locator('#total').textContent(),'₱144,000','accept 18');
 await page.locator('#equal').uncheck();eq(await page.locator('.sublot-area').count(),0,'no initial sublot boxes');
 await page.locator('#add').click();await page.locator('.sublot-area').fill('200');eq(await page.locator('#total').textContent(),'₱21,000','manual remainder');
 for(let i=1;i<17;i++)await page.locator('#add').click();eq(await page.locator('#add').isDisabled(),true,'button cap');
 await page.locator('#service').selectOption('Relocate');eq(await page.locator('#total').textContent(),'₱10,000','inactive blank sublots ignored');
 await page.locator('#area').fill('');await page.locator('#area').pressSequentially('a-6e00');eq(await page.locator('#area').inputValue(),'600','invalid typing rejected');
 await page.locator('#settings-open').click();await page.locator('#settings-password').fill(process.env.ROSH_SETTINGS_PASSWORD);await page.locator('#password-form button[type=submit]').click();await page.locator('#settings').waitFor({state:'visible'});await page.locator('#rates details').first().locator('summary').click();await page.locator('[data-rate="7"]').fill('11000');await page.locator('#settings-save').click();await page.locator('#settings-close').click();eq(await page.locator('#total').textContent(),'₱11,000','setting applies');
 await page.reload();await page.locator('#area').fill('600');eq(await page.locator('#total').textContent(),'₱11,000','setting persists');
 await page.locator('#settings-open').click();await page.locator('#settings-password').fill(process.env.ROSH_SETTINGS_PASSWORD);await page.locator('#password-form button[type=submit]').click();await page.locator('#settings').waitFor({state:'visible'});const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;await download.saveAs(`${root}/web/previews/${region}-download-test.html`);
 const fresh=await browser.newPage();await fresh.goto(pathToFileURL(`${root}/web/previews/${region}-download-test.html`).href);await fresh.locator('#area').fill('600');eq(await fresh.locator('#total').textContent(),'₱11,000','download contains new rates');eq(await fresh.locator('#settings').isVisible(),false,'download settings closed');await fresh.close();
 await page.evaluate(()=>localStorage.clear());await page.reload();
 const w=await SpreadsheetFile.importXlsx(await FileBlob.load(`${root}/${region}/${region}_Pricing_Equal_Share.xlsx`)),q=w.worksheets.getItem(region+' Pricing');
 const set=(a,x)=>q.getRange(a).values=[[x]];
 const jobs=[];
 for(const service of ['Relocate','Original survey'])for(const area of [0.01,999.99,1000,9999.99,10000,14999.99,15000,20000,50000,100000,105000,1000000])for(const km of [0,5,15,235])jobs.push({service,area,equal:false,count:3,sublots:[200],km,report:km===235});
 for(const count of [2,3,9,10,17,18])for(const a of [200,4999.99,5000,9999.99,10000,15000,55000,105000])for(const km of [0,235])jobs.push({service:'Subdivide',area:a*count,equal:true,count,sublots:[200],km,report:km===235});
 for(const sublots of [[200],[200,200],[5000,10000],Array(17).fill(100)])jobs.push({service:'Subdivide',area:sublots.reduce((a,b)=>a+b,0)+18000,equal:false,count:3,sublots,km:15,report:true});
 for(const j of jobs){
  set('C7',j.service);set('C8',j.area);set('C11',j.equal?'Equal Share':'Specify sublots');set('G11',j.count);set('C10',j.report?'Yes':'No');set('G8','Manual km');set('G9',j.km);
  q.getRange('C18:C25').values=Array.from({length:8},(_,i)=>[j.sublots[i]??null]);q.getRange('C52:C60').values=Array.from({length:9},(_,i)=>[j.sublots[i+8]??null]);
  const result=await page.evaluate(j=>ROSH.calculate(ROSH.getConfig(),{...j,distanceMode:'manual',site:''}),j);
  eq(result.ok,true,'browser valid');for(const[key,cell]of [['total','G5'],['serviceCost','G29'],['travel','G30'],['report','G31']])eq(result[key],q.getRange(cell).values[0][0],`${region} ${JSON.stringify(j)} ${key}`);
 }
 const destinations=await page.evaluate(()=>ROSH.getConfig().destinations);
 for(const d of destinations){const r=await page.evaluate(d=>ROSH.calculate(ROSH.getConfig(),{service:'Relocate',area:600,distanceMode:'preset',location:d.name,site:'',report:false}),d);eq(r.ok,d.km!==null,'preset '+d.name);if(d.km!==null)eq(r.travel,Math.round(d.km/10)*500,'preset travel');}
 eq(errors,[],'browser script errors');console.log(region,`${jobs.length} workbook comparisons, ${destinations.length} destinations, UI/settings/download checks passed.`);await page.close();
}
await browser.close();console.log(`${checks} assertions passed.`);
