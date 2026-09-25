---
name: regional-survey-pricing
description: Create, update, or review this business's Negros and Zamboanga survey-pricing workbooks with consistent formatting, setup, and features while preserving each region's approved pricing rules.
---

# Regional survey pricing workbooks

Use these project instructions for regional pricing workbooks and their future browser equivalents. Apply the available spreadsheet-authoring skill for file creation, formula recalculation, rendering, and export. This file defines the business-specific consistency requirements.

## Working files and regional separation

- Maintain one active Excel file per region. Update that same file in place rather than making a new deliverable for every revision.
- Keep Negros and Zamboanga in separate Excel files. The intended arrangement is `Negros/Negros_Pricing.xlsx` and `Zamboanga/Zamboanga_Pricing.xlsx` within this project.
- Current masters are `Negros/Negros_Pricing_Equal_Share.xlsx` and `Zamboanga/Zamboanga_Pricing_Equal_Share.xlsx`. The user explicitly requested new files for the Equal Share feature. Preserve `outputs/negros-pricing-20260921/Negros_Pricing.xlsx` and `Zamboanga/Zamboanga_Pricing.xlsx` as pre-Equal-Share backups. Update the new masters in place going forward unless another copy is requested.
- Create the Zamboanga folder and workbook when the user supplies its source and the work begins. Do not manufacture prices or distance presets in advance.
- Before updating an existing workbook, read its actual inputs and settings. Preserve manual user changes; do not rerun a builder with stale defaults that overwrite them.
- Keep builders, research, previews, and archived files separate from active deliverables. If an open file prevents overwriting or archiving, report the exact file and request that it be closed. Do not silently create another active version.
- Read `ROADMAP.md` for project context, but prefer the user's latest confirmed decisions over stale roadmap text. Do not treat planned features as already implemented.

## Shared workbook setup and features

Use the Negros master as the formatting and functional reference. Retain its two-sheet structure: a region-named Pricing sheet and Pricing Settings. Similar functions should appear in similar positions and use the same terminology and units.

The common interface should support, where applicable to the regional source:

- Service selection, lot or mother-lot area in sqm, destination, office origin, distance method, manual one-way road km, optional site label, and Survey report selection.
- Subdivision inputs with a calculated remaining lot; ignore and visually mute sublot inputs for other services.
- Destination presets and manual distance entry for sites beyond the preset coverage. Use the shared mode name `Preset estimate`; identify Zamboanga destinations as barangays/localities and Negros destinations as cities/municipalities. Use distances from the selected office reference, never another region's origin.
- A prominent final quote and a readable breakdown of base prices, chargeable hectares, additional-area charges, travel, survey report, subtotal, rounding adjustment, and total.
- Clear corrective messages and no plausible-looking quote when required inputs or settings are invalid. Distinguish blank values from valid zero charges or zero distance.
- Editable, centralized base prices, sublot rates, area thresholds and rates, rounding increments, travel rate/unit, report charge, and distance presets. Formulas must reference these settings rather than duplicate prices.
- Source and route qualifications beside the settings or reference data. Explain which values are estimates and which inputs are inactive.

Do not invent a service or copy Negros rates into Zamboanga merely to make their interfaces match. Explain any source-driven feature differences to the user. Preserve compatible shared features unless the user requests a change.

### Keep both regions synchronized

When the user changes a shared feature, settings structure, terminology, or formatting in either region, apply the corresponding change to both Negros and Zamboanga in the same task. Update their supporting builders and browser specification as needed, and verify both workbooks. This includes input controls, validation, settings organization, breakdowns, and visual styling.

Keep regional rate values, service availability, formulas dictated by approved regional policy, office origins, and destination distances independent. A regional price change does not authorize copying that price to the other region. If a requested change could mean either a shared feature or a different regional pricing policy, clarify the policy before changing calculations.

If the other workbook has not yet been created, record the shared change in its build specification and apply it on creation. If it is unavailable or locked, finish accessible work and tell the user exactly which synchronization remains pending. Do not report both regions synchronized until both have been checked. Report formatting defects found in either workbook, including whether they were fixed.

## Formatting standard

Preserve the current Negros visual language:

