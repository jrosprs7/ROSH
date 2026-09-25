import fs from 'node:fs/promises';
import {Workbook, SpreadsheetFile, FileBlob} from '@oai/artifact-tool';

const out = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const sourceRows=JSON.parse(await fs.readFile(new URL('../../Zamboanga/research/distances.json',import.meta.url),'utf8'));
const distanceReview={rows:sourceRows.map(([name,km])=>[name,null,km,'Source estimate; verify actual-site distance.'])};
const wb=Workbook.create();
const q=wb.worksheets.add('Zamboanga Pricing');
const s=wb.worksheets.add('Pricing Settings');
const navy='#233C59', blue='#37678D', ink='#243447', amber='#FFF2CC', light='#EDF2F7';
const money='"₱"#,##0.00;[Red]("₱"#,##0.00);"₱"0.00';
const num='#,##0.00';
const v=(sh,cell,value)=>sh.getRange(cell).values=[[value]];
const f=(sh,cell,value)=>sh.getRange(cell).formulas=[[value]];
function input(sh,range){sh.getRange(range).format.fill=amber;sh.getRange(range).format.font.color='#164D8D';}
function band(sh,range,title){sh.getRange(range).format.fill=navy;sh.getRange(range).format.font={bold:true,color:'#FFFFFF'};v(sh,range.split(':')[0],title);}
function title(sh,cell,text){v(sh,cell,text);sh.getRange(cell).format.font={size:16,bold:true,color:navy};}
for(const sh of [q,s]){sh.showGridLines=false;sh.getRange('A1:J60').format.font={name:'Arial',size:11,color:ink};sh.getRange('A1:J60').format.rowHeight=23;sh.getRange('A1:J60').format.verticalAlignment='center';sh.getRange('A1:A60').format.columnWidth=3;}
q.tabColor=navy;s.tabColor=blue;
q.getRange('B1:B45').format.columnWidth=27;
q.getRange('C1:C45').format.columnWidth=28;
q.getRange('D1:D45').format.columnWidth=19;
q.getRange('E1:G45').format.columnWidth=19;
title(q,'B2','Zamboanga Pricing');
v(q,'B3','Edit amber cells. Update rates and distances in Pricing Settings.');
q.getRange('B3').format.font.color='#596A7B';
v(q,'F5','QUOTED TOTAL');f(q,'G5','=IF(B12="Ready",G34,"" )');q.getRange('F5:G5').format.fill=light;q.getRange('G5').format.font={size:16,bold:true,color:navy};q.getRange('G5').setNumberFormat(money);q.getRange('F5:G5').format.rowHeight=32;
band(q,'B6:C6','Job inputs');
q.getRange('B7:C10').values=[['Service','Subdivide'],['Lot / mother lot (sqm)',500],['Destination','Tetuan'],['Survey report?','No']];
input(q,'C7:C10');q.getRange('C8').setNumberFormat(num);
q.getRange('C7').dataValidation={rule:{type:'list',values:['Relocate','Subdivide','Original survey']}};
q.getRange('C10').dataValidation={rule:{type:'list',values:['No','Yes']}};
wb.names.add('Destinations',"='Pricing Settings'!$G$7:$G$150");
q.getRange('C9').dataValidation={rule:{type:'list',formula1:'Destinations'}};
q.getRange('F7:G10').values=[['Office origin','Tetuan'],['Distance method','Preset estimate'],['One-way road km',null],['Site (optional)',null]];
input(q,'G8:G10');q.getRange('G9').setNumberFormat(num);q.getRange('G10').format.wrapText=true;
q.getRange('G8').dataValidation={rule:{type:'list',values:['Preset estimate','Manual km']}};
q.getRange('C9').conditionalFormats.addCustom('$G$8="Manual km"',{fill:'#F0F2F4',font:{color:'#84909C'}});
q.getRange('G9:G10').conditionalFormats.addCustom('$G$8="Preset estimate"',{fill:'#F0F2F4',font:{color:'#84909C'}});
f(q,'B14','=IF(C7="Subdivide","Enter Sublots 2–9 below. Sublot 1 is the calculated remainder.","Enter the full lot area above. Sublot entries are ignored for this service.")');
q.getRange('B16:G16').values=[['Lot','Area (sqm)','Chargeable ha','Base price','Additional area','Lot charge']];
q.getRange('B16:G16').format={fill:navy,font:{bold:true,color:'#FFFFFF'},horizontalAlignment:'center'};
f(q,'B17','=IF(C7="Subdivide","Sublot 1 (remaining)",IF(C7="Original survey","Original survey lot","Relocation lot"))');
f(q,'C17','=IF(ISNUMBER(C8),IF(C7="Subdivide",C8-SUM(C18:C25),C8),"")');
for(let r=18;r<=25;r++)v(q,`B${r}`,`Sublot ${r-16}`);
v(q,'C18',200);input(q,'C18:C25');q.getRange('C17:D25').setNumberFormat(num);q.getRange('E17:G34').setNumberFormat(money);

