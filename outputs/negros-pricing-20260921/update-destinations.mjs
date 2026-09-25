import fs from 'node:fs/promises';
import {SpreadsheetFile,FileBlob} from '@oai/artifact-tool';
import {refineDestinationLabels,simplifyNumberDisplay} from './shared-pricing.mjs';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const preview=`${root}/Zamboanga/research/previews`;
const paths={Zamboanga:`${root}/Zamboanga/Zamboanga_Pricing.xlsx`,Negros:`${root}/outputs/negros-pricing-20260921/Negros_Pricing.xlsx`};
const edit=process.argv.includes('--edit');
let checks=0;
function eq(a,b,label){if(JSON.stringify(a)!==JSON.stringify(b))throw Error(`${label}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);checks++;}
const value=(sh,c)=>sh.getRange(c).values[0][0];
const set=(sh,c,x)=>sh.getRange(c).values=[[x]];
for(const [region,path] of Object.entries(paths)){
 if(process.argv.includes('--negros-only')&&region!=='Negros')continue;
 if(process.argv.includes('--zamboanga-only')&&region!=='Zamboanga')continue;
 const w=await SpreadsheetFile.importXlsx(await FileBlob.load(path));
 const q=w.worksheets.getItem(`${region} Pricing`),s=w.worksheets.getItem('Pricing Settings');
 const data={inputs:q.getRange('B6:G12').values,formulas:q.getRange('B6:G42').formulas,settings:s.getRange('B1:K150').values};
 if(edit){
  let rates=s.getRange('C7:C39').values;
  const originalInputs=Object.fromEntries(['C7:C10','C18:C25','G7:G10'].map(a=>[a,q.getRange(a).values]));
  refineDestinationLabels(q,s,region);
  if(process.argv.includes('--align-prices')){
   if(region==='Zamboanga'){
    const n=await SpreadsheetFile.importXlsx(await FileBlob.load(paths.Negros));
    const ns=n.worksheets.getItem('Pricing Settings');
    for(const r of [7,8,9,10,11,14,15,16,17,18,19,22,23,24,25,26,27,28,29,30,31,34,35,36,37,39])set(s,`C${r}`,value(ns,`C${r}`));
    rates=s.getRange('C7:C39').values;
   }
   simplifyNumberDisplay(q,s);
  }
  let expectedRows=null;
  if(region==='Zamboanga'){
   const rows=JSON.parse(await fs.readFile(`${root}/Zamboanga/research/reviewed-distances.json`,'utf8'));
   eq(rows.length,99,'98 barangays plus San Ramon');
   const current=new Map(s.getRange('G7:H150').values.filter(r=>r[0]));
   const renames=new Map();
   for(const x of rows){
    let name=x.name.replace('Sinunuc','Sinunoc').replace('San Jose Cawa-Cawa','San Jose Cawa-cawa').replace('Talon-Talon','Talon-talon');
    if(name.startsWith('Zone '))name='Barangay '+name.replace(' (Poblacion)','');
    if(name==='San Ramon')name='San Ramon (Talisayan locality)';
    if(x.island)name+=' (island)';
    renames.set(x.name,name);x.display=name;
    // Preserve any user-edited km that differ from the reviewed source.
    const currentKey=current.has(name)?name:x.name;
    if(current.has(currentKey)&&current.get(currentKey)!==x.old&&current.get(currentKey)!==x.km){x.km=current.get(currentKey);x.basis='User-edited preset retained.';}
    if(x.km===undefined){x.km=current.get(x.name)??null;x.basis='Source estimate retained; reference endpoint not confirmed.';}
   }
   rows.sort((a,b)=>a.display.localeCompare(b.display));
   expectedRows=rows;
   eq(new Set(rows.map(x=>x.display)).size,99,'Unique destination names');
   s.getRange('G7:H150').clear({applyTo:'contents'});s.getRange('K7:K150').clear({applyTo:'contents'});
   s.getRange('G7:H105').values=rows.map(x=>[x.display,x.km]);
   s.getRange('K7:K105').values=rows.map(x=>[x.basis+'.'+(x.name==='San Ramon'?' Locality within Talisayan.':'')]);
   s.getRange('G7:K105').format.rowHeight=48;
   s.getRange('K7:K105').format={font:{name:'Arial',size:10,color:'#596A7B'},wrapText:true,verticalAlignment:'center'};
   s.getRange('G7:G105').format.wrapText=true;
   set(q,'C9',renames.get(value(q,'C9'))??value(q,'C9'));
   const texts={
    G2:'Tetuan Barangay Hall reference',G3:'98 barangays + San Ramon locality. Island pricing retained.',G4:'Approximate km. Use Manual km for the actual survey site.',
    D46:'Edit G7:H150. Keep names unique. A blank preset requires Manual km or a supplied estimate.',
    D47:'Road estimates use mapped halls or locality centres. Route notes identify retained source estimates.',
    D48:'Reference: Tetuan Barangay Hall. One-way travel km; no return-trip multiplier.',
    D51:'98 PSA barangays plus San Ramon (Talisayan locality). Checked 22 Sep 2026.',
    D52:'PSA barangay list: https://psa.gov.ph/classification/psgc/barangays/0931700000',
    D53:'Tetuan Barangay Hall: 6.9175351 N, 122.0909369 E. User-approved reference near the office.',
    D59:'Manual km replaces the preset. For islands, keep the same travel rate; no additional island surcharge.',
    D55:process.argv.includes('--align-prices')?'Approved prices and thresholds match Negros, including the PHP 13,000 remaining-lot base.':value(s,'D55'),
    B62:'Map sources',D62:'Road estimates: OpenStreetMap contributors (ODbL), Nominatim and OSRM; retrieved 22 Sep 2026. https://www.openstreetmap.org/copyright | https://project-osrm.org/',
    B63:'Distance basis',D63:'One-way mapped driving routes, rounded to 0.1 km. Halls are preferred; centre endpoints are labelled. These are planning estimates, not actual survey-site routes.',
    B64:'Island names',D64:'City CLUP identifies island destinations. Existing island km are retained. https://zamboangacity.gov.ph/wp-content/uploads/2026/04/Volume-I.-2016-2025-CLUP-Zamboanga-City.pdf',
    B65:'Missing island presets',D65:'Landang Laum, Manalipa and Tumitus: enter Manual km or a supported preset in column H. No zero-distance assumption.'
   };
   for(const[c,t]of Object.entries(texts))set(s,c,t);
   s.getRange('B62:D65').format.font={name:'Arial',size:10,color:'#596A7B'};
   s.getRange('D62:D65').format.wrapText=true;
   for(const r of [46,47,48,51,52,53,59,62,63,64,65])s.getRange(`B${r}:D${r}`).format.rowHeight=[62,64].includes(r)?112:76;
   set(q,'B41','Reference: Tetuan Barangay Hall. Manual km replaces the preset for the actual site.');
   set(q,'B42','Island labels identify destinations; the same travel formula applies. Blank presets require Manual km.');
   // Keep the existing quote gate, with actionable wording for a missing preset.
   q.getRange('B12').formulas=[[q.getRange('B12').formulas[0][0].replace('Enter the destination distance.','Enter a preset distance or choose Manual km.')]];
  }
  w.recalculate();
  eq(s.getRange('C7:C39').values,rates,`${region}: prices and thresholds preserved`);
  const saved=Object.fromEntries(['C7:C10','C18:C25','G7:G10'].map(a=>[a,q.getRange(a).values]));
  const baseline=value(q,'G5');
  if(expectedRows){
   set(q,'G8','Preset estimate');
   for(const x of expectedRows){
    set(q,'C9',x.display);w.recalculate();
    eq(value(q,'G30'),x.km===null?'':Math.round(x.km/value(s,'C35'))*value(s,'C34'),`Travel lookup: ${x.display}`);
    if(x.island&&x.old!==null)eq(x.km,x.old,`Island preset unchanged: ${x.name}`);
    if(x.km===null)eq(value(q,'G5'),'','Missing preset suppresses quote');
   }
  }else{
   eq(s.getRange('G7:H150').values,data.settings.slice(6,150).map(r=>r.slice(5,7)),'Negros distance values unchanged');
  }
  set(q,'G8','Manual km');set(q,'G9',235);w.recalculate();eq(value(q,'G30'),Math.round(235/value(s,'C35'))*value(s,'C34'),`${region}: manual travel`);
  set(q,'G9',null);w.recalculate();eq(value(q,'G5'),'','Blank manual km suppresses quote');
  set(q,'G9',0);w.recalculate();eq(value(q,'G30'),0,'Explicit zero km valid');
  for(const[a,v]of Object.entries(saved))q.getRange(a).values=v;
  w.recalculate();eq(value(q,'G5'),baseline,`${region}: original quote inputs restored`);
  console.log((await w.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:20},summary:`${region} error scan`})).ndjson);
  const views=[[q,'B2:G42','pricing'],[s,'G2:K20','destinations-top'],[s,'B6:D39','rates']];
  if(region==='Zamboanga')views.push([s,'G38:K53','islands'],[s,'G88:K105','destinations-end'],[s,'B46:D65','references']);
  for(const[sh,range,label]of views){const p=await w.render({sheetName:sh.name,range,scale:1.2,format:'png'});await fs.writeFile(`${preview}/${region.toLowerCase()}-updated-${label}.png`,new Uint8Array(await p.arrayBuffer()));}
  if(process.argv.includes('--preview-only')){console.log(`Prepared ${region}; ${checks} checks passed; master not saved.`);continue;}
  await (await SpreadsheetFile.exportXlsx(w)).save(path);
  const reopened=await SpreadsheetFile.importXlsx(await FileBlob.load(path));reopened.recalculate();
  eq(reopened.worksheets.getItem(q.name).getRange('G5').values[0][0],baseline,`${region}: exported quote`);
  eq(reopened.worksheets.getItem(s.name).getRange('C7:C39').values,rates,`${region}: exported rates`);
  if(expectedRows)eq(reopened.worksheets.getItem(s.name).getRange('G7:H105').values,expectedRows.map(x=>[x.display,x.km]),'Exported destination table');
  console.log(`Updated ${region} in place.`);
  continue;
 }
 await fs.writeFile(`${root}/Zamboanga/research/${region.toLowerCase()}-before-distance-update.json`,JSON.stringify(data,null,2));
 for(const [sheet,range,label]of [[q,'B2:G42','pricing'],[s,'G2:K17','destinations']]){
  const p=await w.render({sheetName:sheet.name,range,scale:1.2,format:'png'});
  await fs.writeFile(`${preview}/${region.toLowerCase()}-before-${label}.png`,new Uint8Array(await p.arrayBuffer()));
 }
 console.log(region,JSON.stringify(data.inputs));
}
if(edit)console.log(`${checks} distance and preservation checks passed.`);
