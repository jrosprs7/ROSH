from pathlib import Path
import json, base64, re
root=Path(__file__).resolve().parent.parent
template=(root/'web/pricing-template.html').read_text(encoding='utf-8')
version=(root/'web/version.txt').read_text().strip()
assert version.isdigit() and len(version)>=2
js=(root/'web/pricing.js').read_text(encoding='utf-8').replace('APP_VERSION',version)
for region in ['Negros','Zamboanga']:
 config=json.loads((root/'web'/f'{region.lower()}-settings.json').read_text(encoding='utf-8'))
 html=template.replace('REGION',region).replace('LOCATION_LABEL','City / municipality' if region=='Negros' else 'Barangay / locality').replace('CONFIG_JSON',json.dumps(config,ensure_ascii=False).replace('<','\\u003c')).replace('APP_JS',js).replace('APP_VERSION',version)
 image=base64.b64encode((root/'web/assets/default-header.png').read_bytes()).decode()
 header='<img class="header-banner" src="data:image/png;base64,'+image+'" alt="ROSH Engineering Consultants — mail@roshsurveying.com">'
 html=re.sub(r'<img class="header-banner"[^>]*>',lambda match:header,html,count=1)
 target=root/region/f'ROSH {region} Pricing v.{version}.html'
 target.write_text(html,encoding='utf-8')
 print(target)

(root/'index.html').write_text((root/'web/home-template.html').read_text(encoding='utf-8').replace('APP_VERSION',version),encoding='utf-8')
