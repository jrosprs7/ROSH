# Zamboanga pricing analysis and Excel build specification

## Source and scope

Source: [ROSH ZGA Database — Zambo Pricing](https://docs.google.com/spreadsheets/d/1uFGOuIHkXiPfStX2m_i6X5t_jvM7w-0BqY22DcvbZNA/edit?gid=1010525051#gid=1010525051). Reviewed 21 September 2026. Source label B2 says “upd aug 7 2026”. The downloaded workbook in `research/source.xlsx` is a read-only source snapshot, not the future working calculator.

Inspected the exported cell values, formulas, shared-formula definitions, validation lists, and the live pricing tab's visible layout. This is formula analysis, not native Excel recalculation or completed geographic verification. The source Google Sheet was not modified.

The user confirmed that the scope is **Zambo Pricing only**. The other subdivision-named tabs inspected are project/status trackers, not pricing calculators. They must not be imported into the pricing tool. No formula in the inspected pricing calculation requires those trackers.

## Approved prices for the new workbook

The user's latest decisions supersede the source prices below. Keep all amounts and thresholds editable.

| Service / band | Base price |
| --- | ---: |
| Relocation: positive area below 1,000 sqm | ₱10,000 |
| Relocation: 1,000 to below 10,000 sqm | ₱13,000 |
| Relocation: 10,000 sqm and above | ₱15,000 |
| Subdivision: remaining lot | ₱18,000 |
| Additional sublot: positive area below 5,000 sqm | ₱8,000 |
| Additional sublot: 5,000 to below 10,000 sqm | ₱8,500 |
| Additional sublot: 10,000 sqm and above | ₱10,000 |
| Original Survey: all positive lot sizes | ₱30,000 |

Apply area surcharges separately under the agreed progressive tiers. Blank or zero optional sublots have no charge. Require at least one positive additional sublot and a positive remainder. The minimum valid subdivision is ₱18,000 + ₱8,000 = **₱26,000**, before additional charges. Travel remains ₱500 per rounded 10 km, report ₱5,000 when selected, and combined final rounding down to ₱1,000. Negros's own remaining-lot base remains ₱13,000.

## Original source pricing behavior (historical reference)

### Relocation

J6 uses E6 and C6 to select rates in R2:U2. E6 is `FLOOR(C6/10000,0.5)`.

| Positive lot area | Base |
| --- | ---: |
| Below 3,000 sqm | ₱12,000 |
| 3,000 to below 10,000 sqm | ₱14,000 |
| 10,000 sqm and above | ₱15,000 |

The source separates below 1,000 and 1,000–2,999 sqm, but both cost ₱12,000. The user subsequently replaced these source bands with the approved Negros-style bands above.

Progressive area surcharge in K6, after rounding hectares down to 0.5:

| Chargeable area portion | Relocation / ha | Subdivision / ha |
| --- | ---: | ---: |
| First hectare | Included | Included |
| Above 1 through 5 ha | ₱5,000 | ₱4,000 |
| Above 5 through 10 ha | ₱3,000 | ₱3,000 |
| Above 10 ha | ₱2,500 | ₱2,000 |

These area rates match Negros numerically today, but regional settings should remain independent unless explicitly linked by a later business decision.

### Subdivision

- Remaining-lot base J10 references R3: **₱18,000**.
- Additional sublot base J13:J20: **₱8,500** for positive areas below 10,000 sqm; **₱10,000** at 10,000 sqm and above. The source's 5,000 sqm branch selects the same ₱8,500 amount as the lower branch.
- Apply subdivision progressive area charges separately to the remaining lot and each additional sublot.
- Travel and the optional report/dispute charge are added once in N10. Additional sublot charges are accumulated in N11. N9 rounds their combined sum down to the nearest ₱1,000.
- Eight entered sublots plus the remaining lot, matching Negros's capacity.
- With positive remainder, one small additional sublot, no area surcharge, no travel and no report: ₱18,000 + ₱8,500 = **₱26,500 before rounding; ₱26,000 final**. This is source behavior, not an independently approved new minimum.

### Travel

- Q7:R7 describe distances **from Tetuan**. H6 is a selectable From field, but L6/L10 look up only I6 (To). Changing H6 does not change the charge.
- There are **93 named location rows** Q8:Q100 and 24 generic distance choices Q101:Q124 (70–300 km). The named list and approximate distances have not yet been independently verified for completeness or routing accuracy.
- T5 is ₱500 per 10 km. S8:S124 round distance/10 to the nearest integer. T8:T124 use `IF(units=1,0,units*500)`.
- For nonnegative distances, the current formula charges zero below 15 km, ₱1,000 from 15 to below 25 km, then normal rounded units × ₱500. It does **not** deduct a free first unit from larger trips.
- The note “no charge first 10km” does not precisely describe the source formula. Examples: Arena Blanco 14 km → ₱0; Cawit 15 km → ₱1,000; Bunguiao 25 km → ₱1,500.
- **Approved replacement:** follow Negros: `ROUND(one_way_km / distance_unit_km, 0) * travel_rate`, initially 10 km and ₱500. No free-distance allowance or first-unit deduction. Thus 7, 10 and 14 km each give ₱500 travel; 15 km gives ₱1,000. Round the combined final quote down to ₱1,000 afterward. Both rate and unit remain editable independently by region.
- In the new interface, use fixed Tetuan origin initially, editable destination estimates, and manual one-way km instead of pseudo-destinations. Confirm the exact office/base and routing endpoints before geographic verification. Do not reuse Bacolod distances.

### Survey report and final rounding

G6 controls a ₱5,000 charge, currently labelled Bdry Disp. in the source. The standardized interface should use **Survey report**, matching the user's naming decision. Centralize its hardcoded value in settings.

N6 and N9 round the combined total down to whole ₱1,000. Preserve the user's confirmed intention: no ₱500-ending final quotes. Travel-related extras were confirmed incorporated into travel pricing; do not add ferry, toll, or overnight charges again.

Original Survey is absent from the source service dropdown, but the user has now approved adding it at **₱30,000**, following Negros's setup: one independently editable base plus relocation's progressive area surcharges, travel, optional report and final rounding.

## Formula and usability refinements

| Source location | Finding | Build treatment |
| --- | --- | --- |
| H6; L6/L10 | From dropdown has no effect; distance table is Tetuan-based | Show the configured office origin; support a real origin-keyed table only when needed |
| L6/L10 | IFERROR returns blank for missing destination, allowing totals to omit travel | Block quote until the active distance method is valid |
| C10 versus C12 | Remaining-area formulas use different ranges: C13:C21 versus C13:C20 | One authoritative remainder using exactly the supported input rows |
| C21 and J21:K21 | Totals/remainder include an extra row with no visible sublot label or pricing formulas | Remove the unused input possibility; keep all input and charge ranges aligned |
| E9/G9/N9 | Error text is separate from the total; N9 checks only whether sublot sum is zero | Validate positive area, numeric/nonnegative sublots, at least one positive sublot, and sum strictly below mother area before showing a quote |
| J9 | Reads an error/status cell E9 as if it were hectares and is not part of the final total | Remove unused legacy calculation |
| F6 | Resi/Agri classification is not used in the quoted price | Remove, matching Negros |
| D6/D10/D13:D20 | Rounded hectares differ from actual chargeable hectares | Show chargeable hectares clearly; omit unused duplicate display calculations |
| N22 | Unlabelled half-total calculation, outside the final quote | Exclude unless the user requests a deposit/payment feature |
| C26:C44 | Separate relocation/subdivision costing summaries | One service-aware quote breakdown, matching Negros |
| K6/K10:K20, M6/M10 | Area rates and report fee are hardcoded | Move all configurable amounts and thresholds into Pricing Settings |

In the current Relocate example, source C10 displays -650 sqm while C12 displays 150 sqm because the inactive subdivision section uses different mother-area logic. This is a confusing inactive display, not an error in the shown relocation total. Suppress inactive subdivision outputs in the new workbook.

## Formatting findings

The visible source view at 100% zoom places the Total column partly beyond the right edge, uses abbreviated headers (“has comp”, “Bdry Disp?”), displays money without consistent peso/grouping formatting, and keeps inactive subdivision outputs visible. These are source-layout issues; the source remains unchanged. The new file should use Negros's navy/amber visual standard, clearer units and labels, muted inactive inputs, and an accessible final total. Long barangay names must be checked for clipping when rendered. No new-workbook formatting pass is claimed yet.

## Planned deliverable and shared-change policy

The delivered master is **Zamboanga_Pricing.xlsx** in this folder, updated at that same path on future revisions. Two sheets: **Zamboanga Pricing** and **Pricing Settings**, matching Negros's layout, features, input colours, validation, and quote breakdown. It opens with a 500 sqm mother lot and 200 sqm additional sublot at Tetuan: ₱26,000 final.

Shared changes in either region must be applied to both workbooks and verified in both. Regional prices, source-driven pricing rules, service availability, origins and distances remain independent. SKILL.md records this bidirectional requirement. Positive-remainder validation, wrapped location fields and settings notes are now applied to both masters.

The Negros master was imported and updated in place. All existing settings/source values and current job inputs were preserved. Carry the approved regional rules into the future browser configuration without hardcoding prices in UI code.

## Historical source baseline cases

Formula-derived examples below assume no report and Tetuan/zero travel unless stated. They must become executable tests in the build; they have not been executed against a newly built workbook.

| Scenario | Expected final quote |
| --- | ---: |
| Relocation 800 or 2,999 sqm | ₱12,000 |
| Relocation 3,000 or 9,999 sqm | ₱14,000 |
| Relocation 10,000 sqm | ₱15,000 |
| Relocation 15,000 sqm | ₱17,000 (₱17,500 before rounding) |
| Relocation 50,000 / 100,000 / 120,000 sqm | ₱35,000 / ₱50,000 / ₱55,000 |
| Subdivision 500 sqm, entered sublot 200 sqm | ₱26,000 (₱26,500 before rounding) |
| Subdivision 30,000 sqm, entered sublot 10,000 sqm | ₱32,000 |
| Source example: Relocation 800 sqm, Boalan 7 km | ₱12,000 |
| Same source example with report selected | ₱17,000 |
| Existing travel policy: Relocation 800 sqm, 14 / 15 / 25 km | ₱12,000 / ₱13,000 / ₱13,000 |

Also test 0/blank/negative areas, equal or excess sublot totals, invalid destinations, inactive fields, zero versus blank distance, editable rates, 0.5 ha boundaries, 5/10 ha transitions, travel boundaries, and final rounding. Require valid manual distance for sites outside the preset table.

## Confirmed build decisions

1. Use Negros-style travel calculation, with no free-distance allowance. Keep Tetuan-based Zamboanga distances.
2. Include Original Survey at ₱30,000 with shared relocation area surcharges within the regional workbook.
3. Import only the Zambo Pricing calculator, excluding database and project/status tabs.
4. Use Negros relocation base bands: ₱10,000 below 1,000 sqm, ₱13,000 from 1,000 to below 10,000 sqm, and ₱15,000 thereafter.
5. Latest decision: match Negros, including the ₱13,000 remaining-lot base (superseding ₱18,000), and additional-sublot bands of ₱8,000 / ₱8,500 / ₱10,000 at positive-area / 5,000 sqm / 10,000 sqm thresholds.

Add build cases for travel before final rounding: 7/10/14 km → ₱500, 15 km → ₱1,000, 235 km → ₱12,000. Original Survey at 500 sqm and zero travel → ₱30,000; at 20,000 sqm → ₱35,000; at 500 sqm with 235 km → ₱42,000, or ₱47,000 with report. The table above describes the old source baseline where explicitly labelled; test approved changes separately rather than treating the source's free-distance behavior as a required result.

## Approved-price acceptance cases

Use zero travel and no report unless stated. These cases are covered by the completed build checks.

| Scenario | Expected result |
| --- | --- |
| Relocation 999 sqm | ₱10,000 |
| Relocation 1,000 / 3,000 / 9,999 sqm | ₱13,000 |
| Relocation 10,000 sqm | ₱15,000 |
| Subdivision 500 sqm, additional sublot 200 sqm | ₱21,000 |
| Additional sublot 4,999 / 5,000 / 9,999 / 10,000 sqm | Base ₱8,000 / ₱8,500 / ₱8,500 / ₱10,000; area surcharge separate |
| Subdivision 20,000 sqm, additional sublot 5,000 sqm | ₱23,500 before rounding; ₱23,000 final |
| Subdivision 30,000 sqm, additional sublot 10,000 sqm | ₱27,000 |

## Delivery validation

- 425 checks across Zamboanga and Negros passed in the authoring engine: service bands, area tiers, all presets, manual distance, invalid entries, editable settings, rounding, report fees, and Negros settings preservation.
- 11 additional checks passed after exporting and reimporting the masters, including live rates, manual travel, reports, and zero-remainder blocking.
- Export inspection confirmed two sheets per master, dropdowns, named destinations, the approved rates, expected cached totals, all 93 Zamboanga source locations/distances, and no cached formula errors.
- Rendered and visually inspected both pricing sheets and Zamboanga settings, sources, and representative location ranges. Long-location wrapping was added consistently. No clipped labels or currency totals were found in the inspected previews.
- Geographic verification and native Excel/Google Sheets testing remain unperformed. The workbook identifies preset distances as source estimates and supports manual km.


## Destination review — 22 September 2026

Prepared an in-place update for all 98 PSA barangays plus San Ramon (Talisayan locality). Ten island destinations have the (island) suffix; seven existing island distances and charges are preserved. Landang Laum, Manalipa and Tumitus have no supported source preset and require Manual km or a supplied setting. Road references use Tetuan Barangay Hall (6.9175351, 122.0909369), with OSM/Nominatim locations and OSRM routes cached in research/reviewed-distances.json. Hall, centre and school endpoints are labelled; Lamisahan uses mapped road access, with a 0.9 km unmapped approach explicitly noted.

Shared distance controls now use Preset estimate and Manual km; region labels are barangay/locality versus city/municipality. Negros has been saved, reimported and checked without changing rates or distances.

**Saved successfully on 22 September 2026:** Both master workbooks were updated in place, exported and reimported. Zamboanga now uses the current Negros prices and thresholds, including the ₱13,000 remaining-lot base and ₱21,000 minimum subdivision charge. All 99 destination entries are saved. The checks passed: 127 destination/preservation checks, 11 export/reimport checks, 62 pricing review checks, and XML export validation for both files. Native Excel testing remains unperformed.

Unnecessary .00 displays and trailing decimal points were removed consistently; fractional areas and distances remain visible. The remainder stays mother-lot area minus the additional sublots entered by the user. No automatic lot reordering is applied. Add sublot is confirmed for the future HTML interface. Equal Share remains a proposed optional mode, with the number of shares including the remaining lot; it is not implemented. Formula protection and pricing-version metadata are deferred at the user's request.