// All editable prices and thresholds have one authoritative cell.
s.getRange('B1:B57').format.columnWidth=34;s.getRange('C1:C57').format.columnWidth=19;s.getRange('D1:D57').format.columnWidth=49;s.getRange('E1:F57').format.columnWidth=3;
s.getRange('G1:G150').format.columnWidth=30;s.getRange('H1:H150').format.columnWidth=16;s.getRange('I1:I150').format.columnWidth=19;
title(s,'B2','Pricing Settings');v(s,'B3','Amber cells are editable. Changes apply to the current quote immediately.');
const settings=[
 [7,'Relocation: small lot',10000,'Below the middle-band threshold.'],[8,'Relocation: middle band',13000,'From the middle to the large-band threshold.'],[9,'Relocation: large lot',15000,'From the large-band threshold upward.'],[10,'Middle band starts (sqm)',1000,'Inclusive lower threshold.'],[11,'Large band starts (sqm)',10000,'Inclusive lower threshold.'],
 [14,'Subdivision: remaining-lot base',13000,'Charged once for the remaining lot.'],[15,'Additional sublot: small',8000,'Positive area below the middle-band threshold.'],[16,'Additional sublot: middle',8500,'From the middle to the large-band threshold.'],[17,'Additional sublot: large',10000,'From the large-band threshold upward.'],[18,'Sublot middle band starts (sqm)',5000,'Inclusive lower threshold.'],[19,'Sublot large band starts (sqm)',10000,'Inclusive lower threshold.'],
 [22,'Reloc./Original: first tier / ha',5000,'Above included area, up to first tier limit.'],[23,'Reloc./Original: second tier / ha',3000,'Above first tier limit, up to second tier limit.'],[24,'Reloc./Original: final tier / ha',2500,'Above second tier limit.'],[25,'Subdivision: first tier / ha',4000,'Applies separately to each lot.'],[26,'Subdivision: second tier / ha',3000,'Applies separately to each lot.'],[27,'Subdivision: final tier / ha',2000,'Applies separately to each lot.'],[28,'Included area (ha)',1,'No area surcharge through this amount.'],[29,'First tier ends (ha)',5,'Must exceed included area.'],[30,'Second tier ends (ha)',10,'Must exceed first tier limit.'],[31,'Area rounding increment (ha)',0.5,'Round DOWN before calculating area surcharges.'],
 [34,'Travel charge / distance unit',500,'PHP per distance unit below.'],[35,'Travel distance unit (km)',10,'Distance units round to the nearest whole unit.'],[36,'Survey report charge',5000,'Added once when Survey report is Yes.'],[37,'Final rounding increment (PHP)',1000,'Round DOWN the combined quote to this amount.'],[39,'Original survey base',30000,'One base for all lot sizes; shares relocation area rates.']
];
band(s,'B38:D38','Original survey base price');band(s,'B6:D6','Relocation base prices');band(s,'B13:D13','Subdivision base prices');band(s,'B21:D21','Additional-area rates and thresholds');band(s,'B33:D33','Travel, report and quote rounding');
for(const [r,label,value,note] of settings){v(s,`B${r}`,label);v(s,`C${r}`,value);v(s,`D${r}`,note);input(s,`C${r}`);s.getRange(`C${r}`).setNumberFormat(num);s.getRange(`D${r}`).format.font={size:10,color:'#596A7B'};}
s.getRange('B39:D39').format.rowHeight=42;s.getRange('D39').format.wrapText=true;
const source='https://docs.google.com/spreadsheets/d/1uFGOuIHkXiPfStX2m_i6X5t_jvM7w-0BqY22DcvbZNA/edit?gid=1010525051#gid=1010525051';
v(s,'B40','Rate maintenance');v(s,'D40','Change amber values; keep thresholds increasing. Use 0 for a waived fee.');v(s,'D41','Blank or negative required rates stop the quote.');v(s,'B43','Source');v(s,'D43','ROSH ZGA Database; approved rate revisions, 21 Sep 2026.');v(s,'D44',source);s.getRange('D44').format.font={size:10,color:blue};s.getRange('B44:D44').format.rowHeight=76;
v(s,'B46','Distance maintenance');v(s,'D46','Edit or add Tetuan-origin estimates in G7:H150. Keep names unique.');v(s,'D47','Source estimates are not route-verified. Use Manual km for the actual site.');v(s,'D48','Manual km is one-way from Tetuan. No return-trip multiplier is applied.');s.getRange('D40:D48').format.wrapText=true;for(const r of [40,43,46,47,48])s.getRange(`B${r}:D${r}`).format.rowHeight=44;
const destinations=distanceReview.rows.map(([name,old,km])=>[name,km]);
s.getRange('G6:I6').values=[['Destination','Distance (km)','Travel fee (PHP)']];s.getRange('G6:I6').format={fill:navy,font:{bold:true,color:'#FFFFFF'},horizontalAlignment:'center'};
s.getRange(`G7:H${6+destinations.length}`).values=destinations;input(s,'G7:H150');s.getRange('G7:I150').format.font.name='Arial';s.getRange('G7:I150').format.rowHeight=23;
s.getRange('H7:H150').setNumberFormat(num);s.getRange('I7:I150').setNumberFormat(money);
s.getRange('J1:J150').format.columnWidth=3;s.getRange('K1:K150').format.columnWidth=54;
v(s,'G2','Tetuan-origin estimates');s.getRange('G2').format.font={name:'Arial',size:14,bold:true,color:navy};
v(s,'G3','93 source locations. Completeness not independently verified.');
v(s,'G4','Source distance estimates. Use Manual km for the actual site.');
v(s,'K6','Route / reference note');s.getRange('K6').format.font={name:'Arial',bold:true,color:navy};
for(let i=0;i<distanceReview.rows.length;i++){
 const r=i+7;v(s,`K${r}`,distanceReview.rows[i][3]);s.getRange(`K${r}`).format={font:{name:'Arial',size:10,color:'#596A7B'},wrapText:true};s.getRange(`G${r}:K${r}`).format.rowHeight=42;
}
const refs=[[51,'Location review','93 named source locations. Names and distances are not independently verified.'],[52,'Distance source',source],[53,'Origin','Tetuan, as identified in the source distance table.'],[54,'Travel policy','Approved Negros-style travel: rounded km / 10 × PHP 500. No free-distance allowance.'],[55,'Rate revisions','Approved relocation and sublot bands match Negros; remaining-lot base is PHP 13,000.'],[56,'Original Survey','Approved base PHP 30,000 plus relocation area surcharges.'],[57,'Travel inclusions','Travel pricing includes ferry fares, tolls and overnight expenses. No separate charges.'],[58,'Scope','Zambo Pricing only. Source project trackers are excluded.'],[59,'Manual distance','Enter one-way km from Tetuan to the actual site. Presets are replaced, not added.'],[60,'Maintenance','Rates remain editable. Save an issued quote separately to preserve its applied rates.']];
for(const [r,label,text]of refs){v(s,`B${r}`,label);v(s,`D${r}`,text);s.getRange(`D${r}`).format.wrapText=true;s.getRange(`B${r}:D${r}`).format.rowHeight=r===55||r===57||r===60?72:48;}
for(let r=7;r<=150;r++)f(s,`I${r}`,`=IF(G${r}="","",IF(OR(NOT(ISNUMBER(H${r})),H${r}<0,NOT(ISNUMBER($C$34)),NOT(ISNUMBER($C$35)),$C$34<0,$C$35<=0),"Check distance/rate",ROUND(H${r}/$C$35,0)*$C$34))`);
s.freezePanes.freezeRows(6);

