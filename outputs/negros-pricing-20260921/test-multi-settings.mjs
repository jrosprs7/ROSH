import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const browser=await chromium.launch({headless:true,channel:'msedge'});
try {
 for(const region of ['Negros','Zamboanga']){
  const page=await browser.newPage();
  await page.goto(pathToFileURL(`${root}/${region}/ROSH ${region} Pricing v.01.html`).href);
  await page.evaluate(()=>{
   const c=JSON.parse(document.querySelector('#pricing-config').textContent);
   const hash=JSON.stringify(c).split('').reduce((h,x)=>(Math.imul(31,h)+x.charCodeAt(0))|0,0);
   c.rates[7]=12345;delete c.rates[43];delete c.rates[44];
   localStorage.setItem('rosh-pricing-'+c.region+'-'+hash,JSON.stringify(c));
  });
  await page.reload();
  assert.deepEqual(await page.evaluate(()=>[ROSH.getConfig().rates[7],ROSH.getConfig().rates[43],ROSH.getConfig().rates[44]]),[12345,50,30]);
  await page.locator('#settings-open').click();
  await page.locator('#settings-password').fill(process.env.ROSH_SETTINGS_PASSWORD);
  await page.locator('#password-form button[type=submit]').click();
  await page.locator('#settings').waitFor({state:'visible'});
  await page.locator('#rates details').filter({hasText:'Multi-lot discounts'}).locator('summary').click();
  await page.locator('[data-rate="43"]').fill('40');
  await page.locator('[data-rate="44"]').fill('20');
  await page.locator('#settings-save').click();
  await page.locator('#settings-close').click();await page.reload();
  assert.deepEqual(await page.evaluate(()=>[ROSH.getConfig().rates[7],ROSH.getConfig().rates[43],ROSH.getConfig().rates[44]]),[12345,40,20]);
  await page.locator('#settings-open').click();
  await page.locator('#settings-password').fill(process.env.ROSH_SETTINGS_PASSWORD);
  await page.locator('#password-form button[type=submit]').click();
  await page.locator('#settings').waitFor({state:'visible'});
  const downloading=page.waitForEvent('download');await page.locator('#download').click();
  const download=await downloading;const target=`${root}/web/previews/${region}-multi-settings-test.html`;await download.saveAs(target);
  const fresh=await browser.newPage();await fresh.goto(pathToFileURL(target).href);
  assert.deepEqual(await fresh.evaluate(()=>[ROSH.getConfig().rates[7],ROSH.getConfig().rates[43],ROSH.getConfig().rates[44]]),[12345,40,20]);
  assert.equal(await fresh.locator('#settings').isVisible(),false);
  await fresh.close();await page.close();console.log(region+': old settings migration, discount editor, reload, download and lock passed.');
 }
} finally {await browser.close();}
