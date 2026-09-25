import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {SpreadsheetFile,FileBlob} from '@oai/artifact-tool';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
for(const region of ['Negros','Zamboanga']){
 const path=`${root}/${region}/${region}_Pricing_Equal_Share.xlsx`;
 const w=await SpreadsheetFile.importXlsx(await FileBlob.load(path));
 const q=w.worksheets.getItem(region+' Pricing'),s=w.worksheets.getItem('Pricing Settings');
 const before=s.getRange('B1:K150').values,formulas=q.getRange('B1:K65').formulas;
 s.getRange('C10').values=[[2000]];
 const saved=Object.fromEntries(['C7','C8','C10','G8','G9'].map(a=>[a,q.getRange(a).values]));
 q.getRange('C7').values=[['Relocate']];q.getRange('C10').values=[['No']];q.getRange('G8').values=[['Manual km']];q.getRange('G9').values=[[0]];
 for(const [area,expected] of [[999,10000],[1000,10000],[1999.99,10000],[2000,13000],[9999.99,13000],[10000,15000]]){
  q.getRange('C8').values=[[area]];w.recalculate();assert.equal(q.getRange('G5').values[0][0],expected);
 }
 for(const [a,v]of Object.entries(saved))q.getRange(a).values=v;
 w.recalculate();
 assert.deepEqual(q.getRange('B1:K65').formulas,formulas);
 const after=s.getRange('B1:K150').values;
 for(let i=0;i<150;i++)for(let j=0;j<10;j++)if(!(i===9&&j===1))assert.deepEqual(after[i][j]??'',before[i][j]??'');
 const image=await w.render({sheetName:'Pricing Settings',range:'B6:D11',scale:1.5,format:'png'});
 await fs.writeFile(`${root}/web/previews/${region}-cutoff.png`,new Uint8Array(await image.arrayBuffer()));
 console.log(region,(await w.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!',options:{useRegex:true,maxResults:5}})).ndjson);
 await(await SpreadsheetFile.exportXlsx(w)).save(path);
 const re=await SpreadsheetFile.importXlsx(await FileBlob.load(path));assert.equal(re.worksheets.getItem('Pricing Settings').getRange('C10').values[0][0],2000);
 console.log(region+': cutoff, six boundary cases, settings/formula preservation and reimport passed.');
}