// Input validation owns the quote gate; invalid entries never produce a plausible total.
const p=r=>`'Pricing Settings'!$C$${r}`;
function numericGroup(range,n){return `OR(COUNT(${range})<>${n},MIN(${range})<0)`;}
const serviceInvalid='AND(C7<>"Relocate",C7<>"Subdivide",C7<>"Original survey")';
const commonInvalid=`OR(${numericGroup("'Pricing Settings'!C28:C31",4)},${p(29)}<=${p(28)},${p(30)}<=${p(29)},${p(31)}<=0,${numericGroup("'Pricing Settings'!C34:C35",2)},${p(35)}<=0,NOT(ISNUMBER(${p(37)})),${p(37)}<=0)`;
const reloInvalid=`OR(${numericGroup("'Pricing Settings'!C7:C11",5)},${p(10)}<=0,${p(11)}<=${p(10)},${numericGroup("'Pricing Settings'!C22:C24",3)})`;
const originalInvalid=`OR(NOT(ISNUMBER(${p(39)})),${p(39)}<0,${numericGroup("'Pricing Settings'!C22:C24",3)})`;
const subInvalid=`OR(${numericGroup("'Pricing Settings'!C14:C19",6)},${p(18)}<=0,${p(19)}<=${p(18)},${numericGroup("'Pricing Settings'!C25:C27",3)})`;
const destRange="'Pricing Settings'!$G$7:$G$150",distRange="'Pricing Settings'!$H$7:$H$150";
const conditions=[
 [serviceInvalid,'Choose Relocate, Subdivide or Original survey.'],['OR(NOT(ISNUMBER(C8)),C8<=0)','Enter a positive lot area.'],['AND(C10<>"Yes",C10<>"No")','Choose Yes or No for Survey report.'],
 ['G7<>"Tetuan"','Only the Tetuan origin is configured.'],['AND(G8<>"Preset estimate",G8<>"Manual km")','Choose Preset estimate or Manual km.'],['AND(G8="Manual km",OR(NOT(ISNUMBER(G9)),G9<0))','Enter a nonnegative one-way road distance in km.'],
 [`AND(C7="Original survey",${originalInvalid})`,'Review original survey base and shared area rates.'],[commonInvalid,'Review area, travel or rounding settings.'],[`AND(C7="Relocate",${reloInvalid})`,'Review relocation rates and thresholds.'],[`AND(C7="Subdivide",${subInvalid})`,'Review subdivision rates and thresholds.'],[`AND(C10="Yes",OR(NOT(ISNUMBER(${p(36)})),${p(36)}<0))`,'Enter a valid survey report charge.'],
 [`IF(G8="Preset estimate",OR(C9="",COUNTIF(${destRange},C9)<>1),FALSE)`,'Choose a unique destination in Pricing Settings.'],[`IF(G8="Preset estimate",COUNTIFS(${destRange},C9,${distRange},"<>")<>1,FALSE)`,'Enter the destination distance.'],[`IF(G8="Preset estimate",NOT(ISNUMBER(VLOOKUP(C9,'Pricing Settings'!$G$7:$H$150,2,FALSE))),FALSE)`,'Enter a numeric destination distance.'],[`IF(G8="Preset estimate",VLOOKUP(C9,'Pricing Settings'!$G$7:$H$150,2,FALSE)<0,FALSE)`,'Destination distance cannot be negative.'],
 ['AND(C7="Subdivide",COUNT(C18:C25)<>COUNTA(C18:C25))','Sublot areas must be numbers or blank.'],['AND(C7="Subdivide",MIN(C18:C25)<0)','Sublot areas cannot be negative.'],['AND(C7="Subdivide",SUM(C18:C25)<=0)','Enter at least one additional sublot.'],['AND(C7="Subdivide",SUM(C18:C25)>C8)','Sublot areas exceed the mother lot.']
];
let status='"Ready"';for(const [cond,msg] of conditions.reverse())status=`IF(${cond},"${msg}",${status})`;f(q,'B12','='+status);
f(q,'B13','=IF(B12<>"Ready","",IF(AND(C7="Subdivide",C17=0),"Zero remainder: the remaining-lot base is still included. Review before quoting.",""))');q.getRange('B13').format.font={size:10,color:'#9C241F'};
q.getRange('B12:G12').format.rowHeight=28;q.getRange('B12').format.font.bold=true;
q.getRange('B12:G12').conditionalFormats.addCustom('$B$12<>"Ready"',{fill:'#FCE4D6',font:{color:'#9C241F',bold:true}});
const gate='OR($B$12<>"Ready",AND($C$7<>"Subdivide",ROW()>17))';
const charge=(h,rel)=>`MAX(0,MIN(${h},${p(29)})-${p(28)})*${p(rel?22:25)}+MAX(0,MIN(${h},${p(30)})-${p(29)})*${p(rel?23:26)}+MAX(0,${h}-${p(30)})*${p(rel?24:27)}`;
for(let r=17;r<=25;r++){
 f(q,`D${r}`,`=IF(${gate},"",FLOOR(C${r}/10000,${p(31)}))`);
 const base=r===17?`IF($C$7="Subdivide",${p(14)},IF($C$7="Original survey",${p(39)},IF(C${r}<${p(10)},${p(7)},IF(C${r}<${p(11)},${p(8)},${p(9)}))))`:`IF(C${r}>0,IF(C${r}<${p(18)},${p(15)},IF(C${r}<${p(19)},${p(16)},${p(17)})),0)`;
 f(q,`E${r}`,`=IF(${gate},"",${base})`);
 f(q,`F${r}`,`=IF(${gate},"",IF($C$7="Subdivide",${charge(`D${r}`,false)},${charge(`D${r}`,true)}))`);
 f(q,`G${r}`,`=IF(${gate},"",SUM(E${r}:F${r}))`);
}
q.getRange('B17:G17').format.fill=light;
q.getRange('C18:C25').conditionalFormats.addCustom('$C$7<>"Subdivide"',{fill:'#F0F2F4',font:{color:'#84909C'}});
v(q,'B27','Sublots apply only to subdivision. Blank or zero sublots have no charge.');q.getRange('B27').format.font={size:10,color:'#596A7B'};
const labels={29:'Lot charges',30:'Travel',31:'Survey report',32:'Before rounding',33:'Rounding adjustment',34:'Final quote'};
for(const [r,label] of Object.entries(labels))v(q,`F${r}`,label);
const quoteF={29:'SUM(G17:G25)',30:`ROUND(C30/${p(35)},0)*${p(34)}`,31:`IF(C10="Yes",${p(36)},0)`,32:'SUM(G29:G31)',33:`FLOOR(G32,${p(37)})-G32`,34:'SUM(G32:G33)'};
for(const [r,formula]of Object.entries(quoteF))f(q,`G${r}`,`=IF($B$12<>"Ready","",${formula})`);
v(q,'B30','Distance used (km)');f(q,'C30',`=IF($B$12<>"Ready","",IF(G8="Manual km",G9,VLOOKUP(C9,'Pricing Settings'!$G$7:$H$150,2,FALSE)))`);q.getRange('C30').setNumberFormat(num);
v(q,'B31','Travel basis');f(q,'C31','=IF(G8="Manual km","Tetuan to actual site","Tetuan to preset site")');
q.getRange('F34:G34').format={fill:navy,font:{bold:true,color:'#FFFFFF'},rowHeight:30};
v(q,'B37','Area surcharges use hectares rounded down to the configured increment.');v(q,'B38','Travel units round to the nearest whole unit. Survey report is charged once.');v(q,'B39','The final quote rounds down after all charges are combined.');
v(q,'B40','Rates apply live; save a separate copy when you need to retain an issued quote.');q.getRange('B37:B40').format.font={size:10,color:'#596A7B'};
v(q,'B41','Manual km works beyond the preset list. Enter one-way road km from Tetuan.');
v(q,'B42','Preset estimates depend on the route. Manual km replaces the preset estimate, rather than adding to it.');
q.getRange('B41:B42').format.font={size:10,color:'#596A7B'};


