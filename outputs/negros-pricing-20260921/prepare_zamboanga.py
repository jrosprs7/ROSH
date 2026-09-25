from pathlib import Path
base=Path(__file__).parent
text=(base/'build.mjs').read_text(encoding='utf-8')
prefix=text.split('// Meaningful regression cases:')[0]
prefix=prefix.replace("import {Workbook, SpreadsheetFile}","import {Workbook, SpreadsheetFile, FileBlob}")
prefix=prefix.replace("const distanceReview=JSON.parse(await fs.readFile(new URL('../../research/reviewed-distances.json',import.meta.url),'utf8'));", "const sourceRows=JSON.parse(await fs.readFile(new URL('../../Zamboanga/research/distances.json',import.meta.url),'utf8'));\nconst distanceReview={rows:sourceRows.map(([name,km])=>[name,null,km,'Source estimate; verify actual-site distance.'])};")
prefix=prefix.replace('Negros Pricing','Zamboanga Pricing').replace('Bacolod City','Tetuan').replace('Bacolod','Tetuan')
prefix=prefix.replace("[14,'Subdivision: remaining-lot base',13000", "[14,'Subdivision: remaining-lot base',18000")
prefix=prefix.replace('1WL239Dave3H1AB8nJ1-tSG2ihH1x_ccZQ6zW4PgqOOk/edit?gid=0#gid=0','1uFGOuIHkXiPfStX2m_i6X5t_jvM7w-0BqY22DcvbZNA/edit?gid=1010525051#gid=1010525051')
prefix=prefix.replace('ROSH NGR Database','ROSH ZGA Database').replace('Town estimates use the provincial map. Use Manual km for the actual site, anywhere.','Source estimates are not route-verified. Use Manual km for the actual site.')
prefix=prefix.replace('12 component cities + 19 municipalities + Tetuan.','93 source locations. Completeness not independently verified.').replace('Approximate town-center distances. Use Manual km for the actual site.','Source distance estimates. Use Manual km for the actual site.')
start=prefix.index('const refs='); end=prefix.index('for(const [r,label,text]of refs)',start)
prefix=prefix[:start]+"const refs=[[51,'Location review','93 named source locations. Names and distances are not independently verified.'],[52,'Distance source',source],[53,'Origin','Tetuan, as identified in the source distance table.'],[54,'Travel policy','Approved Negros-style travel: rounded km / 10 × PHP 500. No free-distance allowance.'],[55,'Rate revisions','Approved relocation and sublot bands match Negros; remaining-lot base is PHP 18,000.'],[56,'Original Survey','Approved base PHP 30,000 plus relocation area surcharges.'],[57,'Travel inclusions','Travel pricing includes ferry fares, tolls and overnight expenses. No separate charges.'],[58,'Scope','Zambo Pricing only. Source project trackers are excluded.'],[59,'Manual distance','Enter one-way km from Tetuan to the actual site. Presets are replaced, not added.'],[60,'Maintenance','Rates remain editable. Save an issued quote separately to preserve its applied rates.']];\n"+prefix[end:]
prefix=prefix.replace('Manual km works anywhere, including Negros Oriental. Enter one-way road km from Tetuan.','Manual km works beyond the preset list. Enter one-way road km from Tetuan.')
prefix=prefix.replace('Tetuan to town center','Tetuan to preset site')
(base/'build-zamboanga.mjs').write_text(prefix+'\n// Shared refinements, validation, and export are implemented below.\n',encoding='utf-8')
# Keep the legacy Negros builder consistent with the corrected validation for future maintenance.
text=text.replace('SUM(C18:C25)>C8','SUM(C18:C25)>=C8').replace('Sublot areas exceed the mother lot.','Sublot total must be less than the mother lot.')
text=text.replace("f(q,'B13','=IF(B12<>\"Ready\",\"\",IF(AND(C7=\"Subdivide\",C17=0),\"Zero remainder: the remaining-lot base is still included. Review before quoting.\",\"\"))');", "v(q,'B13','');")
text=text.replace("total('Review: zero remainder retains existing base',21000);assertEq('Zero remainder notice',val(q,'B13'),'Zero remainder: the remaining-lot base is still included. Review before quoting.');", "total('Zero remainder blocks quote','');assertEq('Zero remainder corrective status',val(q,'B12'),'Sublot total must be less than the mother lot.');")
(base/'build.mjs').write_text(text,encoding='utf-8')
