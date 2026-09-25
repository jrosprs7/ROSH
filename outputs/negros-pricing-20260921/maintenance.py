from pathlib import Path
root=Path(__file__).parents[2]
p=Path(__file__).with_name('build.mjs')
t=p.read_text(encoding='utf-8')
t=t.replace("[39,'Original survey base',20000", "[39,'Original survey base',30000")
start=t.index('for(const [a,t]of [[500,20000]')
end=t.index("job('Original survey',500);\nwb.recalculate();",start)
block=t[start:end]
for old,new in [("[500,20000]","[500,30000]"),("[999,20000]","[999,30000]"),("[1000,20000]","[1000,30000]"),("[9999,20000]","[9999,30000]"),("[10000,20000]","[10000,30000]"),("[14999,20000]","[14999,30000]"),("[15000,22000]","[15000,32000]"),("[20000,25000]","[20000,35000]"),("[50000,40000]","[50000,50000]"),("[55000,41000]","[55000,51000]"),("[100000,55000]","[100000,65000]"),("[105000,56000]","[105000,66000]"),("[120000,60000]","[120000,70000]")]:block=block.replace(old,new)
block=block.replace("ignores sublots',20000","ignores sublots',30000").replace("v(s,'C39',20000)","v(s,'C39',30000)").replace("base bands',20000","base bands',30000").replace("editable area rate',26000","editable area rate',36000").replace("charged once',37000","charged once',47000").replace("without report',32000","without report',42000")
t=t[:start]+block+t[end:]
t=t.replace('Negros_Pricing_Original_Survey.xlsx','Negros_Pricing.xlsx')
t=t.replace("v(q,'B14','Subdivision: enter Sublots 2–9 below. The remaining lot is calculated.');", "f(q,'B14','=IF(C7=\"Subdivide\",\"Enter Sublots 2–9 below. Sublot 1 is the calculated remainder.\",\"Enter the full lot area above. Sublot entries are ignored for this service.\")');")
t=t.replace("q.getRange('B12:G12').format.rowHeight=28;", "f(q,'B13','=IF(B12<>\"Ready\",\"\",IF(AND(C7=\"Subdivide\",C17=0),\"Zero remainder: the remaining-lot base is still included. Review before quoting.\",\"\"))');q.getRange('B13').format.font={size:10,color:'#9C241F'};\nq.getRange('B12:G12').format.rowHeight=28;")
t=t.replace("job('Original survey',500);\nwb.recalculate();", """job('Subdivide',500,[500]);total('Review: zero remainder retains existing base',21000);assertEq('Zero remainder notice',val(q,'B13'),'Zero remainder: the remaining-lot base is still included. Review before quoting.');
job('Relocate',500);assertEq('Zero remainder notice inactive for relocation',val(q,'B13'),'');
manual(10);assertEq('Review: 10 km travel before final rounding',val(q,'G30'),500);total('Review: final rounding absorbs 500 travel',10000);
job('Original survey',500);
wb.recalculate();""")
p.write_text(t,encoding='utf-8')
p=Path(__file__).with_name('verify_export.py');t=p.read_text(encoding='utf-8').replace("p=Path(__file__).parent/'Negros_Pricing_Original_Survey.xlsx'","p=Path(__file__).parent/'Negros_Pricing.xlsx'").replace("==20000","==30000").replace('cached PHP 20,000','cached PHP 30,000');p.write_text(t,encoding='utf-8')
p=Path(__file__).with_name('verify-roundtrip.mjs');t=p.read_text(encoding='utf-8').replace('Negros_Pricing_Original_Survey.xlsx','Negros_Pricing.xlsx').replace('!==32000','!==42000').replace('!==37000','!==47000');p.write_text(t,encoding='utf-8')
p=root/'ROADMAP.md';t=p.read_text(encoding='utf-8').replace('Negros_Pricing_Original_Survey.xlsx','Negros_Pricing.xlsx').replace('Earlier versions are retained separately.','This is the single working workbook; update this same path for future changes. Superseded deliverables are archived, not active alternatives.').replace('149 automated','154 automated').replace('editable **₱20,000 base**','editable **₱30,000 base**')
for old,new in [('or 10,000 sqm | ₱20,000','or 10,000 sqm | ₱30,000'),('survey: 15,000 sqm | ₱22,000','survey: 15,000 sqm | ₱32,000'),('survey: 20,000 sqm | ₱25,000','survey: 20,000 sqm | ₱35,000'),('₱40,000 / ₱55,000 / ₱60,000','₱50,000 / ₱65,000 / ₱70,000'),('₱32,000 final; ₱37,000 with survey report','₱42,000 final; ₱47,000 with survey report')]:t=t.replace(old,new)
t=t.replace('## Next step','''## Negros review before sign-off

- Original survey base is now ₱30,000. Its shared area rates and independent base remain editable.
- Added service-specific input guidance and a visible warning when subdivision leaves a zero remainder. The existing charge is retained pending the user's decision.
- **Decision: zero remainder.** Recommend requiring a positive remaining lot. At present, a 500 sqm mother lot with a 500 sqm entered sublot still totals ₱21,000 because the ₱13,000 remaining-lot base is charged at zero area.
- **Decision: final rounding.** The approved round-down rule can absorb fees: relocation 500 sqm with 10 km travel is ₱10,500 before rounding and ₱10,000 final. Retain the existing rule unless the business wants travel/report added after rounding or a smaller rounding increment.
- **Optional quoting details.** Add client name, site/barangay, quote reference, date and validity when this becomes an issued-quotation workflow. These do not affect pricing and are not required to finish the calculator.
- **Outside-area logistics.** Manual km is supported, but ferry fares, tolls and overnight expenses have no pricing policy yet. Decide whether these are quoted separately before using the calculator for such jobs.
- Validate the final workbook in the user's Excel or Google Sheets environment before operational sign-off. Current checks cover the authoring engine, export, reimport and visual layout.

## Next region: Zamboanga Pricing

Finish and approve Negros first. Then add Zamboanga Pricing to the same working workbook, using its actual source rules and office origin. Do not assume that Negros rates, distances or service coverage apply. Review the Zamboanga service list, base rates, area tiers, report fees and travel origin before implementing its formulas. The browser roadmap should support region-specific pricing configurations independently from office-specific distance presets.

## Next step''')
p.write_text(t,encoding='utf-8')
