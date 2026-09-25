import fs from 'node:fs/promises';
import {SpreadsheetFile,FileBlob} from '@oai/artifact-tool';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const result=[];
for(const [region,path,origin,dest,min]of [['Zamboanga','Zamboanga/Zamboanga_Pricing.xlsx','Tetuan','Tetuan',21000],['Negros','outputs/negros-pricing-20260921/Negros_Pricing.xlsx','Bacolod','Bacolod City',21000]]){
 const w=await SpreadsheetFile.importXlsx(await FileBlob.load(`${root}/${path}`)),q=w.worksheets.getItem(region+' Pricing'),s=w.worksheets.getItem('Pricing Settings');
 const v=(sh,c)=>sh.getRange(c).values[0][0],set=(sh,c,x)=>sh.getRange(c).values=[[x]];
 const mode=v(q,'G8');
 const r={region,mode,destinations:s.getRange('G7:H150').values.filter(a=>a[0]),rates:s.getRange('B7:D39').values,checks:[]};
 w.recalculate();
 for(const [sh,range,label]of [[q,'B2:G42','pricing'],[s,'B6:D39','rates']]){const p=await w.render({sheetName:sh.name,range,scale:1,format:'png'});await fs.writeFile(`${root}/Zamboanga/research/previews/review-${region}-${label}.png`,new Uint8Array(await p.arrayBuffer()));}
 const check=(label,actual,expected)=>r.checks.push({label,actual,expected,pass:actual===expected});
 function job(service,area,sub=200,km=0){set(q,'C7',service);set(q,'C8',area);set(q,'C9',dest);set(q,'C10','No');q.getRange('C18:C25').values=[[sub],[null],[null],[null],[null],[null],[null],[null]];set(q,'G7',origin);set(q,'G8','Manual km');set(q,'G9',km);w.recalculate();}
 for(const[a,p]of [[999,10000],[1000,13000],[9999,13000],[10000,15000],[14999,15000],[15000,17000],[20000,20000],[50000,35000],[100000,50000]]){job('Relocate',a);check('Relocation '+a,v(q,'G5'),p);}
 job('Original survey',500);check('Original base',v(q,'G5'),30000);
 job('Subdivide',500);check('Subdivision minimum',v(q,'G5'),min);
 for(const sub of [500,501,-1,'x',null]){job('Subdivide',500,sub);check('Invalid sublot '+sub,v(q,'G5'),'');}
 for(const[km,fee]of [[0,0],[4.9,0],[5,500],[10,500],[14.9,500],[15,1000],[235,12000]]){job('Relocate',500,200,km);check('Travel '+km,v(q,'G30'),fee);}
 job('Relocate',500,200,10);check('Intended downward rounding',v(q,'G5'),10000);
 for(const km of [null,-1,'x']){job('Relocate',500,200,km);check('Invalid km '+km,v(q,'G5'),'');}
 job('Original survey',500,200,235);set(q,'C10','Yes');w.recalculate();check('Original report/manual',v(q,'G5'),47000);
 job('Relocate',500);set(q,'G8',mode);w.recalculate();check('Origin preset',v(q,'G30'),0);
 const first=r.destinations[0][0],row=7,old=v(s,'H7');set(q,'C9',first);set(s,'H7',null);w.recalculate();check('Missing preset distance',v(q,'G5'),'');set(s,'H7',old);
 job('Relocate',500);const rate=v(s,'C7');set(s,'C7',11000);w.recalculate();check('Editable base',v(q,'G5'),11000);set(s,'C7',rate);
 job('Relocate',500);console.log(region,(await w.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!',options:{useRegex:true,maxResults:20}})).ndjson);
 result.push(r);console.log(region,r.checks.filter(x=>!x.pass),r.checks.length,'checks',r.destinations.length,'destinations');
}
await fs.writeFile(`${root}/Zamboanga/research/master-review.json`,JSON.stringify(result,null,2));
