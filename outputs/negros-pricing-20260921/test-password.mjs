import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const password=process.env.ROSH_SETTINGS_PASSWORD;
if(!password)throw Error('Set ROSH_SETTINGS_PASSWORD for this test.');
const browser=await chromium.launch({headless:true,channel:'msedge'});
for(const region of ['Negros','Zamboanga']){
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(`${root}/${region}/ROSH ${region} Pricing v.03.html`).href);
 await page.locator('#area').fill('600');
 if(await page.locator('#total').textContent()!=='₱10,000')throw Error('Pricing changed');
 await page.locator('#settings-open').click();await page.locator('#settings-password').fill('incorrect');await page.locator('#password-form button[type=submit]').click();await page.locator('#password-error').filter({hasText:'Incorrect'}).waitFor();
 if(await page.locator('#settings').isVisible())throw Error('Incorrect password opened settings');
 const unlock=async()=>{await page.locator('#settings-password').fill(password);await page.locator('#password-form button[type=submit]').click();await page.locator('#settings').waitFor({state:'visible'});};
 await unlock();await page.locator('#rates details').first().locator('summary').click();await page.locator('[data-rate="7"]').fill('11000');await page.locator('#settings-save').click();
 const dl=page.waitForEvent('download');await page.locator('#download').click();await(await dl).saveAs(`${root}/web/previews/${region}-password-test.html`);
 await page.locator('#settings-close').click();await page.locator('#settings-open').click();if(!await page.locator('#password-dialog').isVisible())throw Error('Did not relock');if(await page.locator('#settings-password').inputValue()!=='')throw Error('Password retained');
 await page.screenshot({path:`${root}/web/previews/${region}-password.png`});await page.locator('#password-cancel').click();
 const fresh=await browser.newPage();await fresh.goto(pathToFileURL(`${root}/web/previews/${region}-password-test.html`).href);await fresh.locator('#area').fill('600');if(await fresh.locator('#total').textContent()!=='₱11,000')throw Error('Download rate not saved');await fresh.locator('#settings-open').click();if(!await fresh.locator('#password-dialog').isVisible())throw Error('Download unlocked');await fresh.locator('#settings-password').fill(password);await fresh.locator('#password-form button[type=submit]').click();await fresh.locator('#settings').waitFor({state:'visible'});await fresh.keyboard.press('Escape');await fresh.locator('#settings-open').click();if(!await fresh.locator('#password-dialog').isVisible())throw Error('Escape did not lock');await fresh.close();
 await page.reload();await page.locator('#settings-open').click();if(!await page.locator('#password-dialog').isVisible())throw Error('Reload unlocked');if(errors.length)throw Error(errors.join('\n'));console.log(`${region}: password, save, close/Escape/reload lock, pricing and downloaded-copy checks passed.`);await page.close();
}
await browser.close();