| Element | Standard |
| --- | --- |
| Font | Arial, normally 11 pt; 10 pt for secondary notes and 16 pt for titles/key total |
| Section headers and final total | Navy `#233C59`, bold white text |
| Main text | Dark blue-grey `#243447` |
| Editable inputs | Pale amber `#FFF2CC` with blue text `#164D8D` |
| Calculated summary shading | Light blue-grey `#EDF2F7` |
| Inactive inputs | Grey `#F0F2F4` with muted text `#84909C` |
| Invalid-input status | Pale red `#FCE4D6` with dark red `#9C241F` |
| Gridlines | Hidden |
| Currency | Peso symbol and thousands separators; consistent decimal display across both workbooks |
| Areas and distance | Clearly labelled sqm, ha, and km; consistent number formats |

Keep numbers right-aligned and descriptive text legible. Match section order, header treatment, input colours, and total emphasis across regions. Adjust column widths and row heights to fit regional names and notes; do not force identical dimensions when that clips content. Use wrapping for long notes, not tiny fonts. Do not add decorative sheets or a separate formatting dashboard.

## Confirmed Negros rules

These are Negros-specific decisions, not automatic Zamboanga defaults:

- Original Survey base: ₱30,000, independently editable; shares relocation's progressive area surcharges.
- Subdivision: ₱13,000 remaining-lot base plus at least one additional sublot, whose minimum base is ₱8,000. The intended minimum valid subdivision quote before additional charges is ₱21,000.
- A valid subdivision has at least one positive additional sublot and a positive remaining lot. Reject combined additional-sublot area equal to or greater than mother-lot area. This correction is implemented and tested in both regional masters.
- Round the combined quote down to the nearest configured ₱1,000. Thus ₱10,500 becomes ₱10,000. Do not reinterpret this as rounding to multiples of ₱10,000 or preserving ₱500-ending totals.
- The user confirmed ferry fares, tolls, and overnight expenses are incorporated into travel pricing. Do not add them again as separate charges.
- Keep all other approved Negros rates and calculations unless the user changes them.

## Current regional masters and maintenance

- Zamboanga master: `Zamboanga/Zamboanga_Pricing_Equal_Share.xlsx`. Retain the agreed relocation bands, ₱13,000 remaining-lot base, Negros additional-sublot bands, ₱30,000 Original Survey base, and ₱500 per rounded 10 km. The approved distance reference is Tetuan Barangay Hall, near the office. Include all 98 PSA barangays; San Ramon may remain as a locality within Talisayan.
- Append `(island)` to island barangay display names. Preserve the existing island distance presets and travel calculation unless the user changes them. Do not add an island surcharge. For newly added destinations without a supported preset, leave km blank and require Manual km or an entered preset; never convert an unknown distance into zero travel.
- Keep endpoint and route qualifications beside Zamboanga distance presets. Mapped barangay-centre routes are estimates, not confirmed barangay-hall routes or actual survey-site routes. Retain source estimates with an explicit qualification if a reliable route is unavailable. Route research is in `Zamboanga/research/reviewed-distances.json`; update the current master rather than copying historical defaults over user edits.
- Shared validation and formatting changes are centralized in `outputs/negros-pricing-20260921/shared-pricing.mjs`. Apply this helper to imported masters when changing shared behavior; preserve existing settings and inputs.
- `build-zamboanga.mjs` is the initial creation builder and deliberately refuses to overwrite an existing Zamboanga master. For future changes, import and edit the current workbook rather than regenerating defaults. The older Negros builder likewise must not overwrite user-edited settings.
- Both masters passed 425 combined authoring-engine checks and 11 export/reimport checks on initial Zamboanga delivery. Native Excel/Google Sheets testing remains unperformed.

## Verification and formatting notifications

Before delivering a workbook update:

1. Recalculate representative cases for affected services, band boundaries, editable settings, inactive inputs, and invalid inputs. For subdivision, include equal/excess area and valid positive remainder. Verify the shared feature behaves consistently across regional workbooks when both exist.
2. Check export/reimport where needed, formula errors, dropdowns, and the final quote. State which calculation environment was tested; do not imply native Excel or Google Sheets verification without performing it.
3. Render and inspect the pricing sheet and affected settings/reference sections. Look for clipped or overlapping labels, `#####` displays, truncated peso totals, inconsistent number formats, unreadable route notes, missing input highlights, and confusing inactive fields.
4. Fix ordinary formatting defects within the authorized edit. Compare with the other region's workbook if available; otherwise identify Negros as the reference and do not claim a cross-region review.
5. Notify the user of formatting issues found. Identify the workbook, sheet and cells/section; say whether the issue was fixed or remains unresolved. If it cannot be fixed or verified, state the limitation plainly. Do not claim formatting passed when no visual check was performed.

Summarize the pricing change, relevant validation results, and any material formatting findings. Deliver one active file for the requested region. Keep future browser plans aligned with the approved rules while leaving regional rates and office-distance tables independent.

## Latest decisions — 22 September 2026

- Zamboanga now follows Negros pricing amounts and thresholds, including the PHP 13,000 subdivision remainder base and PHP 21,000 minimum two-lot subdivision before extras. Regional origins and distances remain independent.
- The remainder is mother-lot area minus the additional sublot areas entered by the user. Do not automatically choose the largest lot or rearrange lot roles.
- Both Excel files are calculation references for the future HTML tool. No sheet protection or pricing-version/effective-date fields are requested now.
- The browser must offer Add sublot and the approved Equal Share mode described below.
- Remove unnecessary .00 displays consistently in both workbooks; preserve fractional area and distance values.

## Approved Equal Share feature

- For Subdivide only, offer Specify sublots (default) or Equal Share. Both modes allow 2–18 total lots, including the remaining/first lot. Use one limit of 18, without a partition-agreement option or a separate nine-lot restriction. Equal Share requires an integer count. Ignore manual sublot inputs in this mode; preserve them when switching back.
- Calculate each lot's area as mother area / count, retaining full precision. Apply the existing remainder base once and the existing additional-sublot base to count minus one lots, with the usual area surcharge on each equal lot. Manual inputs now cover 17 additional lots: C18:C25 and C52:C60, plus the automatic remainder. Include both ranges in validation, remainder and totals. The HTML Add sublot control must stop at 17 additional lots.
- Add travel and survey report once to the job total, then divide by lot count. The user explicitly confirmed including both extras before dividing.
- Equal price per lot = FLOOR(unrounded job total / lot count, equal-share rounding step). The editable step is PHP 500 in Pricing Settings C42. Final quote = equal price per lot × count. Do not apply the ordinary PHP 1,000 job rounding before or after this calculation.
- All other modes keep their original rounding and formulas. Example: 600 sqm / 3, zero travel and no report: 13,000 + 8,000 + 8,000 = 29,000; per lot 9,500; final 28,500.
- Shared feature builder: `outputs/negros-pricing-20260921/add-equal-share.mjs`. This migration imports the pre-feature originals and creates the two new files; do not rerun it over future user changes. Future maintenance must import the current Equal Share masters.
- Latest limit migration: `outputs/negros-pricing-20260921/limit-subdivision.mjs`. Both current masters include the 18-lot cap; pre-Equal-Share backups remain unchanged. Migration scripts are not general maintenance scripts and must not overwrite later manual inputs.
- The user explicitly declined an extra safeguard for an unrealistically large rounding step such as PHP 10,000. Leave that behavior alone; keep the approved default of PHP 500. Do not add a partition-agreement control or wording.

## HTML calculators

