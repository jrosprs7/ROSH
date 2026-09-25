import zipfile, xml.etree.ElementTree as E, json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
for region in ['Negros','Zamboanga']:
 with zipfile.ZipFile(root/region/(region+'_Pricing_Equal_Share.xlsx')) as z:
  strings=[''.join(x.itertext()) for x in E.fromstring(z.read('xl/sharedStrings.xml'))]
  def cells(i):
   out={}
   for c in E.fromstring(z.read(f'xl/worksheets/sheet{i}.xml')).findall('.//s:c',ns):
    val=c.find('s:v',ns)
    if val is None: continue
    t=c.attrib.get('t'); x=val.text
    out[c.attrib['r']]=strings[int(x)] if t=='s' else x if t in ['str','e'] else (float(x) if x is not None else None)
   return out
  q,s=cells(1),cells(2)
  rows=[7,8,9,10,11,14,15,16,17,18,19,22,23,24,25,26,27,28,29,30,31,34,35,36,37,39,42]
  config={'region':region,'origin':q['G7'],'rates':{str(r):s[f'C{r}'] for r in rows},'labels':{str(r):s[f'B{r}'] for r in rows},'destinations':[{'name':s[f'G{r}'],'km':s.get(f'H{r}'),'note':s.get(f'K{r}','')} for r in range(7,151) if s.get(f'G{r}')],'originDestination':'Bacolod City' if region=='Negros' else 'Tetuan'}
  (root/'web'/f'{region.lower()}-settings.json').write_text(json.dumps(config,ensure_ascii=False,indent=2),encoding='utf-8')
