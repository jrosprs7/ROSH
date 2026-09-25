import zipfile
import xml.etree.ElementTree as E
from pathlib import Path
p=Path(__file__).parent/'Negros_Pricing.xlsx'
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(p) as z:
    w=E.fromstring(z.read('xl/workbook.xml'))
    names=[(e.attrib,e.text) for e in w.findall('s:definedNames/s:definedName',ns)]
    assert any(a.get('name')=='Destinations' and 'G$7:$G$150' in t for a,t in names)
    r=E.fromstring(z.read('xl/worksheets/sheet1.xml'))
    dropdowns=[(e.attrib,e.find('s:formula1',ns).text) for e in r.findall('s:dataValidations/s:dataValidation',ns)]
    assert any(a.get('sqref')=='C9' and t=='Destinations' for a,t in dropdowns)
    assert any(a.get('sqref')=='G8' and 'Manual km' in t for a,t in dropdowns)
    cells={e.attrib['r']:e for e in r.findall('.//s:sheetData/s:row/s:c',ns)}
    assert any(a.get('sqref')=='C7' and 'Original survey' in t for a,t in dropdowns)
    assert float(cells['G5'].find('s:v',ns).text)==30000
    assert cells['G5'].find('s:f',ns) is not None
    errors=[]
    for name in ['xl/worksheets/sheet1.xml','xl/worksheets/sheet2.xml']:
        rt=E.fromstring(z.read(name))
        errors.extend([e.attrib['r'] for e in rt.findall('.//s:c',ns) if e.attrib.get('t')=='e'])
    assert not errors, errors
    # Preserve existing rates and travel formulas while adding the service branches.
    old_path=Path(__file__).parents[2]/'research'/'superseded-workbooks'/'Negros_Pricing_Travel_Update.xlsx'
    with zipfile.ZipFile(old_path) as old:
        def scalar_cells(data):
            root=E.fromstring(data)
            return {e.attrib['r']:e for e in root.findall('.//s:sheetData/s:row/s:c',ns)}
        previous=scalar_cells(old.read('xl/worksheets/sheet1.xml'))
        for address in ['C30',*[f'G{row}' for row in range(29,35)]]:
            assert cells[address].find('s:f',ns).text==previous[address].find('s:f',ns).text,address
        settings=scalar_cells(z.read('xl/worksheets/sheet2.xml'))
        old_settings=scalar_cells(old.read('xl/worksheets/sheet2.xml'))
        for row in [*range(7,12),*range(14,20),*range(22,32),*range(34,38)]:
            address=f'C{row}'
            assert settings[address].find('s:v',ns).text==old_settings[address].find('s:v',ns).text,address
        for row in range(7,39):
            address=f'H{row}'
            assert settings[address].find('s:v',ns).text==old_settings[address].find('s:v',ns).text,address
        assert float(settings['C39'].find('s:v',ns).text)==30000
    print('Preservation verified: existing rates, distances and quote-summary formulas unchanged.')
    print('Export verified: Original survey dropdown, editable base, live total formula, cached PHP 30,000, no cached formula errors.')
    print('File bytes:',p.stat().st_size)
