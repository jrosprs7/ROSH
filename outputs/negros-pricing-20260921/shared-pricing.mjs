// Apply shared interface changes to each region without replacing its rates or inputs.
export function refinePricing(q,s){
 const current=q.getRange('B12').formulas[0][0];
 q.getRange('B12').formulas=[[current.replace('SUM(C18:C25)>C8','SUM(C18:C25)>=C8').replace('Sublot areas exceed the mother lot.','Sublot total must be less than the mother lot.')]];
 q.getRange('B13').clear({applyTo:'contents'});
 q.getRange('C9').format.wrapText=true;
 q.getRange('B9:G9').format.rowHeight=42;
 s.getRange('G7:G150').format.wrapText=true;
 s.getRange('D7:D39').format.wrapText=true;
}

// The same distance controls apply to cities, municipalities, barangays and islands.
export function refineDestinationLabels(q,s,region){
 const replace=t=>t.replaceAll('Town estimate','Preset estimate').replaceAll('Town estimates','Preset estimates').replaceAll('town estimate','preset estimate').replaceAll('town estimates','preset estimates').replaceAll('one-way road distance','one-way travel distance');
 for(const sh of [q,s]){
  const range=sh.getRange('B1:K150'),values=range.values,formulas=range.formulas;
  for(let r=0;r<150;r++)for(let c=0;c<10;c++){
   const cell=sh.getCell(r,c+1),formula=formulas[r]?.[c],value=values[r]?.[c];
   if(formula&&replace(formula)!==formula)cell.formulas=[[replace(formula)]];
   else if(!formula&&typeof value==='string'&&replace(value)!==value)cell.values=[[replace(value)]];
  }
 }
 q.getRange('G8').dataValidation={rule:{type:'list',values:['Preset estimate','Manual km']}};
 q.getRange('C9').conditionalFormats.deleteAll();
 q.getRange('C9').conditionalFormats.addCustom('$G$8="Manual km"',{fill:'#F0F2F4',font:{color:'#84909C'}});
 q.getRange('G9:G10').conditionalFormats.deleteAll();
 q.getRange('G9:G10').conditionalFormats.addCustom('$G$8="Preset estimate"',{fill:'#F0F2F4',font:{color:'#84909C'}});
 q.getRange('F9').values=[['One-way travel km']];
 q.getRange('B9').values=[[region==='Zamboanga'?'Barangay / locality':'City / municipality']];
 s.getRange('G6').values=[[region==='Zamboanga'?'Barangay / locality':'City / municipality']];
 q.getRange('G7:G10').format.wrapText=true;
 q.getRange('F9').format.wrapText=true;
 q.getRange('B8:G8').format.rowHeight=32;
 s.getRange('G7:I150').format.verticalAlignment='center';
 s.getRange('G7:I150').format.font.name='Arial';
 s.getRange('G7:I150').format.font.size=11;
}

export function simplifyNumberDisplay(q,s){
 const money='"₱"#,##0;[Red]("₱"#,##0);"₱"0';
 const number='General';
 for(const a of ['G5','E17:G25','G29:G34'])q.getRange(a).setNumberFormat(money);
 for(const a of ['C8','G9','C17:D25','C30'])q.getRange(a).setNumberFormat(number);
 s.getRange('C7:C39').setNumberFormat(number);
 for(const r of [7,8,9,14,15,16,17,22,23,24,25,26,27,34,36,37,39])s.getRange(`C${r}`).setNumberFormat(money);
 s.getRange('H7:H150').setNumberFormat(number);
 s.getRange('I7:I150').setNumberFormat(money);
 q.getRange('B27').values=[['Enter up to 8 additional sublots; the unentered balance is the remaining lot.']];
}
