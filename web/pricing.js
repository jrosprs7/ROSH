const SETTINGS_PASSWORD_HASH = "abd7ef3dc088061fc6438076c5f69bd66027b22313d33d235d3fec34638748ea";
'use strict';
const FILE_CONFIG=JSON.parse(document.getElementById('pricing-config').textContent);
const clone=x=>JSON.parse(JSON.stringify(x));
const fingerprint=JSON.stringify(FILE_CONFIG).split('').reduce((h,c)=>(Math.imul(31,h)+c.charCodeAt(0))|0,0);
const storageKey='rosh-pricing-'+FILE_CONFIG.region+'-'+fingerprint;
let config=clone(FILE_CONFIG),lastResult=null;
function withMultiDefaults(c){c.rates={43:50,44:30,...c.rates};c.labels={...c.labels,43:'Adjacent: discount on other lots (%)',44:'Nearby: discount on other lots (%)'};return c;}
config=withMultiDefaults(config);
const $=id=>document.getElementById(id);
const money=x=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',maximumFractionDigits:0}).format(x);
const number=x=>new Intl.NumberFormat('en-PH',{maximumFractionDigits:4}).format(x);
const numeric=x=>typeof x==='number'?Number.isFinite(x):typeof x==='string'&&/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(x)&&Number.isFinite(Number(x));
const fail=message=>({ok:false,message});
function validateConfig(c){
 if(!c||c.region!==FILE_CONFIG.region||!Array.isArray(c.destinations)||!c.destinations.length||!c.rates)return 'Invalid regional settings.';
 for(const k of [...new Set([...Object.keys(FILE_CONFIG.rates),'43','44'])])if(!numeric(c.rates[k])||Number(c.rates[k])<0)return 'Enter a nonnegative number for '+(c.labels[k]||k)+'.';
 if(+c.rates[43]>100||+c.rates[44]>100)return 'Multi-lot discounts must be between 0 and 100%.';
 const r=c.rates;
 for(const k of [10,11,18,19,31,35,37,42])if(Number(r[k])<=0)return FILE_CONFIG.labels[k]+' must be above zero.';
 if(+r[11]<=+r[10]||+r[19]<=+r[18]||+r[29]<=+r[28]||+r[30]<=+r[29])return 'Area thresholds must be in increasing order.';
 const names=new Set();
 for(const d of c.destinations){if(!d.name.trim()||names.has(d.name.trim().toLowerCase()))return 'Location names must be present and unique.';names.add(d.name.trim().toLowerCase());if(d.km!==null&&(!numeric(d.km)||+d.km<0))return 'Enter a nonnegative distance for '+d.name+'.';}
 return '';
}
try{const stored=JSON.parse(localStorage.getItem(storageKey));if(stored){withMultiDefaults(stored);if(!validateConfig(stored))config=stored;}}catch{}
function calculate(c,j){
 const r=c.rates,p=k=>Number(r[k]);
 if(!['Relocate','Original survey','Subdivide'].includes(j.service))return fail('Choose a survey type.');
 if(!numeric(j.area)||+j.area<=0)return fail('Enter a lot area above zero.');
 let area=+j.area;
 const multi=j.service==='Relocate'&&j.multi;
 let km,destination;
 if(j.distanceMode==='manual'){
  if(!numeric(j.km)||+j.km<0)return fail('Enter the one-way distance, or 0 for no travel.');km=+j.km;destination=j.site.trim()||'the survey site';
 }else if(j.distanceMode==='preset'){
  const d=c.destinations.find(d=>d.name===j.location);if(!d)return fail('Choose a location.');
  if(d.km===null)return fail('No distance preset for '+d.name+'. Choose Distance and enter the actual km.');
  km=+d.km;destination=d.name;
 }else return fail('Choose Location or Distance.');
 const extra=(a,sub)=>{const ha=Math.floor(a/10000/p(31)+1e-10)*p(31);return Math.max(0,Math.min(ha,p(29))-p(28))*p(sub?25:22)+Math.max(0,Math.min(ha,p(30))-p(29))*p(sub?26:23)+Math.max(0,ha-p(30))*p(sub?27:24);};
 const base=a=>a<p(18)?p(15):a<p(19)?p(16):p(17);
 let lots=[],serviceCost,count=1,remainder=null;
 const equal=j.service==='Subdivide'&&j.equal;
 if(multi){
  if(!j.sameVisit)return fail('Confirm that all lots can be covered in one site visit.');
  if(!['adjacent','nearby'].includes(j.proximity))return fail('Choose Adjacent or Nearby lots.');
  if(!Array.isArray(j.relocationLots)||j.relocationLots.length<1||j.relocationLots.length>29)return fail('Multi-lot Relocation requires 2 to 30 total lots.');
  if(j.relocationLots.some(a=>!numeric(a)||+a<=0))return fail('Enter a positive area for each relocation lot, or remove its box.');
  const areas=[area,...j.relocationLots.map(Number)];
  const ordinary=areas.map(a=>(a<p(10)?p(7):a<p(11)?p(8):p(9))+extra(a,false));
  const fullIndex=ordinary.indexOf(Math.max(...ordinary)),discount=p(j.proximity==='adjacent'?43:44)/100;
  if(!Number.isFinite(discount)||discount<0||discount>1)return fail('Review multi-lot discount settings.');
  lots=areas.map((a,i)=>({area:a,normalFee:ordinary[i],fee:ordinary[i]*(i===fullIndex?1:1-discount),fullPrice:i===fullIndex}));
  count=areas.length;area=areas.reduce((sum,a)=>sum+a,0);serviceCost=lots.reduce((sum,l)=>sum+l.fee,0);
 }else if(j.service==='Subdivide'){
  if(equal){
   if(!numeric(j.count)||!Number.isInteger(+j.count)||+j.count<2||+j.count>18)return fail('Enter a whole number from 2 to 18 total lots.');
   count=+j.count;const a=area/count;
   lots=Array.from({length:count},(_,i)=>({area:a,fee:(i?base(a):p(14))+extra(a,true)}));
  }else{
   if(!j.sublots.length)return fail('Click Add sublot to enter at least one additional lot.');
   if(j.sublots.length>17)return fail('Maximum 18 total lots, including the remainder.');
   for(const x of j.sublots)if(!numeric(x)||+x<0)return fail('Enter each added sublot area, or remove its box.');
   const positive=j.sublots.map(Number).filter(x=>x>0);
   if(!positive.length)return fail('Enter at least one sublot area above zero.');
   remainder=area-positive.reduce((a,b)=>a+b,0);
   if(remainder<=Math.max(1,area)*1e-12)return fail('Sublot areas must leave a positive remaining lot.');
   lots=[{area:remainder,fee:p(14)+extra(remainder,true)},...positive.map(a=>({area:a,fee:base(a)+extra(a,true)}))];count=lots.length;
  }
  serviceCost=lots.reduce((s,l)=>s+l.fee,0);
 }else{serviceCost=(j.service==='Original survey'?p(39):area<p(10)?p(7):area<p(11)?p(8):p(9))+extra(area,false);lots=[{area,fee:serviceCost}];}
 const travel=Math.round(km/p(35))*p(34),report=j.report?p(36)*(multi?count:1):0,subtotal=serviceCost+travel+report;
 const perLot=equal?Math.floor(subtotal/count/p(42)+1e-10)*p(42):null;
 const total=equal?perLot*count:Math.floor(subtotal/p(37)+1e-10)*p(37);
 if(![serviceCost,travel,subtotal,total].every(Number.isFinite))return fail('The entered values are too large.');
 return {ok:true,area,destination,km,serviceCost,travel,report,subtotal,total,perLot,count,lots,remainder,multi:!!multi,adjustment:total-subtotal};
}
window.ROSH={calculate,validateConfig,getConfig:()=>clone(config)};
function locations(){const previous=$('location').value;$('location').replaceChildren(...config.destinations.map(d=>new Option(d.name,d.name)));$('location').value=config.destinations.some(d=>d.name===previous)?previous:config.originDestination; if(!$('location').value)$('location').selectedIndex=0;$('origin').textContent=config.origin;}
function job(){return {service:$('service').value,area:$('area').value,distanceMode:document.querySelector('[name=distanceMode]:checked').value,km:$('km').value,location:$('location').value,site:$('site').value,report:$('report').value==='yes',equal:$('equal').checked,count:$('count').value,sublots:[...document.querySelectorAll('.sublot-area')].map(e=>e.value),multi:$('multi').checked,proximity:$('proximity').value,sameVisit:$('same-visit').checked,relocationLots:[...document.querySelectorAll('.relocation-area')].map(e=>e.value)};}
const quotationScopes={
 Relocate:['Verify lot’s boundaries as per official records.','Locate missing or misplaced monuments.','Re-establish corners and install monuments (mohon).'],
 Subdivide:['Verify mother lot corners as per official records.','Establish the subdivision lines and lot corners.','Install monuments (mohon) for sub-lots.','Prepare the subdivision plan and survey documents.','Process subdivision plan approval at DENR.']
};
function quotationText(j,result){
 if(!result.ok)return '';
 const title=j.service==='Relocate'?(result.multi?'Multi-lot Relocation Survey':'Relocation Survey'):j.service==='Subdivide'?'Subdivision Survey':'Original Survey';
 const lines=[title],scope=quotationScopes[j.service];
 if(scope)lines.push('Scope:',...scope.map((text,i)=>`${i+1}. ${text}`));
 lines.push('');
 if(j.service==='Subdivide')lines.push(`Lot: ${number(result.area)} sqm mother lot into ${result.count} ${j.equal?'equal ':''}lots${j.equal?' of '+number(result.area/result.count)+' sqm each': ' ('+result.lots.map(l=>number(l.area)).join(', ')+' sqm)'}.`);
 else if(result.multi){lines.push(`Lots: ${result.count} ${j.proximity} lots, covered in one site visit.`);result.lots.forEach((lot,i)=>lines.push(`Lot ${i+1}: ${number(lot.area)} sqm — ${money(lot.fee)}`));}
 else lines.push(`Lot area: ${number(result.area)} sqm`);
 const place=j.distanceMode==='preset'?`${j.location}, ${config.region==='Zamboanga'?'Zamboanga City':'Negros Occidental'}${j.site.trim()?' — '+j.site.trim():''}`:j.site.trim()||`Survey site (${number(result.km)} km from ${config.origin}; exact location to be confirmed)`;
 lines.push('Location: '+place);
 if(j.report)lines.push(result.multi?`Survey reports: Included for ${result.count} lots (${money(Number(config.rates[36]))} per lot)`:'Survey report: Included');
 lines.push('Total quotation: '+money(result.total));
 if(result.perLot!==null)lines.push('Price per lot: '+money(result.perLot));
 return lines.join('\n');
}
function render(){
 const j=job(),sub=j.service==='Subdivide',manual=j.distanceMode==='manual';
 const multi=j.service==='Relocate'&&j.multi;
 $('multi-option').hidden=j.service!=='Relocate';$('multi-lots').hidden=!multi;
 $('add-relocation').disabled=document.querySelectorAll('.relocation-area').length>=29;
 $('multi-count').textContent=(document.querySelectorAll('.relocation-area').length+1)+' / 30 lots';
 $('report-label').textContent=multi?'Survey report for every lot?':'Survey report?';
 $('report-cost-label').textContent=multi?'Survey reports · per lot':'Survey report';
 $('discount-note').textContent=`Highest-priced lot stays full price. Other lots: ${config.rates[43]}% off if adjacent, ${config.rates[44]}% off if nearby. Travel charged once.`;
 $('subdivision').hidden=!sub;$('equal-input').hidden=!j.equal;$('manual-lots').hidden=j.equal;$('preset-field').hidden=manual;$('distance-fields').hidden=!manual;
 $('area-label').textContent=sub?'Mother-lot area':multi?'Lot 1 area':'Lot area';
 $('add').disabled=document.querySelectorAll('.sublot-area').length>=17;
 const d=config.destinations.find(d=>d.name===j.location);
 $('distance-note').textContent=manual?'One-way km from '+config.origin+'.':d?((d.km===null?'Distance required':number(d.km)+' km estimate')+' from '+config.origin+'.'+(d.name.includes('(island)')?' Island destination.':'')):'';
 const result=calculate(config,j);lastResult=result;
 $('quotation-panel').hidden=!result.ok;$('quotation-text').value=quotationText(j,result);$('copy-quotation').disabled=!result.ok;$('copy-status').textContent='';
 $('status').textContent=result.ok?'':result.message;$('status').hidden=result.ok;
 for(const[id,key]of [['travel-cost','travel'],['service-cost','serviceCost'],['report-cost','report'],['total','total'],['rounding','adjustment'],['subtotal','subtotal']])$(id).textContent=result.ok?money(result[key]):'—';
 $('per-lot').hidden=!result.ok||result.perLot===null;$('per-lot').textContent=result.ok&&result.perLot!==null?money(result.perLot)+' per lot × '+result.count+' lots':'';
 $('remaining').textContent=result.ok&&result.remainder!==null?number(result.remainder)+' sqm':'—';
 $('summary').textContent=result.ok?`${j.service==='Subdivide'?'Subdivision survey':j.service==='Relocate'?'Relocation survey':'Original survey'} · ${result.destination}${j.distanceMode==='preset'&&j.site.trim()?' / '+j.site.trim():''} · ${number(result.area)} sqm${sub?` into ${result.count} lots${j.equal?' of '+number(result.area/result.count)+' sqm each':': '+result.lots.map(l=>number(l.area)).join(' + ')+' sqm'}`:''}.`:'';
 if(result.ok&&multi)$('summary').textContent=`Relocation of ${result.count} ${j.proximity} lots · ${result.destination} · ${number(result.area)} sqm total · one site visit.`;
 $('breakdown').replaceChildren();
 if(result.ok)for(const [i,lot]of result.lots.entries()){const row=document.createElement('div');row.className='detail-row';const label=document.createElement('span'),price=document.createElement('span');label.textContent=(sub?(i===0&&!j.equal?'Remainder':'Lot '+(i+1)):multi?'Lot '+(i+1):'Survey')+' · '+number(lot.area)+' sqm'+(multi?(lot.fullPrice?' · full price':' · discounted'):'');price.textContent=money(lot.fee);row.append(label,price);$('breakdown').append(row);}
 $('equal-note').hidden=!sub||!j.equal;
}
function addSublot(value=''){
 if(document.querySelectorAll('.sublot-area').length>=17)return;
 const row=document.createElement('div');row.className='sublot-row';const label=document.createElement('label');const input=document.createElement('input');input.className='sublot-area';input.type='text';input.inputMode='decimal';input.dataset.numeric='decimal';input.placeholder='sqm';input.value=value;const name=document.createElement('span');label.append(name,input);const remove=document.createElement('button');remove.type='button';remove.className='remove';remove.textContent='×';remove.addEventListener('click',()=>{row.remove();renumber();render();});row.append(label,remove);$('sublots').append(row);renumber();render();input.focus();
}
function renumber(){document.querySelectorAll('.sublot-row').forEach((row,i)=>{row.querySelector('span').textContent='Sublot '+(i+2);row.querySelector('button').setAttribute('aria-label','Remove sublot '+(i+2));});}
function addRelocation(){
 if(document.querySelectorAll('.relocation-area').length>=29)return;
 const row=document.createElement('div');row.className='sublot-row relocation-row';
 const label=document.createElement('label'),name=document.createElement('span'),input=document.createElement('input');input.className='relocation-area';input.type='text';input.inputMode='decimal';input.dataset.numeric='decimal';input.placeholder='sqm';label.append(name,input);
 const remove=document.createElement('button');remove.type='button';remove.className='remove';remove.textContent='×';
 const renumberLots=()=>document.querySelectorAll('.relocation-row').forEach((r,i)=>{r.querySelector('span').textContent='Lot '+(i+2);r.querySelector('button').setAttribute('aria-label','Remove lot '+(i+2));});
 remove.addEventListener('click',()=>{row.remove();renumberLots();render();});row.append(label,remove);$('relocation-lots').append(row);renumberLots();render();input.focus();
}
// Reject invalid keystrokes/pastes without turning them into a different number.
document.addEventListener('beforeinput',e=>{const t=e.target;if(!t.dataset.numeric||e.data===null)return;const proposed=t.value.slice(0,t.selectionStart)+e.data+t.value.slice(t.selectionEnd);const pattern=t.dataset.numeric==='integer'?/^\d*$/:/^\d*(\.\d*)?$/;if(!pattern.test(proposed))e.preventDefault();});
document.addEventListener('paste',e=>{const t=e.target;if(!t.dataset.numeric)return;const pasted=e.clipboardData.getData('text'),proposed=t.value.slice(0,t.selectionStart)+pasted+t.value.slice(t.selectionEnd);if(!(t.dataset.numeric==='integer'?/^\d*$/:/^\d*(\.\d*)?$/).test(proposed))e.preventDefault();});
$('calculator').addEventListener('input',render);$('calculator').addEventListener('change',render);$('calculator').addEventListener('submit',e=>e.preventDefault());$('add').addEventListener('click',()=>addSublot());
$('add-relocation').addEventListener('click',addRelocation);
$('copy-quotation').addEventListener('click',async()=>{
 if(!lastResult?.ok)return;
 const text=$('quotation-text').value;
 try{await navigator.clipboard.writeText(text);$('copy-status').textContent='Copied. Ready to paste.';}
 catch{$('quotation-text').focus();$('quotation-text').select();let copied=false;try{copied=document.execCommand('copy');}catch{}$('copy-status').textContent=copied?'Copied. Ready to paste.':'Text selected. Use Copy on your device.';}
});
function settingsForm(){
 $('rates').replaceChildren();
 const groups=[['Relocation',[7,8,9,10,11]],['Multi-lot discounts',[43,44]],['Subdivision',[14,15,16,17,18,19]],['Area surcharges',[22,23,24,25,26,27,28,29,30,31]],['Travel, report & rounding',[34,35,36,37,39,42]]];
 for(const[title,keys]of groups){const group=document.createElement('details');const heading=document.createElement('summary');heading.textContent=title;group.append(heading);const grid=document.createElement('div');grid.className='settings-grid';for(const k of keys){const label=document.createElement('label');label.textContent=config.labels[k];const input=document.createElement('input');input.type='text';input.inputMode='decimal';input.dataset.numeric='decimal';input.dataset.rate=k;input.value=config.rates[k];label.append(input);grid.append(label);}group.append(grid);$('rates').append(group);}
 $('destination-settings').replaceChildren();
 config.destinations.forEach((d,i)=>{const row=document.createElement('div');row.className='destination-setting';const label=document.createElement('label');label.textContent=d.name;const input=document.createElement('input');input.type='text';input.inputMode='decimal';input.dataset.numeric='decimal';input.dataset.destination=i;input.value=d.km===null?'':d.km;input.placeholder='No preset';input.setAttribute('aria-label',d.name+' distance in km');label.append(input);row.append(label);if(d.note){const note=document.createElement('small');note.textContent=d.note;row.append(note);}$('destination-settings').append(row);});
 $('settings-message').textContent='';
}
let settingsUnlocked=false;
$('settings-open').addEventListener('click',()=>{settingsUnlocked=false;$('password-form').reset();$('password-error').textContent='';$('password-dialog').showModal();$('settings-password').focus();});
$('password-cancel').addEventListener('click',()=>$('password-dialog').close());
$('password-dialog').addEventListener('close',()=>$('password-form').reset());
$('password-form').addEventListener('submit',async e=>{
 e.preventDefault();const entered=$('settings-password').value;
 try{
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(entered));
  const digest=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
  if(!$('password-dialog').open)return;
  if(digest!==SETTINGS_PASSWORD_HASH){$('password-error').textContent='Incorrect password. Try again.';$('settings-password').value='';$('settings-password').focus();return;}
  settingsUnlocked=true;$('password-dialog').close();settingsForm();$('settings').showModal();
 }catch{$('password-error').textContent='Open this file directly, or use HTTPS, to unlock settings.';}
});
$('settings-close').addEventListener('click',()=>$('settings').close());
$('settings').addEventListener('close',()=>{settingsUnlocked=false;$('rates').replaceChildren();$('destination-settings').replaceChildren();});
function readSettings(){const draft=clone(config);document.querySelectorAll('[data-rate]').forEach(e=>draft.rates[e.dataset.rate]=numeric(e.value)?+e.value:e.value);document.querySelectorAll('[data-destination]').forEach(e=>draft.destinations[+e.dataset.destination].km=e.value===''?null:numeric(e.value)?+e.value:e.value);return draft;}
function saveSettings(){if(!settingsUnlocked)return false;const draft=readSettings(),error=validateConfig(draft);if(error){$('settings-message').textContent=error;return false;}config=draft;try{localStorage.setItem(storageKey,JSON.stringify(config));$('settings-message').textContent='Saved in this browser. Download updated HTML to share these settings.';}catch{$('settings-message').textContent='Applied for this session. Download updated HTML to retain these settings.';}locations();render();return true;}
$('settings-save').addEventListener('click',saveSettings);
$('download').addEventListener('click',()=>{if(!saveSettings())return;const doc=document.documentElement.cloneNode(true);doc.querySelector('#pricing-config').textContent=JSON.stringify(config).replaceAll('<','\\u003c');doc.querySelector('#settings').removeAttribute('open');const blob=new Blob(['<!doctype html>\n'+doc.outerHTML],{type:'text/html;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ROSH '+config.region+' Pricing v.01.html';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);});
$('reset-settings').addEventListener('click',()=>{if(!settingsUnlocked||!confirm('Restore the rates and distances supplied in this HTML file?'))return;config=withMultiDefaults(clone(FILE_CONFIG));try{localStorage.removeItem(storageKey);}catch{}settingsForm();locations();render();});
// Clear transient DOM when opening a downloaded copy.
$('sublots').replaceChildren();$('relocation-lots').replaceChildren();$('calculator').reset();locations();render();
