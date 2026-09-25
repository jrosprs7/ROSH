from pathlib import Path
p=Path(__file__).with_name('build.mjs')
t=p.read_text(encoding='utf-8')
def rep(a,b):
    global t
    assert a in t,a
    t=t.replace(a,b)
rep("values:['Relocate','Subdivide']", "values:['Relocate','Subdivide','Original survey']")
rep('"Sublot 1 (remaining)","Relocation lot")', '"Sublot 1 (remaining)",IF(C7="Original survey","Original survey lot","Relocation lot"))')
rep("[37,'Final rounding increment (PHP)',1000,'Round DOWN the combined quote to this amount.']", "[37,'Final rounding increment (PHP)',1000,'Round DOWN the combined quote to this amount.'],[39,'Original survey base',20000,'One base for all lot sizes; shares relocation area rates.']")
rep("band(s,'B6:D6'", "band(s,'B38:D38','Original survey base price');band(s,'B6:D6'")
rep("const source=", "s.getRange('B39:D39').format.rowHeight=42;s.getRange('D39').format.wrapText=true;\nconst source=")
rep('Relocation: first tier / ha','Reloc./Original: first tier / ha')
rep('Relocation: second tier / ha','Reloc./Original: second tier / ha')
rep('Relocation: final tier / ha','Reloc./Original: final tier / ha')
rep('AND(C7<>"Relocate",C7<>"Subdivide")','AND(C7<>"Relocate",C7<>"Subdivide",C7<>"Original survey")')
rep("'Choose Relocate or Subdivide.'", "'Choose Relocate, Subdivide or Original survey.'")
rep("const subInvalid=", "const originalInvalid=`OR(NOT(ISNUMBER(${p(39)})),${p(39)}<0,${numericGroup(\"'Pricing Settings'!C22:C24\",3)})`;\nconst subInvalid=")
rep('[commonInvalid,', '[`AND(C7="Original survey",${originalInvalid})`,\'Review original survey base and shared area rates.\'],[commonInvalid,')
rep('AND($C$7="Relocate",ROW()>17)', 'AND($C$7<>"Subdivide",ROW()>17)')
rep('IF($C$7="Subdivide",${p(14)},IF(C${r}<${p(10)},${p(7)},IF(C${r}<${p(11)},${p(8)},${p(9)})))','IF($C$7="Subdivide",${p(14)},IF($C$7="Original survey",${p(39)},IF(C${r}<${p(10)},${p(7)},IF(C${r}<${p(11)},${p(8)},${p(9)}))))')
rep('IF($C$7="Relocate",${charge(`D${r}`,true)},${charge(`D${r}`,false)})','IF($C$7="Subdivide",${charge(`D${r}`,false)},${charge(`D${r}`,true)})')
rep("addCustom('$C$7=\"Relocate\"'", "addCustom('$C$7<>\"Subdivide\"'")
rep('Blank or zero sublots have no charge. Sublot entries are ignored for relocation.', 'Sublots apply only to subdivision. Blank or zero sublots have no charge.')
rep("Math.abs(actual-expected)>1e-8", "(typeof actual!=='number'||!Number.isFinite(actual)||Math.abs(actual-expected)>1e-8)")
rep("job('Subdivide',500);\nwb.recalculate();", """for(const [a,t]of [[500,20000],[999,20000],[1000,20000],[9999,20000],[10000,20000],[14999,20000],[15000,22000],[20000,25000],[50000,40000],[55000,41000],[100000,55000],[105000,56000],[120000,60000]]){job('Original survey',a);total(`Original survey ${a} sqm`,t);}
job('Original survey',500,['ignored',-1]);total('Original survey ignores sublots',20000);assertEq('Original sublot charge suppressed',val(q,'G18'),'');
v(s,'C39',22000);wb.recalculate();total('Editable original base',22000);
for(const bad of [null,-1,'bad']){v(s,'C39',bad);wb.recalculate();total(`Invalid original base ${bad}`,'');}v(s,'C39',20000);
v(s,'C8',null);wb.recalculate();total('Original independent of relocation base bands',20000);v(s,'C8',13000);
job('Original survey',20000);v(s,'C22',6000);wb.recalculate();total('Original shares editable area rate',26000);v(s,'C22',null);wb.recalculate();total('Missing shared area rate blocks original','');v(s,'C22',5000);
job('Original survey',500,[],'Unknown','Yes');v(q,'G8','Manual km');v(q,'G9',235);wb.recalculate();total('Original manual travel and report charged once',37000);assertEq('Original travel shared',val(q,'G30'),12000);
v(q,'C10','No');wb.recalculate();total('Original manual travel without report',32000);
job('Relocate',500);v(s,'C39',null);wb.recalculate();total('Relocation ignores unused original base',10000);job('Subdivide',500);total('Subdivision ignores unused original base',21000);v(s,'C39',20000);
job('Original survey',500);
wb.recalculate();""")
rep("[s,'B40:D60','settings-sources-preview']", "[s,'B6:D39','settings-rates-preview'],[s,'B40:D60','settings-sources-preview']")
rep('Negros_Pricing_Travel_Update.xlsx','Negros_Pricing_Original_Survey.xlsx')
p.write_text(t,encoding='utf-8')
