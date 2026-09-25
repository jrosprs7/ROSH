import fs from 'node:fs/promises';
import {Workbook, SpreadsheetFile} from '@oai/artifact-tool';
import {refinePricing,refineDestinationLabels,simplifyNumberDisplay} from './shared-pricing.mjs';

const out = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const distanceReview=JSON.parse(await fs.readFile(new URL('../../research/reviewed-distances.json',import.meta.url),'utf8'));
const wb=Workbook.create();
const q=wb.worksheets.add('Negros Pricing');
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
title(q,'B2','Negros Pricing');
v(q,'B3','Edit amber cells. Update rates and distances in Pricing Settings.');
q.getRange('B3').format.font.color='#596A7B';
v(q,'F5','QUOTED TOTAL');f(q,'G5','=IF(B12="Ready",G34,"" )');q.getRange('F5:G5').format.fill=light;q.getRange('G5').format.font={size:16,bold:true,color:navy};q.getRange('G5').setNumberFormat(money);q.getRange('F5:G5').format.rowHeight=32;
band(q,'B6:C6','Job inputs');
q.getRange('B7:C10').values=[['Service','Subdivide'],['Lot / mother lot (sqm)',500],['Destination','Bacolod City'],['Survey report?','No']];
input(q,'C7:C10');q.getRange('C8').setNumberFormat(num);
q.getRange('C7').dataValidation={rule:{type:'list',values:['Relocate','Subdivide','Original survey']}};
q.getRange('C10').dataValidation={rule:{type:'list',values:['No','Yes']}};
wb.names.add('Destinations',"='Pricing Settings'!$G$7:$G$150");
q.getRange('C9').dataValidation={rule:{type:'list',formula1:'Destinations'}};
q.getRange('F7:G10').values=[['Office origin','Bacolod'],['Distance method','Preset estimate'],['One-way road km',null],['Site (optional)',null]];
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
const source='https://docs.google.com/spreadsheets/d/1WL239Dave3H1AB8nJ1-tSG2ihH1x_ccZQ6zW4PgqOOk/edit?gid=0#gid=0';
v(s,'B40','Rate maintenance');v(s,'D40','Change amber values; keep thresholds increasing. Use 0 for a waived fee.');v(s,'D41','Blank or negative required rates stop the quote.');v(s,'B43','Source');v(s,'D43','ROSH NGR Database; approved rate revisions, 21 Sep 2026.');v(s,'D44',source);s.getRange('D44').format.font={size:10,color:blue};s.getRange('B44:D44').format.rowHeight=76;
v(s,'B46','Distance maintenance');v(s,'D46','Edit or add Bacolod-origin estimates in G7:H150. Keep names unique.');v(s,'D47','Preset estimates use the provincial map. Use Manual km for the actual site, anywhere.');v(s,'D48','Manual km is one-way from Bacolod. No return-trip multiplier is applied.');s.getRange('D40:D48').format.wrapText=true;for(const r of [40,43,46,47,48])s.getRange(`B${r}:D${r}`).format.rowHeight=44;
const destinations=distanceReview.rows.map(([name,old,km])=>[name,km]);
s.getRange('G6:I6').values=[['Destination','Distance (km)','Travel fee (PHP)']];s.getRange('G6:I6').format={fill:navy,font:{bold:true,color:'#FFFFFF'},horizontalAlignment:'center'};
s.getRange(`G7:H${6+destinations.length}`).values=destinations;input(s,'G7:H150');s.getRange('G7:I150').format.font.name='Arial';s.getRange('G7:I150').format.rowHeight=23;
s.getRange('H7:H150').setNumberFormat(num);s.getRange('I7:I150').setNumberFormat(money);
s.getRange('J1:J150').format.columnWidth=3;s.getRange('K1:K150').format.columnWidth=54;
v(s,'G2','Bacolod-origin estimates');s.getRange('G2').format.font={name:'Arial',size:14,bold:true,color:navy};
v(s,'G3','12 component cities + 19 municipalities + Bacolod.');
v(s,'G4','Approximate town-center distances. Use Manual km for the actual site.');
v(s,'K6','Route / reference note');s.getRange('K6').format.font={name:'Arial',bold:true,color:navy};
for(let i=0;i<distanceReview.rows.length;i++){
 const r=i+7;v(s,`K${r}`,distanceReview.rows[i][3]);s.getRange(`K${r}`).format={font:{name:'Arial',size:10,color:'#596A7B'},wrapText:true};s.getRange(`G${r}:K${r}`).format.rowHeight=42;
}
const refs=[[51,'Location review','Complete: 31 provincial LGUs plus Bacolod. Reviewed 21 Sep 2026.'],[52,'Official LGU list',distanceReview.listSource],[53,'Bacolod classification',distanceReview.bacolodSource],[54,'Distance source','Negros Occidental provincial tourism presentation, map on PDF page 2. Published planning estimates, not live routing.'],[55,'Distance map URL',distanceReview.mapSource],[56,'Cauayan cross-check','DENR-hosted project description also places Cauayan approximately 113 km from Bacolod.'],[57,'Cauayan source','https://r6.emb.gov.ph/wp-content/uploads/2024/01/PDS_River-Restoration-thru-Dredging-Activities.pdf'],[58,'Route differences','San Carlos: 87.3 km via DSB, 143.7 coastal. Isabela: 72 km via Hinigaran, 76 via Binalbagan, 85.1 via La Castellana.'],[59,'Moises Padilla cross-check','Map: 67 km; carrier reference: 85.6 km. Routes and endpoints differ; use actual-site distance.'],[60,'Carrier reference','https://www.pambato.com/sites/default/files/BACOLOD%20BRANCH%20COVERED%20AREAS.pdf']];
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
 ['G7<>"Bacolod"','Only the Bacolod origin is configured.'],['AND(G8<>"Preset estimate",G8<>"Manual km")','Choose Preset estimate or Manual km.'],['AND(G8="Manual km",OR(NOT(ISNUMBER(G9)),G9<0))','Enter a nonnegative one-way road distance in km.'],
 [`AND(C7="Original survey",${originalInvalid})`,'Review original survey base and shared area rates.'],[commonInvalid,'Review area, travel or rounding settings.'],[`AND(C7="Relocate",${reloInvalid})`,'Review relocation rates and thresholds.'],[`AND(C7="Subdivide",${subInvalid})`,'Review subdivision rates and thresholds.'],[`AND(C10="Yes",OR(NOT(ISNUMBER(${p(36)})),${p(36)}<0))`,'Enter a valid survey report charge.'],
 [`IF(G8="Preset estimate",OR(C9="",COUNTIF(${destRange},C9)<>1),FALSE)`,'Choose a unique destination in Pricing Settings.'],[`IF(G8="Preset estimate",COUNTIFS(${destRange},C9,${distRange},"<>")<>1,FALSE)`,'Enter the destination distance.'],[`IF(G8="Preset estimate",NOT(ISNUMBER(VLOOKUP(C9,'Pricing Settings'!$G$7:$H$150,2,FALSE))),FALSE)`,'Enter a numeric destination distance.'],[`IF(G8="Preset estimate",VLOOKUP(C9,'Pricing Settings'!$G$7:$H$150,2,FALSE)<0,FALSE)`,'Destination distance cannot be negative.'],
 ['AND(C7="Subdivide",COUNT(C18:C25)<>COUNTA(C18:C25))','Sublot areas must be numbers or blank.'],['AND(C7="Subdivide",MIN(C18:C25)<0)','Sublot areas cannot be negative.'],['AND(C7="Subdivide",SUM(C18:C25)<=0)','Enter at least one additional sublot.'],['AND(C7="Subdivide",SUM(C18:C25)>=C8)','Sublot total must be less than the mother lot.']
];
let status='"Ready"';for(const [cond,msg] of conditions.reverse())status=`IF(${cond},"${msg}",${status})`;f(q,'B12','='+status);
v(q,'B13','');q.getRange('B13').format.font={size:10,color:'#9C241F'};
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
v(q,'B31','Travel basis');f(q,'C31','=IF(G8="Manual km","Bacolod to actual site","Bacolod to town center")');
q.getRange('F34:G34').format={fill:navy,font:{bold:true,color:'#FFFFFF'},rowHeight:30};
v(q,'B37','Area surcharges use hectares rounded down to the configured increment.');v(q,'B38','Travel units round to the nearest whole unit. Survey report is charged once.');v(q,'B39','The final quote rounds down after all charges are combined.');
v(q,'B40','Rates apply live; save a separate copy when you need to retain an issued quote.');q.getRange('B37:B40').format.font={size:10,color:'#596A7B'};
v(q,'B41','Manual km works anywhere, including Negros Oriental. Enter one-way road km from Bacolod.');
v(q,'B42','Preset estimates depend on the route. Manual km replaces the preset estimate, rather than adding to it.');
q.getRange('B41:B42').format.font={size:10,color:'#596A7B'};

