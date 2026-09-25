import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {SpreadsheetFile,FileBlob} from '@oai/artifact-tool';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const out=`${root}/outputs/equal-share-review`;
const results=[];
const v=(s,a)=>s.getRange(a).values[0][0],put=(s,a,x)=>s.getRange(a).values=[[x]];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const region of ['Negros','Zamboanga']){
 const path=`${root}/${region}/${region}_Pricing_Equal_Share.xlsx`,before=hash(await fs.readFile(path));
 const w=await SpreadsheetFile.importXlsx(await FileBlob.load(path)),q=w.worksheets.getItem(`${region} Pricing`),s=w.worksheets.getItem('Pricing Settings');
 const r={region,scenarios:0,assertions:0,failures:[],observations:[],examples:[]};results.push(r);
 const check=(label,got,expected)=>{r.assertions++;if(typeof got==='number'&&typeof expected==='number'?Math.abs(got-expected)>0.000001:JSON.stringify(got)!==JSON.stringify(expected))r.failures.push({label,got,expected});};
 const originalInputs=Object.fromEntries(['C7:C11','C18:C25','G7:G11'].map(a=>[a,q.getRange(a).values]));
 const settings=Object.fromEntries([7,8,9,10,11,14,15,16,17,18,19,22,23,24,25,26,27,28,29,30,31,34,35,36,37,39,42].map(n=>[n,v(s,`C${n}`)]));
 const p=n=>settings[n];
 function job(service='Relocate',area=600,mode='Specify sublots',n=3,subs=[200],km=0,report='No'){
  put(q,'C7',service);put(q,'C8',area);put(q,'C10',report);put(q,'C11',mode);put(q,'G11',n);put(q,'G8','Manual km');put(q,'G9',km);
  q.getRange('C18:C25').values=Array.from({length:8},(_,i)=>[subs[i]??null]);r.scenarios++;
 }
 function extra(a,sub){const h=Math.floor(a/10000/p(31))*p(31),tiers=[[p(28),p(29),p(sub?25:22)],[p(29),p(30),p(sub?26:23)],[p(30),Infinity,p(sub?27:24)]];return tiers.reduce((sum,[lo,hi,rate])=>sum+Math.max(0,Math.min(h,hi)-lo)*rate,0);}
 function subBase(a){return a<p(18)?p(15):a<p(19)?p(16):p(17);}
 function expected(service,area,mode,n,subs,km,report){
  let lots;
  if(service==='Subdivide')lots=mode==='Equal Share'?p(14)+(n-1)*subBase(area/n)+n*extra(area/n,true):p(14)+extra(area-subs.reduce((a,b)=>a+b,0),true)+subs.reduce((sum,a)=>sum+(a>0?subBase(a)+extra(a,true):0),0);
  else lots=(service==='Original survey'?p(39):area<p(10)?p(7):area<p(11)?p(8):p(9))+extra(area,false);
  const travel=Math.round(km/p(35))*p(34),total=lots+travel+(report==='Yes'?p(36):0),per=service==='Subdivide'&&mode==='Equal Share'?Math.floor(total/n/p(42))*p(42):null;
  return {lots,travel,total,per,final:per===null?Math.floor(total/p(37))*p(37):per*n};
 }
 function valid(...args){job(...args);const e=expected(...args);check('valid status '+args,v(q,'B12'),'Ready');for(const[a,key]of [['G29','lots'],['G30','travel'],['G32','total'],['G5','final']])check(`${args} ${key}`,v(q,a),e[key]);if(e.per!==null)check('per lot '+args,v(q,'G35'),e.per);check('reconcile',v(q,'G34'),v(q,'G32')+v(q,'G33'));}
 const areas=[0.01,499,999.99,1000,1000.01,4999.99,5000,9999.99,10000,10000.01,14999.99,15000,15000.01,19999.99,20000,49999.99,50000,50000.01,99999.99,100000,100000.01,105000,1000000];
 for(const service of ['Relocate','Original survey'])for(const area of areas)for(const[km,report]of [[0,'No'],[5,'No'],[15,'Yes'],[235,'Yes']])valid(service,area,'Specify sublots',3,[200],km,report);
 for(const a of [0.01,4999.99,5000,9999.99,10000,14999.99,15000,50000,100000])for(const remainder of [0.01,9999.99,15000,55000])valid('Subdivide',a+remainder,'Specify sublots',3,[a],15,'Yes');
 for(const subs of [[200,200],[100,0,200],[100,200,300,400,500,600,700,800],[5000,10000,15000]])valid('Subdivide',subs.reduce((a,b)=>a+b,0)+18000,'Specify sublots',3,subs,0,'No');
 for(const n of [2,3,4,9,10,50,100])for(const areaPer of [0.01,200,1000/3,4999.99,5000,9999.99,10000,14999.99,15000,50000,100000])for(const[km,report]of [[0,'No'],[235,'Yes']])valid('Subdivide',areaPer*n,'Equal Share',n,[-1,'ignored'],km,report);
 for(const service of ['Relocate','Original survey','Subdivide'])for(const area of [null,0,-1,'text',true]){job(service,area);check('bad area',v(q,'G5'),'');}
 for(const n of [null,0,1,-1,2.5,'text',true]){job('Subdivide',600,'Equal Share',n);check('bad equal count',v(q,'G5'),'');}
 for(const subs of [[],[0],[-1],['text'],[600],[601],[300,300],[100,500.01]]){job('Subdivide',600,'Specify sublots',3,subs);check('bad sublot',v(q,'G5'),'');}
 for(const km of [null,-1,'text',true]){job('Subdivide',600,'Equal Share',3,[200],km);check('bad km',v(q,'G5'),'');}
 for(const mode of [null,'bad']){job('Subdivide',600,mode);check('bad mode',v(q,'G5'),'');}
 for(const service of [null,'bad']){job(service);check('bad service',v(q,'G5'),'');}
 for(const report of [null,'bad']){job('Relocate',600,'Specify sublots',3,[200],0,report);check('bad report',v(q,'G5'),'');}
 // Each destination and blank preset across service types, without changing stored settings.
 const destinations=s.getRange('G7:H150').values.filter(a=>a[0]);r.destinationCount=destinations.length;
 for(const[name,km]of destinations)for(const service of ['Relocate','Original survey','Subdivide']){
  job(service,600,'Equal Share',3,[200]);put(q,'G8','Preset estimate');put(q,'C9',name);put(q,'G9','ignored');
  if(km===null){check('blank preset quote '+name,v(q,'G5'),'');}else{check('preset '+name,v(q,'G30'),Math.round(km/p(35))*p(34));check('preset status '+name,v(q,'B12'),'Ready');}
 }
 for(const mode of ['Specify sublots','Equal Share'])for(const km of [0,4.99,5,5.01,14.99,15,15.01,234.99,235])valid('Subdivide',600,mode,3,[200,200],km,'No');
 // Switch away and back without losing manual areas.
 job('Subdivide',600,'Specify sublots',3,[200,200]);check('manual three',v(q,'G5'),29000);put(q,'C11','Equal Share');check('equal three',v(q,'G5'),28500);put(q,'C7','Original survey');check('original after equal',v(q,'G5'),30000);put(q,'C7','Subdivide');put(q,'C11','Specify sublots');check('manual restored',v(q,'G5'),29000);check('manual areas restored',q.getRange('C18:C19').values,[[200],[200]]);
 // Validate rate failures and mode-specific settings independence.
 for(const service of ['Relocate','Original survey','Subdivide']){
  const rows=service==='Relocate'?[7,8,9,10,11,22,23,24,28,29,30,31,34,35,37]:service==='Original survey'?[39,22,23,24,28,29,30,31,34,35,37]:[14,15,16,17,18,19,25,26,27,28,29,30,31,34,35,37];
  for(const row of rows)for(const bad of [null,-1,'text']){job(service);put(s,`C${row}`,bad);check('invalid setting '+service+' C'+row,v(q,'G5'),'');put(s,`C${row}`,p(row));}
 }
 job('Subdivide',600,'Equal Share');for(const bad of [null,0,-1,'text']){put(s,'C42',bad);check('bad equal step',v(q,'G5'),'');}put(s,'C42',p(42));
 job('Relocate');put(s,'C42',null);put(q,'G11','bad');put(q,'C11','bad');check('inactive equal ignored',v(q,'G5'),10000);put(s,'C42',p(42));
 job('Subdivide',600,'Specify sublots');put(s,'C42',null);put(q,'G11','bad');check('manual ignores equal fields',v(q,'G5'),21000);put(s,'C42',p(42));
 job('Subdivide',600,'Equal Share');put(s,'C37',null);r.observations.push({scenario:'Equal Share with unused ordinary rounding setting blank',status:v(q,'B12'),quote:v(q,'G5')});put(s,'C37',p(37));
 job('Subdivide',600,'Equal Share',100,[],0,'No');const noReport=v(q,'G5');put(q,'C10','Yes');r.observations.push({scenario:'100 equal lots: report can be absorbed by rounding',withoutReport:noReport,withReport:v(q,'G5'),unroundedWithReport:v(q,'G32')});
 job('Subdivide',600,'Equal Share',3);put(s,'C42',10000);r.observations.push({scenario:'Equal rounding step above per-lot fee',status:v(q,'B12'),quote:v(q,'G5')});put(s,'C42',p(42));
 // Capture meaningful examples and current previews without saving workbook changes.
 for(const args of [['Relocate',999,'Specify sublots',3,[200],0,'No'],['Relocate',1000,'Specify sublots',3,[200],0,'No'],['Relocate',15000,'Specify sublots',3,[200],0,'No'],['Original survey',20000,'Specify sublots',3,[200],0,'No'],['Subdivide',20000,'Specify sublots',3,[2000],0,'No'],['Subdivide',600,'Equal Share',3,[],0,'No'],['Subdivide',600,'Equal Share',3,[],15,'Yes'],['Subdivide',45000,'Equal Share',3,[],0,'No']]){job(...args);r.examples.push({inputs:args,total:v(q,'G5'),perLot:v(q,'G35')});}
 job('Subdivide',600,'Equal Share',3);w.recalculate();
 r.errorScan=(await w.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!',options:{useRegex:true,maxResults:20}})).ndjson;
 for(const [sh,range,label]of [[q,'B6:G14','controls'],[q,'B29:G49','results'],[s,'B34:D44','settings']]){const blob=await w.render({sheetName:sh.name,range,scale:1.5,format:'png'});await fs.writeFile(`${out}/${region}-audit-${label}.png`,new Uint8Array(await blob.arrayBuffer()));}
 for(const[a,x]of Object.entries(originalInputs))q.getRange(a).values=x;
 check('file unchanged',hash(await fs.readFile(path)),before);
 console.log(JSON.stringify({region,scenarios:r.scenarios,assertions:r.assertions,failures:r.failures,observations:r.observations,examples:r.examples,errorScan:r.errorScan}));
}
await fs.writeFile(`${out}/audit-results.json`,JSON.stringify(results,null,2));