// Shared refinements, validation, and export are implemented below.
const {refinePricing,refineDestinationLabels,simplifyNumberDisplay}=await import('./shared-pricing.mjs');
refinePricing(q,s);
const root=new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const zpath=`${root}/Zamboanga/Zamboanga_Pricing.xlsx`;
const npath=`${out}/Negros_Pricing.xlsx`;
try{await fs.access(zpath);throw Error('Zamboanga master already exists. Import it to preserve user edits instead of rebuilding.');}catch(e){if(e.code!=='ENOENT')throw e;}
const nw=await SpreadsheetFile.importXlsx(await FileBlob.load(npath));
const nq=nw.worksheets.getItem('Negros Pricing'),ns=nw.worksheets.getItem('Pricing Settings');
nw.recalculate();
const savedNInputs=Object.fromEntries(['C7:C10','C18:C25','G7:G10'].map(a=>[a,nq.getRange(a).values]));
const savedNSettings=ns.getRange('B1:K150').values;
refinePricing(nq,ns);
const results=[];
function check(label,actual,expected){
 if(typeof expected==='number'?(typeof actual!=='number'||!Number.isFinite(actual)||Math.abs(actual-expected)>1e-8):actual!==expected)throw Error(`${label}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
 results.push({label,actual});
}
function val(sh,c){return sh.getRange(c).values[0][0];}
function set(sh,c,x){sh.getRange(c).values=[[x]];}
function job(w,sh,origin,service,area,subs=[200],km=0,report='No'){
 set(sh,'C7',service);set(sh,'C8',area);set(sh,'C10',report);set(sh,'G7',origin);set(sh,'G8','Manual km');set(sh,'G9',km);
 sh.getRange('C18:C25').values=Array.from({length:8},(_,i)=>[subs[i]??null]);w.recalculate();
}
for(const [w,sh,st,region,origin,subBase] of [[wb,q,s,'Zamboanga','Tetuan',13000],[nw,nq,ns,'Negros','Bacolod',13000]]){
 const total=(label,want)=>check(`${region}: ${label}`,val(sh,'G5'),want);
 for(const [a,want]of [[999,10000],[1000,13000],[2999,13000],[3000,13000],[9999,13000],[10000,15000],[14999,15000],[15000,17000],[20000,20000],[50000,35000],[55000,36000],[100000,50000],[105000,51000],[120000,55000]]){
  job(w,sh,origin,'Relocate',a);total(`Relocation ${a}`,want);
 }
 for(const [a,want]of [[500,30000],[9999,30000],[10000,30000],[15000,32000],[20000,35000],[50000,50000],[100000,65000],[120000,70000]]){
  job(w,sh,origin,'Original survey',a);total(`Original ${a}`,want);
 }
 for(const [area,subs,want]of [[500,[200],subBase+8000],[20000,[5000],Math.floor((subBase+8500+2000)/1000)*1000],[30000,[10000],subBase+14000],[120000,[10000],subBase+43000],[10000,Array(8).fill(500),subBase+64000]]){
  job(w,sh,origin,'Subdivide',area,subs);total(`Subdivision ${area} / ${subs.join(',')}`,want);
 }
 for(const [area,base]of [[4999,8000],[5000,8500],[9999,8500],[10000,10000]]){
  job(w,sh,origin,'Subdivide',20000,[area]);check(`${region}: sublot band ${area}`,val(sh,'E18'),base);
 }
 for(const subs of [[500],[250,250],[501],[],[-1],['bad']]){
  job(w,sh,origin,'Subdivide',500,subs);total(`Invalid sublots ${JSON.stringify(subs)}`,'');
 }
 job(w,sh,origin,'Subdivide',500,[500]);check(`${region}: equal area corrective status`,val(sh,'B12'),'Sublot total must be less than the mother lot.');
 for(const area of [0,-1,null,'bad']){job(w,sh,origin,'Relocate',area);total(`Invalid area ${area}`,'');}
 for(const [km,travel]of [[0,0],[4.9,0],[5,500],[7,500],[10,500],[14,500],[14.9,500],[15,1000],[25,1500],[234.9,11500],[235,12000],[500,25000]]){
  job(w,sh,origin,'Relocate',500,[],km);check(`${region}: travel ${km}`,val(sh,'G30'),travel);total(`Travel quote ${km}`,Math.floor((10000+travel)/1000)*1000);
 }
 for(const km of [null,-1,'bad']){job(w,sh,origin,'Relocate',500,[],km);total(`Invalid km ${km}`,'');}
 job(w,sh,origin,'Original survey',500,['ignored',-1],235,'Yes');total('Original manual/report/ignored sublots',47000);
 job(w,sh,origin,'Subdivide',500,[200],235,'Yes');total('Subdivision travel/report once',subBase+25000);
 job(w,sh,origin,'Relocate',500,[],235);set(sh,'C9','Unknown');w.recalculate();total('Manual ignores unknown preset',22000);
 set(sh,'G8','Preset estimate');w.recalculate();total('Unknown preset blocks quote','');
 const presets=st.getRange('G7:H150').values.filter(r=>r[0]);
 for(const [name,km]of presets){
  job(w,sh,origin,'Relocate',500);set(sh,'G8','Preset estimate');set(sh,'C9',name);set(sh,'G9',-10);w.recalculate();
  check(`${region}: preset km ${name}`,val(sh,'C30'),km);check(`${region}: preset travel ${name}`,val(sh,'G30'),Math.round(km/10)*500);
 }
 job(w,sh,origin,'Relocate',500);
 for(const [cell,temp,resultCell,want]of [['C7',11000,'G5',11000],['C34',600,'G30',600],['C35',5,'G30',1000],['C36',6000,'G31',6000],['C37',500,'G5',15500]]){
  const old=val(st,cell);job(w,sh,origin,'Relocate',500,[],10,'Yes');set(st,cell,temp);w.recalculate();check(`${region}: editable ${cell}`,val(sh,resultCell),cell==='C7'?16000:want);set(st,cell,old);
 }
 job(w,sh,origin,'Subdivide',500);set(st,'C15',9000);w.recalculate();total('Editable small sublot',subBase+9000);set(st,'C15',8000);
 set(st,'C14',subBase+1000);w.recalculate();total('Editable subdivision base',subBase+9000);set(st,'C14',subBase);
 job(w,sh,origin,'Original survey',500);set(st,'C39',32000);w.recalculate();total('Editable original base',32000);set(st,'C39',30000);
 set(st,'C39',null);w.recalculate();total('Missing original base blocks quote','');set(st,'C39',30000);
 job(w,sh,origin,'Original survey',20000);set(st,'C22',6000);w.recalculate();total('Shared original area rate',36000);set(st,'C22',5000);
 job(w,sh,origin,'Relocate',500);set(st,'C35',0);w.recalculate();total('Invalid travel unit blocks quote','');set(st,'C35',10);
 const distance=val(st,'H7');set(sh,'G8','Preset estimate');set(sh,'C9',val(st,'G7'));set(st,'H7',null);w.recalculate();total('Blank preset distance blocks quote','');set(st,'H7',distance);
 set(st,'G150',val(st,'G7'));set(st,'H150',10);w.recalculate();total('Duplicate preset blocks quote','');set(st,'G150',null);set(st,'H150',null);
}
for(const [a,values]of Object.entries(savedNInputs))nq.getRange(a).values=values;
nw.recalculate();
const afterNSettings=ns.getRange('B1:K150').values;
for(let r=0;r<150;r++)for(let c=0;c<10;c++)if(afterNSettings[r][c]!==savedNSettings[r][c])throw Error(`Negros settings changed unexpectedly at row ${r+1}, column ${c+2}`);
check('Negros: all settings and source values preserved',true,true);
job(wb,q,'Tetuan','Subdivide',500,[200],0);set(q,'G8','Preset estimate');set(q,'C9','Tetuan');set(q,'G9',null);set(q,'G10',null);wb.recalculate();
check('Zamboanga sample final quote',val(q,'G5'),21000);
check('Zamboanga source location count',sourceRows.length,93);
refineDestinationLabels(q,s,'Zamboanga');
refineDestinationLabels(nq,ns,'Negros');
simplifyNumberDisplay(q,s);
simplifyNumberDisplay(nq,ns);
wb.recalculate();nw.recalculate();
await fs.mkdir(`${root}/Zamboanga/research/previews`,{recursive:true});
for(const [w,sh,range,name]of [[wb,q,'B2:G42','zamboanga-pricing'],[wb,s,'B6:D39','zamboanga-settings'],[wb,s,'B40:D60','zamboanga-sources'],[wb,s,'G2:K25','zamboanga-locations-top'],[wb,s,'G26:K45','zamboanga-locations-middle'],[wb,s,'G80:K99','zamboanga-locations-end'],[nw,nq,'B2:G42','negros-pricing']]){
 const png=await w.render({sheetName:sh.name,range,scale:1.3,format:'png'});await fs.writeFile(`${root}/Zamboanga/research/previews/${name}.png`,new Uint8Array(await png.arrayBuffer()));
}
for(const [w,region]of [[wb,'Zamboanga'],[nw,'Negros']])console.log(region,(await w.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:20},summary:'Formula error scan'})).ndjson);
await (await SpreadsheetFile.exportXlsx(wb)).save(zpath);
await (await SpreadsheetFile.exportXlsx(nw)).save(npath);
await fs.writeFile(`${root}/Zamboanga/research/verification.json`,JSON.stringify(results,null,2));
console.log(`Saved regional workbooks; ${results.length} checks passed.`);
