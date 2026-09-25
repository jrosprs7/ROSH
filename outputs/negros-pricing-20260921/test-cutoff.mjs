import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const b=await chromium.launch({headless:true,channel:'msedge'});
try{for(const region of ['Negros','Zamboanga']){
 const p=await b.newPage();await p.goto(pathToFileURL(`${root}/${region}/ROSH ${region} Pricing v.03.html`).href);
 for(const [area,price]of [[1000,'₱10,000'],[1999.99,'₱10,000'],[2000,'₱13,000'],[2000.01,'₱13,000'],[9999.99,'₱13,000'],[10000,'₱15,000']]){await p.locator('#area').fill(String(area));assert.equal(await p.locator('#total').textContent(),price);}
 await p.evaluate(()=>{
  const c=JSON.parse(document.querySelector('#pricing-config').textContent);c.rates[10]=1000;
  const hash=JSON.stringify(c).split('').reduce((h,x)=>(Math.imul(31,h)+x.charCodeAt(0))|0,0);
  c.rates[34]=750;c.rates[43]=40;
  localStorage.setItem('rosh-pricing-'+c.region+'-'+hash,JSON.stringify(c));
 });await p.reload();
 assert.deepEqual(await p.evaluate(()=>[ROSH.getConfig().rates[10],ROSH.getConfig().rates[34],ROSH.getConfig().rates[43]]),[2000,750,40]);
 await p.reload();assert.equal(await p.evaluate(()=>ROSH.getConfig().rates[34]),750);
 await p.locator('#settings-open').click();await p.locator('#settings-password').fill(process.env.ROSH_SETTINGS_PASSWORD);await p.locator('#password-form button[type=submit]').click();
 p.once('dialog',d=>d.accept());await p.locator('#reset-settings').click();await p.reload();
 assert.deepEqual(await p.evaluate(()=>[ROSH.getConfig().rates[10],ROSH.getConfig().rates[34],ROSH.getConfig().rates[43]]),[2000,500,50]);
 await p.close();console.log(region+': six UI boundaries, previous browser settings migration and persistent reset passed.');
}}finally{await b.close();}
