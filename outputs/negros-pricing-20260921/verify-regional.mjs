import fs from 'node:fs/promises';
import {SpreadsheetFile,FileBlob} from '@oai/artifact-tool';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
let checks=0;
function eq(a,b,label){if(a!==b)throw Error(`${label}: ${a} != ${b}`);checks++;}
for(const [relative,region,origin,minimum]of [['Zamboanga/Zamboanga_Pricing.xlsx','Zamboanga','Tetuan',21000],['outputs/negros-pricing-20260921/Negros_Pricing.xlsx','Negros','Bacolod',21000]]){
 const w=await SpreadsheetFile.importXlsx(await FileBlob.load(`${root}/${relative}`));
 const q=w.worksheets.getItem(`${region} Pricing`),s=w.worksheets.getItem('Pricing Settings');
 q.getRange('C7:C10').values=[['Subdivide'],[500],[origin==='Tetuan'?'Tetuan':'Bacolod City'],['No']];
 q.getRange('C18:C25').values=[[200],[null],[null],[null],[null],[null],[null],[null]];
 q.getRange('G7:G10').values=[[origin],['Preset estimate'],[null],[null]];w.recalculate();
 eq(q.getRange('G5').values[0][0],minimum,`${region} reimport subdivision`);
 q.getRange('C18').values=[[500]];w.recalculate();eq(q.getRange('G5').values[0][0],'',`${region} reimport equal area`);
 q.getRange('C7').values=[['Original survey']];q.getRange('C10').values=[['Yes']];q.getRange('G8:G9').values=[['Manual km'],[235]];w.recalculate();
 eq(q.getRange('G5').values[0][0],47000,`${region} reimport original manual/report`);
 q.getRange('G9').values=[[null]];w.recalculate();eq(q.getRange('G5').values[0][0],'',`${region} reimport missing manual distance`);
 q.getRange('G8').values=[['Preset estimate']];q.getRange('C7').values=[['Relocate']];q.getRange('C10').values=[['No']];
 if(region==='Zamboanga'){
  q.getRange('C9').values=[['Dulian (Upper Pasonanca)']];w.recalculate();
  eq(q.getRange('G30').values[0][0],500,'Zamboanga reimport preset travel');
  const p=await w.render({sheetName:q.name,range:'B6:G12',scale:1.5,format:'png'});await fs.writeFile(`${root}/Zamboanga/research/previews/long-location-check.png`,new Uint8Array(await p.arrayBuffer()));
 }
 s.getRange('C7').values=[[11000]];w.recalculate();eq(q.getRange('G5').values[0][0],11000,`${region} reimport live rate`);
}
console.log(`${checks} export/reimport checks passed. Saved workbook inputs unchanged by tests.`);
