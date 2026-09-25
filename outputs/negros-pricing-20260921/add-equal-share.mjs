import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {SpreadsheetFile,FileBlob} from '@oai/artifact-tool';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const preview=`${root}/outputs/equal-share-review`;
await fs.mkdir(preview,{recursive:true});
const jobs=[['Negros','outputs/negros-pricing-20260921/Negros_Pricing.xlsx','Negros/Negros_Pricing_Equal_Share.xlsx'],['Zamboanga','Zamboanga/Zamboanga_Pricing.xlsx','Zamboanga/Zamboanga_Pricing_Equal_Share.xlsx']];
const val=(s,a)=>s.getRange(a).values[0][0],set=(s,a,v)=>s.getRange(a).values=[[v]],form=(s,a,v)=>s.getRange(a).formulas=[[v]];
let checks=0;
function eq(a,b,label){if(JSON.stringify(a)!==JSON.stringify(b))throw Error(`${label}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);checks++;}
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const active='AND($C$7="Subdivide",$C$11="Equal Share")';
const ready=`AND(${active},$B$12="Ready")`;
const money='"₱"#,##0;[Red]("₱"#,##0);"₱"0';
for(const [region,source,target] of jobs){
 const before=hash(await fs.readFile(`${root}/${source}`));
 const w=await SpreadsheetFile.importXlsx(await FileBlob.load(`${root}/${source}`));
 const q=w.worksheets.getItem(`${region} Pricing`),s=w.worksheets.getItem('Pricing Settings');
 const original={q:q.getRange('B1:K150').formulas,s:s.getRange('B1:K150').formulas,settings:s.getRange('B1:K150').values};
 const inputs=Object.fromEntries(['C7:C10','C18:C25','G7:G10'].map(a=>[a,q.getRange(a).values]));
 const oldStatus=q.getRange('B12').formulas[0][0];
 set(q,'B11','Subdivision method');set(q,'C11','Specify sublots');set(q,'F11','Total equal lots');set(q,'G11',3);
 for(const a of ['C11','G11'])q.getRange(a).format={fill:'#FFF2CC',font:{name:'Arial',size:11,color:'#164D8D'},verticalAlignment:'center'};
 for(const a of ['B11','F11'])q.getRange(a).format={font:{name:'Arial',size:11,color:'#243447'},wrapText:true,verticalAlignment:'center'};
 q.getRange('B11:G11').format.rowHeight=34;
 q.getRange('G11').setNumberFormat('General');
 q.getRange('C11').dataValidation={rule:{type:'list',values:['Specify sublots','Equal Share']}};
 // B12 validates numeric, integer and minimum count; no arbitrary maximum count.
 q.getRange('G11').dataValidation=null;
 q.getRange('C11').conditionalFormats.addCustom('$C$7<>"Subdivide"',{fill:'#F0F2F4',font:{color:'#84909C'}});
 q.getRange('G11').conditionalFormats.addCustom(`NOT(${active})`,{fill:'#F0F2F4',font:{color:'#84909C'}});
 q.getRange('B17:G25').conditionalFormats.addCustom(active,{fill:'#F0F2F4',font:{color:'#84909C'}});
 // Disable only manual-sublot validation in Equal Share; retain all existing job/rate checks.
 let status=oldStatus.slice(1).replaceAll('AND(C7="Subdivide",COUNT(C18:C25)','AND(C7="Subdivide",C11="Specify sublots",COUNT(C18:C25)').replaceAll('AND(C7="Subdivide",MIN(C18:C25)','AND(C7="Subdivide",C11="Specify sublots",MIN(C18:C25)').replaceAll('AND(C7="Subdivide",SUM(C18:C25)','AND(C7="Subdivide",C11="Specify sublots",SUM(C18:C25)');
 status=`IF(AND(C7="Subdivide",C11<>"Specify sublots",C11<>"Equal Share"),"Choose Specify sublots or Equal Share.",IF(${active},IF(NOT(ISNUMBER(G11)),"Enter the total number of equal lots (at least 2).",IF(OR(G11<2,G11<>INT(G11)),"Equal lots must be a whole number of at least 2.",IF(OR(NOT(ISNUMBER('Pricing Settings'!C42)),'Pricing Settings'!C42<=0),"Enter a positive Equal Share rounding step.",${status}))),${status}))`;
 form(q,'B12','='+status);
 for(let r=17;r<=25;r++)for(const c of ['D','E','F','G']){const a=`${c}${r}`;form(q,a,`=IF(${active},"",${q.getRange(a).formulas[0][0].slice(1)})`);}
 form(q,'C17',`=IF(${active},"",${q.getRange('C17').formulas[0][0].slice(1)})`);
 form(q,'B14',`=IF(${active},"Equal Share: manual sublot entries are ignored. See equal-lot calculation below.",${q.getRange('B14').formulas[0][0].slice(1)})`);
 form(q,'B27',`=IF(${active},"Total equal lots includes the first lot. Enter a whole number of at least 2.","Enter up to 8 additional sublots; the unentered balance is the remaining lot.")`);
 q.getRange('B44:G48').format={font:{name:'Arial',size:11,color:'#243447'},rowHeight:30,verticalAlignment:'center'};
 q.getRange('B44:G44').values=[['Equal-share lots','Area (sqm)','Chargeable ha','Base price','Additional area','Charge per lot']];
 q.getRange('B44:G44').format={fill:'#233C59',font:{name:'Arial',size:11,bold:true,color:'#FFFFFF'},wrapText:true,rowHeight:36};
 set(q,'B45','First equal lot');set(q,'B46','Each additional lot');
 form(q,'C45',`=IF(${ready},$C$8/$G$11,"")`);form(q,'C46',`=IF(${ready},C45,"")`);
 for(const r of [45,46]){
  form(q,`D${r}`,`=IF(${ready},FLOOR(C${r}/10000,'Pricing Settings'!$C$31),"")`);
  form(q,`E${r}`,`=IF(${ready},${r===45?"'Pricing Settings'!$C$14":`IF(C46<'Pricing Settings'!$C$18,'Pricing Settings'!$C$15,IF(C46<'Pricing Settings'!$C$19,'Pricing Settings'!$C$16,'Pricing Settings'!$C$17))`},"")`);
  form(q,`F${r}`,`=IF(${ready},MAX(0,MIN(D${r},'Pricing Settings'!$C$29)-'Pricing Settings'!$C$28)*'Pricing Settings'!$C$25+MAX(0,MIN(D${r},'Pricing Settings'!$C$30)-'Pricing Settings'!$C$29)*'Pricing Settings'!$C$26+MAX(0,D${r}-'Pricing Settings'!$C$30)*'Pricing Settings'!$C$27,"")`);
  form(q,`G${r}`,`=IF(${ready},SUM(E${r}:F${r}),"")`);
 }
 set(q,'B48','Additional lot count');form(q,'C48',`=IF(${ready},G11-1,"")`);
 set(q,'F48','Lot charges');form(q,'G48',`=IF(${ready},G45+C48*G46,"")`);
 q.getRange('C45:D46').setNumberFormat('General');q.getRange('C48').setNumberFormat('0');
 q.getRange('E45:G48').setNumberFormat(money);
 q.getRange('B44:G48').conditionalFormats.addCustom(`NOT(${active})`,{fill:'#F0F2F4',font:{color:'#84909C'}});
 form(q,'G29',`=IF($B$12<>"Ready","",IF(${active},G48,SUM(G17:G25)))`);
 set(q,'F35','Equal price / lot');form(q,'G35',`=IF(${ready},FLOOR(G32/G11,'Pricing Settings'!$C$42),"")`);
 form(q,'G33',`=IF($B$12<>"Ready","",IF(${active},G35*G11-G32,FLOOR(G32,'Pricing Settings'!$C$37)-G32))`);
 // G34 remains SUM(G32:G33), so the final quote reconciles with the rounding adjustment.
 q.getRange('F35:G35').format={fill:'#EDF2F7',font:{name:'Arial',size:11,bold:true,color:'#243447'},rowHeight:30};q.getRange('G35').setNumberFormat(money);
 q.getRange('F35:G35').conditionalFormats.addCustom(`NOT(${active})`,{fill:'#F0F2F4',font:{color:'#84909C'}});
 form(q,'B39',`=IF(${active},"Equal Share: divide the total including travel/report; round each lot down by the equal-share step.","The final quote rounds down after all charges are combined.")`);
 set(q,'B49','Equal Share uses full-precision areas. Final quote = equal price per lot × total lots.');
 q.getRange('B49:G49').format={font:{name:'Arial',size:10,color:'#596A7B'},rowHeight:28};
 set(s,'B42','Equal Share step (PHP)');set(s,'C42',500);set(s,'D42','Round each equal lot DOWN by this amount. Used only for Equal Share.');
 s.getRange('B42:D42').format={font:{name:'Arial',size:11,color:'#243447'},rowHeight:48,verticalAlignment:'center',wrapText:true};
 s.getRange('C42').format={fill:'#FFF2CC',font:{color:'#164D8D'}};s.getRange('C42').setNumberFormat(money);
 w.recalculate();
 // Regression: compare old and new calculations directly for the same inputs.
 const baseline=await SpreadsheetFile.importXlsx(await FileBlob.load(`${root}/${source}`)),bq=baseline.worksheets.getItem(q.name);
 function job(sh,service,area,sub=200,km=0){set(sh,'C7',service);set(sh,'C8',area);set(sh,'C10','No');set(sh,'G8','Manual km');set(sh,'G9',km);sh.getRange('C18:C25').values=[[sub],[null],[null],[null],[null],[null],[null],[null]];}
 const cases=[];
 for(const service of ['Relocate','Original survey'])for(const area of [500,999,1000,9999,10000,15000,20000,50000,100000,150000])cases.push([service,area,200,15]);
 for(const sub of [200,500,501,-1,'x',null])cases.push(['Subdivide',500,sub,0]);
 for(const area of [4999,5000,9999,10000,15000,55000,105000])cases.push(['Subdivide',area+20000,area,235]);
 for(const km of [null,-1,'x',0,4.9,5,14.9,15,235])cases.push(['Relocate',500,200,km]);
 for(const c of cases){job(q,...c);job(bq,...c);w.recalculate();baseline.recalculate();for(const a of ['B12','G5','G29:G34'])eq(q.getRange(a).values,bq.getRange(a).values,`${region} original mode ${c} ${a}`);}
 function equal(area,n,km=0,report='No'){job(q,'Subdivide',area,'ignored text',km);set(q,'C10',report);set(q,'C11','Equal Share');set(q,'G11',n);w.recalculate();}
 function surcharge(area){const h=Math.floor((area/10000)/val(s,'C31'))*val(s,'C31');return Math.max(0,Math.min(h,val(s,'C29'))-val(s,'C28'))*val(s,'C25')+Math.max(0,Math.min(h,val(s,'C30'))-val(s,'C29'))*val(s,'C26')+Math.max(0,h-val(s,'C30'))*val(s,'C27');}
 for(const [area,n,km,report]of [[600,3,0,'No'],[600,2,0,'No'],[1000,3,0,'No'],[600,3,15,'Yes'],[14997,3,0,'No'],[15000,3,0,'No'],[29997,3,0,'No'],[30000,3,0,'No'],[45000,3,0,'No'],[300000,3,235,'Yes'],[600,10,0,'No'],[100000,100,0,'No']]){
  equal(area,n,km,report);const a=area/n,base=a<val(s,'C18')?val(s,'C15'):a<val(s,'C19')?val(s,'C16'):val(s,'C17');
  const lot=val(s,'C14')+(n-1)*base+n*surcharge(a),total=lot+Math.round(km/val(s,'C35'))*val(s,'C34')+(report==='Yes'?val(s,'C36'):0),per=Math.floor(total/n/val(s,'C42'))*val(s,'C42');
  eq(val(q,'B12'),'Ready',`${region} equal valid`);eq(val(q,'G29'),lot,'equal lot charges');eq(val(q,'C45'),a,'equal area');eq(val(q,'G35'),per,'equal per lot');eq(val(q,'G5'),per*n,'equal total');
 }
 for(const n of [null,'x',0,1,-1,2.5]){equal(600,n);eq(val(q,'G5'),'','invalid equal count');}
 for(const area of [null,0,-1,'x']){equal(area,3);eq(val(q,'G5'),'','invalid equal area');}
 equal(600,3);for(const step of [null,0,-1,'x']){set(s,'C42',step);w.recalculate();eq(val(q,'G5'),'','invalid equal step');}set(s,'C42',1000);w.recalculate();eq(val(q,'G35'),9000,'editable equal rounding');set(s,'C42',500);
 equal(600,3);const rate=val(s,'C15');set(s,'C15',9000);w.recalculate();eq(val(q,'G5'),30000,'equal uses editable sublot rate');set(s,'C15',rate);
 for(const service of ['Relocate','Original survey']){job(q,service,500);set(q,'G11','x');set(s,'C42',null);w.recalculate();eq(val(q,'G5'),service==='Relocate'?10000:30000,'inactive equal controls ignored');}set(s,'C42',500);
 equal(600,3);const er=await w.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!',options:{useRegex:true,maxResults:10}});console.log(region,er.ndjson);
 const render=async(sh,range,name)=>{const p=await w.render({sheetName:sh.name,range,scale:1.2,format:'png'});await fs.writeFile(`${preview}/${region}-${name}.png`,new Uint8Array(await p.arrayBuffer()));};
 set(q,'C18',200);w.recalculate();await render(q,'B2:G49','equal');await render(s,'B38:D44','setting');
 // Restore all original job inputs. New mode defaults to Specify sublots.
 for(const[a,v]of Object.entries(inputs))q.getRange(a).values=v;set(q,'C11','Specify sublots');set(q,'G11',3);w.recalculate();
 await render(q,'B2:G49','default');
 const expectedSettings=original.settings.map(r=>[...r]);expectedSettings[41][0]='Equal Share step (PHP)';expectedSettings[41][1]=500;expectedSettings[41][2]='Round each equal lot DOWN by this amount. Used only for Equal Share.';
 const afterSettings=s.getRange('B1:K150').values;
 for(let r=0;r<150;r++)for(let c=0;c<10;c++)if(!original.s[r]?.[c])eq(afterSettings[r][c],expectedSettings[r][c],`setting ${String.fromCharCode(66+c)}${r+1} preserved`);
 eq(s.getRange('B1:K150').formulas,original.s,'existing settings formulas preserved');
 const allowed=new Set(['B12','B14','C17','G29','G33','B39']);for(let r=17;r<=25;r++)for(const c of ['D','E','F','G'])allowed.add(`${c}${r}`);
 for(let r=0;r<150;r++)for(let c=0;c<10;c++){const f=original.q[r]?.[c];if(f&&!allowed.has(String.fromCharCode(66+c)+(r+1)))eq(q.getCell(r,c+1).formulas[0][0],f,'unrelated formula preserved');}
 await fs.mkdir(`${root}/${target.substring(0,target.lastIndexOf('/'))}`,{recursive:true});
 await(await SpreadsheetFile.exportXlsx(w)).save(`${root}/${target}`);
 const re=await SpreadsheetFile.importXlsx(await FileBlob.load(`${root}/${target}`)),rq=re.worksheets.getItem(q.name);
 eq(rq.getRange('C7:C10').values,inputs['C7:C10'],'export preserves inputs');eq(val(rq,'G5'),val(q,'G5'),'export default total');
 job(rq,'Subdivide',600,'ignored');set(rq,'C11','Equal Share');set(rq,'G11',3);re.recalculate();eq(val(rq,'G5'),28500,'export equal example total');eq(val(rq,'G35'),9500,'export equal price');
 eq(hash(await fs.readFile(`${root}/${source}`)),before,'source workbook byte-for-byte unchanged');
 console.log(`${region}: saved ${target}; ${checks} cumulative checks passed.`);
}
await fs.writeFile(`${preview}/verification.txt`,`${checks} checks passed; original workbooks unchanged. Calculation engine: artifact-tool; native Excel not exercised.\n`);