// Meaningful regression cases: thresholds, progressive tiers, invalid jobs and live rate edits.
refinePricing(q,s);
const results=[];
function val(sh,c){return sh.getRange(c).values[0][0];}
function assertEq(label,actual,expected){if(typeof expected==='number'?(typeof actual!=='number'||!Number.isFinite(actual)||Math.abs(actual-expected)>1e-8):actual!==expected)throw Error(`${label}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);results.push({label,actual});}
function job(service,area,subs=[200],dest='Bacolod City',report='No'){
 v(q,'G7','Bacolod');v(q,'G8','Preset estimate');v(q,'G9',null);v(q,'G10',null);v(q,'C7',service);v(q,'C8',area);v(q,'C9',dest);v(q,'C10',report);q.getRange('C18:C25').values=Array.from({length:8},(_,i)=>[subs[i]??null]);wb.recalculate();
}
function total(label,expected){assertEq(label,val(q,'G5'),expected);}
job('Subdivide',500);total('Original 500 sqm subdivision',21000);
for(const [a,t]of [[999,10000],[1000,13000],[9999,13000],[10000,15000],[14999,15000],[15000,17000],[50000,35000],[55000,36000],[100000,50000],[105000,51000],[120000,55000]]){job('Relocate',a);total(`Relocation ${a} sqm`,t);}
job('Subdivide',30000,[10000]);total('Remainder and sublot charged separately',27000);
job('Subdivide',20000,[5000]);total('Sublot 5000 base and remainder tier',23000);
job('Subdivide',20000,[4999]);assertEq('Sublot below 5000 base',val(q,'E18'),8000);
job('Subdivide',120000,[10000]);total('Subdivision beyond 10 hectares',56000);
job('Subdivide',10000,Array(8).fill(500));total('All eight additional sublots',77000);
job('Subdivide',500,[501]);assertEq('Oversized sublots block quote',val(q,'G5'),'');
job('Subdivide',500,[]);assertEq('Missing sublots block quote',val(q,'G5'),'');
job('Subdivide',500,[-1]);assertEq('Negative sublots block quote',val(q,'G5'),'');
job('Subdivide',500,['abc']);assertEq('Text sublots block quote',val(q,'G5'),'');
job('Relocate',0);assertEq('Zero lot blocks quote',val(q,'G5'),'');
job('Relocate',null);assertEq('Blank area blocks quote',val(q,'G5'),'');
job('Relocate',500,[],'Unknown');assertEq('Unknown destination blocks quote',val(q,'G5'),'');
job('Relocate',500,[],'Bacolod City');v(s,'H7',null);wb.recalculate();assertEq('Blank distance blocks quote',val(q,'G5'),'');v(s,'H7',0);
v(s,'G51','Bacolod City');v(s,'H51',20);wb.recalculate();assertEq('Duplicate destination blocks quote',val(q,'G5'),'');v(s,'G51',null);v(s,'H51',null);
job('Relocate',500,[-9],'Talisay City','Yes');total('Travel rounding and report, unused sublot ignored',15000);assertEq('Travel calculated before quote rounding',val(q,'G30'),500);
v(s,'C34',1500);wb.recalculate();total('Travel rate updates quote',16000);v(s,'C34',500);
v(s,'C36',6000);wb.recalculate();total('Report rate updates quote',16000);v(s,'C36',5000);
v(s,'C37',500);wb.recalculate();total('Rounding increment updates quote',15500);v(s,'C37',1000);
job('Subdivide',500);v(s,'C15',9000);wb.recalculate();total('Sublot rate updates quote',22000);v(s,'C15',8000);
v(s,'C14',14000);wb.recalculate();total('Subdivision base updates quote',22000);v(s,'C14',13000);
job('Relocate',2000);v(s,'C8',14000);wb.recalculate();total('Relocation base updates quote',14000);v(s,'C8',13000);
v(s,'C8',null);wb.recalculate();assertEq('Missing active price blocks quote',val(q,'G5'),'');v(s,'C8',13000);
job('Relocate',20000);v(s,'C22',6000);wb.recalculate();total('Area rate updates quote',21000);v(s,'C22',5000);
job('Relocate',1500);v(s,'C10',2000);wb.recalculate();total('Editable relocation threshold',10000);v(s,'C10',1000);
job('Subdivide',20000,[7000]);v(s,'C18',8000);wb.recalculate();assertEq('Editable sublot threshold',val(q,'E18'),8000);v(s,'C18',5000);
job('Relocate',10000);v(s,'C31',0);wb.recalculate();assertEq('Zero rounding increment blocks quote',val(q,'G5'),'');v(s,'C31',0.5);
job('Relocate',500,[],'Bago City');v(s,'H8',40);wb.recalculate();total('Editable destination distance',12000);v(s,'H8',22);
v(s,'G51','New destination');v(s,'H51',60);job('Relocate',500,[],'New destination');total('New destination within reserved rows',13000);v(s,'G51',null);v(s,'H51',null);
assertEq('Complete local list',destinations.length,32);
const componentCities=['Bago City','Cadiz City','Escalante City','Himamaylan City','Kabankalan City','La Carlota City','Sagay City','San Carlos City','Silay City','Sipalay City','Talisay City','Victorias City'];
const municipalities=['Binalbagan','Calatrava','Candoni','Cauayan','Enrique B. Magalona','Hinigaran','Hinoba-an','Ilog','Isabela','La Castellana','Manapla','Moises Padilla','Murcia','Pontevedra','Pulupandan','San Enrique','Toboso','Valladolid','Salvador Benedicto'];
assertEq('Every PSA-listed locality and Bacolod present exactly once',JSON.stringify(destinations.map(x=>x[0]).sort()),JSON.stringify([...componentCities,...municipalities,'Bacolod City'].sort()));
for(const [name,km]of destinations){job('Relocate',500,[],name);assertEq(`Preset distance: ${name}`,val(q,'C30'),km);assertEq(`Preset travel: ${name}`,val(q,'G30'),Math.round(km/10)*500);}
function manual(km,site='Outside Negros Occidental'){job('Relocate',500,[],'Unknown');v(q,'G8','Manual km');v(q,'G9',km);v(q,'G10',site);wb.recalculate();}
manual(235);assertEq('Manual 235 km rounds to 24 units',val(q,'G30'),12000);total('Manual 235 km final total',22000);
manual(234.9);assertEq('Manual below half-unit threshold',val(q,'G30'),11500);total('Manual below half-unit final rounding',21000);
manual(0);total('Explicit zero manual distance is valid',10000);
manual(null);assertEq('Blank manual distance blocks quote',val(q,'G5'),'');
manual(-5);assertEq('Negative manual distance blocks quote',val(q,'G5'),'');
manual('abc');assertEq('Text manual distance blocks quote',val(q,'G5'),'');
manual(500);assertEq('Manual distance is not capped at old 210 km list',val(q,'G30'),25000);
v(s,'C34',600);wb.recalculate();assertEq('Manual uses editable travel rate',val(q,'G30'),30000);v(s,'C34',500);
v(s,'C35',20);wb.recalculate();assertEq('Manual uses editable distance unit',val(q,'G30'),12500);v(s,'C35',10);
v(s,'H7',null);v(q,'C9','Bacolod City');wb.recalculate();assertEq('Manual bypasses missing preset distance',val(q,'G30'),25000);v(s,'H7',0);
v(q,'G7','Dumaguete');wb.recalculate();assertEq('Unconfigured origin cannot reuse Bacolod table',val(q,'G5'),'');
job('Relocate',500);v(q,'G9',-10);wb.recalculate();total('Town mode ignores stale manual km',10000);
job('Subdivide',500);v(q,'G8','Manual km');v(q,'G9',235);wb.recalculate();total('Subdivision manual travel charged once',33000);
for(const [a,t]of [[500,30000],[999,30000],[1000,30000],[9999,30000],[10000,30000],[14999,30000],[15000,32000],[20000,35000],[50000,50000],[55000,51000],[100000,65000],[105000,66000],[120000,70000]]){job('Original survey',a);total(`Original survey ${a} sqm`,t);}
job('Original survey',500,['ignored',-1]);total('Original survey ignores sublots',30000);assertEq('Original sublot charge suppressed',val(q,'G18'),'');
v(s,'C39',22000);wb.recalculate();total('Editable original base',22000);
for(const bad of [null,-1,'bad']){v(s,'C39',bad);wb.recalculate();total(`Invalid original base ${bad}`,'');}v(s,'C39',30000);
v(s,'C8',null);wb.recalculate();total('Original independent of relocation base bands',30000);v(s,'C8',13000);
job('Original survey',20000);v(s,'C22',6000);wb.recalculate();total('Original shares editable area rate',36000);v(s,'C22',null);wb.recalculate();total('Missing shared area rate blocks original','');v(s,'C22',5000);
job('Original survey',500,[],'Unknown','Yes');v(q,'G8','Manual km');v(q,'G9',235);wb.recalculate();total('Original manual travel and report charged once',47000);assertEq('Original travel shared',val(q,'G30'),12000);
v(q,'C10','No');wb.recalculate();total('Original manual travel without report',42000);
job('Relocate',500);v(s,'C39',null);wb.recalculate();total('Relocation ignores unused original base',10000);job('Subdivide',500);total('Subdivision ignores unused original base',21000);v(s,'C39',30000);
job('Subdivide',500,[500]);total('Zero remainder blocks quote','');assertEq('Zero remainder corrective status',val(q,'B12'),'Sublot total must be less than the mother lot.');
job('Relocate',500);assertEq('Zero remainder notice inactive for relocation',val(q,'B13'),'');
manual(10);assertEq('Review: 10 km travel before final rounding',val(q,'G30'),500);total('Review: final rounding absorbs 500 travel',10000);
job('Original survey',500);
refineDestinationLabels(q,s,'Negros');
simplifyNumberDisplay(q,s);
wb.recalculate();
console.log((await wb.inspect({kind:'table',range:"'Negros Pricing'!F29:G34",include:'values,formulas',tableMaxRows:8,tableMaxCols:2,maxChars:2500})).ndjson);
console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:30},summary:'Final formula error scan'})).ndjson);
await fs.writeFile(`${out}/verification.json`,JSON.stringify(results,null,2));
for(const [sh,range,name]of [[q,'B2:G42','pricing-preview'],[s,'B6:D39','settings-rates-preview'],[s,'B40:D60','settings-sources-preview'],[s,'G2:K22','distances-preview'],[s,'G23:K38','distances-south-preview']]){
 const preview=await wb.render({sheetName:sh.name,range,scale:1.5,format:'png'});await fs.writeFile(`${out}/${name}.png`,new Uint8Array(await preview.arrayBuffer()));
}
await (await SpreadsheetFile.exportXlsx(wb)).save(`${out}/Negros_Pricing.xlsx`);
console.log(`Created workbook. ${results.length} regression checks passed.`);