- Standalone deliverables: `Negros/ROSH Negros Pricing v.01.html` and `Zamboanga/ROSH Zamboanga Pricing v.01.html`. Shared source: `web/pricing-template.html` and `web/pricing.js`; regional settings JSON files are extracted from the current workbooks by `web/extract-settings.py`. Build with `web/build-html.py`. Preserve administrator changes before replacing a distributed HTML file or its embedded configuration.
- Follow the user's sketch: compact responsive one-page form; light blue dropdowns, light green typed inputs, light yellow read-only calculated amounts. Settings sit behind a diamond button. Only show subdivision controls for Subdivision; show additional manual boxes only after Add sublot. Keep automatic remainder distinct from typed additional sublots.
- Standalone settings save locally per browser and regional/default configuration. Download updated HTML embeds the current settings for distribution. This is not a shared server settings store, and the password gate is a local convenience lock, not server-side authentication. Do not claim otherwise. Business-domain hosting and central admin access remain future work.
- Settings must retain complete valid rate values. Price inputs, service totals, travel/report extras, both rounding methods, the 18-lot cap and missing-preset behavior follow the workbook. No extra zero-price safeguard was added.
- Browser tests use `outputs/negros-pricing-20260921/test-html.mjs`: compares actual HTML calculations against current workbook calculations, validates UI transitions, all destinations, local persistence, downloaded HTML, mobile overflow and browser errors. Shared feature changes must update and test both HTML files as well as both workbook references where applicable.

- Extended HTML review: all Equal Share counts 2–18, band/area/travel boundaries, modified rates, invalid inputs, 17 manual sublots, mode switching and mobile layouts at 320/390/768/1280 px. Audit script: outputs/negros-pricing-20260921/stress-html.mjs. Twenty thousand seventy scenarios passed across both regions; separate workbook comparisons and settings/download tests also passed. No finite test suite proves all possible numeric inputs.

- The user renamed the HTML deliverables to ROSH Negros Pricing v.01.html and ROSH Zamboanga Pricing v.01.html. Preserve these current filenames, including the v.01 suffix, in builds, links, tests and Download updated HTML. Do not automatically increment the version on each edit.

- Settings now require the user-specified administrator password in both HTML files. Store only its SHA-256 digest in delivered source. Relock on settings close, Escape and page reload; downloaded HTML retains the gate. Test with test-password.mjs and supply the password via ROSH_SETTINGS_PASSWORD, not a committed test constant. Static-file code can be modified to bypass the local gate; domain hosting needs server-side authentication for enforceable access control.

- Both HTML files must display the exact footer: ROSH File Only - Do Not Distribute.

## Client quotation summaries

Both HTML files provide an expandable Quotation summary and Copy quotation button below the calculated summary. Use the exact user-approved Relocation and Subdivision scope wording in web/pricing.js, including DENR plan approval for subdivision. Do not add an unapproved Original Survey scope. Include current area/lot count, actual selected location or manual site, report inclusion, final rounded total and equal price per lot when relevant. Hide and clear the quotation for invalid inputs. Never copy internal settings or fee breakdowns. Preserve the 50%-size header and v.01 filenames.

- In the client quotation summary, omit the survey-report line entirely when not selected. Show Survey report: Included only when selected. This does not change pricing or the on-screen cost breakdown.



- Default header for BOTH regions: the latest orange/gold ROSH ENGINEERING CONSULTANTS banner with mail@roshsurveying.com, stored at web/assets/default-header.png. Embed unchanged as a PNG data URL, retaining the reduced 50% width and natural aspect ratio. This replaces all earlier headers and removes the Negros-specific branding exception. Preserve in future builds and downloaded HTML.

## Multi-lot Relocation — approved HTML feature

- Both HTML calculators support 2–30 relocation lots for one visit. Require confirmation that the lots are adjacent or nearby within the same city/municipality. This does not change the subdivision limit of 18.
- Calculate the ordinary relocation charge separately for each lot, including its area surcharge. Keep one highest-priced lot at full price; discount all others by 50% for adjacent lots or 30% for nearby lots. Input order must not affect the total, including tied highest charges.
- Travel is charged once. Survey reports are separate, undiscounted charges per lot; selecting reports applies to every lot and the UI must say so.
- Sum service charges, travel and reports, then apply the ordinary downward PHP 1,000 rounding once. Do not round individual discounted charges. Equal Share retains its existing separate method.
- Discount percentages are editable settings (43 and 44), valid from 0 through 100. Supply defaults when loading older configurations without losing existing rates or changing the existing storage fingerprint.
- The current Excel files remain pre-multi-lot calculation references; this feature is implemented in HTML only. Do not imply workbook support.
- Maintain README.md as the engineer and administrator guide. Update both HTML files and documentation together for shared behavior changes. Verify with test-multi.mjs plus existing regression checks as appropriate.
