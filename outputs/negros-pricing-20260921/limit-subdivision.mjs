import fs from 'node:fs/promises';
import {SpreadsheetFile,FileBlob} from '@oai/artifact-tool';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
let checks=0;
const eq=(a,b,label)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw Error(`${label}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);checks++;};
const put=(s,a,v)=>s.getRange(a).values=[[v]],v=(s,a)=>s.getRange(a).values[0][0],f=(s,a,x)=>s.getRange(a).formulas=[[x]];
for(const region of ['Negros','Zamboanga']){
 const path=`${root}/${region}/${region}_Pricing_Equal_Share.xlsx`;
 const w=await SpreadsheetFile.importXlsx(await FileBlob.load(path)),q=w.worksheets.getItem(`${region} Pricing`),s=w.worksheets.getItem('Pricing Settings');
 const saved=Object.fromEntries(['C7:C11','C18:C25','G7:G11'].map(a=>[a,q.getRange(a).values]));
 const rates=s.getRange('B1:K150').values;
 const oldTotal=v(q,'G5');
 // Extend manual inputs without moving existing controls or formula cells.
 q.getRange('B51:G51').copyFrom(q.getRange('B16:G16'),'all');
 q.getRange('B51:G51').values=[['Additional sublots','Area (sqm)','Chargeable ha','Base price','Additional area','Lot charge']];
 for(let row=52;row<=60;row++){
  q.getRange(`B${row}:G${row}`).copyFrom(q.getRange('B18:G18'),'all');
  put(q,`B${row}`,`Sublot ${row-42}`);put(q,`C${row}`,null);
  for(const col of ['D','E','F','G'])f(q,`${col}${row}`,q.getRange(`${col}18`).formulas[0][0].replace(/\b([C-G])18\b/g,(_,c)=>c+row));
 }
 q.getRange('B51:G51').format.rowHeight=32;
 q.getRange('B51:G51').format={fill:'#233C59',font:{name:'Arial',size:11,bold:true,color:'#FFFFFF'},wrapText:true,rowHeight:32,verticalAlignment:'center'};
 q.getRange('B52:G60').format={font:{name:'Arial',size:11,color:'#243447'},rowHeight:28,verticalAlignment:'center'};
 q.getRange('C52:C60').format={fill:'#FFF2CC',font:{name:'Arial',size:11,color:'#164D8D'}};
 q.getRange('C52:D60').setNumberFormat('General');
 q.getRange('E52:G60').setNumberFormat('"₱"#,##0;[Red]("₱"#,##0);"₱"0');
 q.getRange('B52:G60').conditionalFormats.deleteAll();
 q.getRange('B52:G60').conditionalFormats.addCustom('OR($C$7<>"Subdivide",$C$11="Equal Share")',{fill:'#F0F2F4',font:{color:'#84909C'}});
 for(const a of ['B12','C17'])f(q,a,q.getRange(a).formulas[0][0].replace(/C18:C25(?!,C52:C60)/g,'C18:C25,C52:C60'));
 f(q,'B12',q.getRange('B12').formulas[0][0].replaceAll('OR(G11<2,G11<>INT(G11))','OR(G11<2,G11>18,G11<>INT(G11))').replaceAll('Enter the total number of equal lots (at least 2).','Enter the total number of equal lots (2 to 18).').replaceAll('Equal lots must be a whole number of at least 2.','Equal lots must be a whole number from 2 to 18.'));
 f(q,'G29',q.getRange('G29').formulas[0][0].replace('SUM(G17:G25)','SUM(G17:G25,G52:G60)'));
 f(q,'B14','=IF(AND(C7="Subdivide",C11="Equal Share"),"Equal Share: enter 2 to 18 total lots. Manual sublot entries are ignored.",IF(C7="Subdivide","Enter Sublots 2–9 here; Sublots 10–18 are below. Sublot 1 is the remainder.","Enter the full lot area above. Sublot entries are ignored for this service."))');
 f(q,'B27','=IF(AND(C7="Subdivide",C11="Equal Share"),"Total equal lots includes the first lot. Enter a whole number from 2 to 18.","Maximum 18 total lots: 17 additional sublots plus the remainder. More inputs in rows 52–60.")');
 put(q,'B61','All entered sublots are deducted from the mother lot. A positive remainder is required.');
 q.getRange('B61:G61').format={font:{name:'Arial',size:10,color:'#596A7B'},rowHeight:26};
 w.recalculate();eq(v(q,'G5'),oldTotal,'default quote preserved');
 function job(service,mode,n=3){put(q,'C7',service);put(q,'C8',1800);put(q,'C10','No');put(q,'C11',mode);put(q,'G11',n);put(q,'G8','Manual km');put(q,'G9',0);q.getRange('C18:C25').values=Array.from({length:8},()=>[null]);q.getRange('C52:C60').values=Array.from({length:9},()=>[null]);}
 job('Subdivide','Specify sublots');q.getRange('C18:C25').values=Array.from({length:8},()=>[100]);q.getRange('C52:C60').values=Array.from({length:9},()=>[100]);
 eq(v(q,'C17'),100,'18-lot remainder');eq(v(q,'G5'),149000,'18 manual lots');eq(v(q,'G60'),8000,'last sublot charged');
 put(q,'C11','Equal Share');put(q,'G11',18);eq(v(q,'G5'),144000,'18 equal lots');eq(v(q,'G35'),8000,'18 equal price');
 for(const n of [19,100,0,1,2.5,null,'text']){put(q,'G11',n);eq(v(q,'G5'),'','invalid equal count '+n);}
 for(const n of [2,3,9,10,17,18]){put(q,'G11',n);eq(v(q,'B12'),'Ready','valid equal count '+n);}
 put(q,'C11','Specify sublots');eq(v(q,'G5'),149000,'manual return');
 for(const bad of [-1,'text',201]){put(q,'C60',bad);eq(v(q,'G5'),'','extended sublot rejected '+bad);}
 put(q,'C60',200);eq(v(q,'G5'),'','zero remainder rejected');put(q,'C60',100);
 job('Subdivide','Specify sublots');put(q,'C8',20000);put(q,'C60',2000);eq(v(q,'G5'),23000,'only last row entered');
 for(const service of ['Relocate','Original survey']){put(q,'C7',service);put(q,'C60','ignored');put(q,'G11',19);eq(v(q,'G5'),service==='Relocate'?20000:35000,'unrelated service unchanged');}
 job('Subdivide','Equal Share',3);put(q,'C8',600);put(q,'C60','ignored');eq(v(q,'G5'),28500,'equal ignores extended manual input');
 for(const [service,area,total]of [['Relocate',999,10000],['Relocate',1000,13000],['Relocate',15000,17000],['Original survey',20000,35000]]){job(service,'Specify sublots');put(q,'C8',area);eq(v(q,'G5'),total,'service regression');}
 // Preview full 18-lot manual use, then restore all original inputs for delivery.
 job('Subdivide','Specify sublots');q.getRange('C18:C25').values=Array.from({length:8},()=>[100]);q.getRange('C52:C60').values=Array.from({length:9},()=>[100]);w.recalculate();
 for(const[range,label]of [['B51:G61','extended'],['B6:G14','controls']]){const img=await w.render({sheetName:q.name,range,scale:1.3,format:'png'});await fs.writeFile(`${root}/outputs/equal-share-review/${region}-18-${label}.png`,new Uint8Array(await img.arrayBuffer()));}
 for(const[a,x]of Object.entries(saved))q.getRange(a).values=x;q.getRange('C52:C60').values=Array.from({length:9},()=>[null]);w.recalculate();
 eq(v(q,'G5'),oldTotal,'original inputs restored');
 // Compare static settings; formula caches are recalculated, not settings edits.
 const after=s.getRange('B1:K150').values,sf=s.getRange('B1:K150').formulas;
 for(let r=0;r<150;r++)for(let c=0;c<10;c++)if(!sf[r][c])eq(after[r][c],rates[r][c],'setting preserved');
 console.log(region,(await w.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!',options:{useRegex:true,maxResults:10}})).ndjson);
 await(await SpreadsheetFile.exportXlsx(w)).save(path);
 const re=await SpreadsheetFile.importXlsx(await FileBlob.load(path)),rq=re.worksheets.getItem(q.name);
 eq(v(rq,'G5'),oldTotal,'saved default total');put(rq,'C7','Subdivide');put(rq,'C11','Equal Share');put(rq,'G11',19);eq(v(rq,'G5'),'','saved rejects 19');put(rq,'G11',18);put(rq,'C8',1800);put(rq,'G8','Manual km');put(rq,'G9',0);put(rq,'C10','No');eq(v(rq,'G5'),144000,'saved accepts 18');
 console.log(`${region} saved and checked.`);
}
console.log(`${checks} calculation and preservation checks passed.`);
