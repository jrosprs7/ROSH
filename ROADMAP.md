# Negros Pricing Web App Roadmap

## Goal

Replace the Google Sheets pricing workflow with a simple browser-based calculator hosted on the business domain. Staff should be able to prepare relocation, original survey, and subdivision quotes quickly, see a clear breakdown, and update pricing without editing formulas or application code.

Standalone HTML calculators are now built for Negros and Zamboanga. Business-domain deployment and shared settings hosting remain future work.

## Current baseline

- Current reference workbook: [Negros_Pricing.xlsx](outputs/negros-pricing-20260921/Negros_Pricing.xlsx). This is the single working workbook; update this same path for future changes. Read its current inputs/settings before future edits so manual user changes are preserved. The travel revision is archived in `research/superseded-workbooks`. The older Original Survey revision is superseded but still open/locked; move it to that archive after it is closed.
- Source: [ROSH NGR Database — Negros Pricing](https://docs.google.com/spreadsheets/d/1WL239Dave3H1AB8nJ1-tSG2ihH1x_ccZQ6zW4PgqOOk/edit?gid=0#gid=0).
- Workbook tabs: **Negros Pricing** and **Pricing Settings**.
- The Zamboanga delivery and shared Negros update passed 425 combined authoring-engine checks and 11 export/reimport checks, plus export inspection and visual checks. Negros's current inputs and settings were preserved. Both files now require a positive subdivision remainder. Native Excel and Google Sheets behavior has not yet been verified.
- The location list was checked against the PSA: all 12 component cities and 19 municipalities are present, plus the administratively separate Bacolod City. `Enrique B. Magalona` and `Salvador Benedicto` use the PSA names, with common aliases documented.
- Local distances now use the provincial tourism map on PDF page 2 as a consistent planning reference. These are approximate city/town-center estimates, not live routes from an exact office address. See [reviewed distance data and sources](research/reviewed-distances.json).
- The workbook is the initial reference for rates and calculations. Once launched, the app should have one authoritative, versioned pricing configuration rather than independently maintained spreadsheet and app rates.

## Confirmed pricing rules

All prices below are initial defaults in Philippine pesos and must remain editable.

### Relocation

| Lot area | Base price |
| --- | ---: |
| Below 1,000 sqm | ₱10,000 |
| 1,000 to below 10,000 sqm | ₱13,000 |
| 10,000 sqm and above | ₱15,000 |

- Add progressive area charges, travel, and an optional survey report.
- Remove the former ₱14,000 branch and the Resi/Agri distinction.
- Require a positive lot area; zero area does not produce a quote.

### Original survey

- Separate service selection, with an editable **₱30,000 base** in Pricing Settings C39.
- Implementation interpretation: one base price for all positive lot sizes, plus the same progressive area surcharges as relocation. No additional original-survey base-price bands are introduced.
- Shares relocation's area rates and thresholds; changing these shared settings affects both services. The base remains independently editable.
- Uses the same travel, optional survey-report fee, and final rounding rules. Sublot inputs are ignored.

### Subdivision

- Enter the mother-lot area and additional sublot areas.
- Calculate Sublot 1 as the remaining area: mother lot minus additional sublots.
- Remaining-lot base price: **₱13,000**.
- Apply an additional-area surcharge separately to the remaining lot and each additional sublot.

| Additional sublot area | Base price per sublot |
| --- | ---: |
| Above zero and below 5,000 sqm | ₱8,000 |
| 5,000 to below 10,000 sqm | ₱8,500 |
| 10,000 sqm and above | ₱10,000 |
| Blank or zero | No charge |

The current workbooks support 17 additional sublots, for 18 total lots including the remainder. The browser form must use an **Add sublot** control that stops at 17 additional lots. Equal Share also allows only integer counts from 2 to 18. No separate nine-lot limit or partition-agreement option is required.

### Progressive additional-area charges

Convert sqm to hectares using 10,000 sqm per hectare, then round down to the configured increment, initially **0.5 hectare**. Charge each portion of the rounded area at its applicable rate; do not apply the highest tier to the entire area.

| Portion of chargeable area | Relocation & original survey / ha | Subdivision / ha |
| --- | ---: | ---: |
| First hectare | Included | Included |
| Above 1 through 5 ha | ₱5,000 | ₱4,000 |
| Above 5 through 10 ha | ₱3,000 | ₱3,000 |
| Above 10 ha | ₱2,500 | ₱2,000 |

### Travel, survey report, and rounding

- The current office origin is **Bacolod**, as confirmed by the user. There is no automatic routing integration in the initial scope.
- **Town estimate:** look up a reviewed Bacolod-to-city/town-center distance. Display the route qualification where one is known.
- **Manual km:** enter the **one-way road distance from the Bacolod office/base to the actual survey site**, anywhere, including Negros Oriental or outside Negros. An optional site label identifies the destination.
- Manual km replaces the preset distance entirely. Do not add it to the preset or multiply it by two. Require a numeric value at least zero; distinguish a deliberate zero from a blank input.
- Ignore unused town inputs in manual mode and unused manual km in town mode. Do not let an invalid input from the inactive method block the active method.
- The previous `100 km` through `210 km` pseudo-destinations are replaced by the manual-distance field, which has no 210 km cap.
- Initial travel fee: **₱500 × rounded distance units**, where distance units are distance in km divided by **10 km**, rounded to the nearest whole unit. Positive half units round up.
- Survey report: **₱5,000**, added once when selected. Use **Survey report** throughout the app.
- Add travel and the survey report once per job, including subdivision jobs.
- Round the combined quote **down to the nearest ₱1,000** after all charges are added. Display the rounding adjustment explicitly.
- Keep base prices, sublot prices, area thresholds and rates, included area, area-rounding increment, destination distances, travel rate/unit, report fee, and final-rounding increment editable.

### Distance review and route qualifications

Reviewed on **21 September 2026** against the [PSA locality list](https://psa.gov.ph/classification/psgc/citimuni/1804500000) and the [Negros Occidental provincial tourism presentation, PDF page 2](https://phalga.org/assets/downloads/17%20VIS%20GEO%20LECTURES/Phalga%20-%20PROVINCE.pdf#page=2). The presentation includes 2024 tourism data; its map is a published reference, not a current traffic or road-closure service.

- Cauayan: revised from 165 to **113 km**, also supported by a [DENR-hosted project description](https://r6.emb.gov.ph/wp-content/uploads/2024/01/PDS_River-Restoration-thru-Dredging-Activities.pdf).
- San Carlos: the default is **87.3 km via DSB**; the map also lists **143.7 km via the coastal road**. Use manual km when the actual route differs.
- Isabela: the default is **72 km via Hinigaran**; the map gives other route distances.
- Moises Padilla: map estimate **67 km**; a [carrier route reference](https://www.pambato.com/sites/default/files/BACOLOD%20BRANCH%20COVERED%20AREAS.pdf) gives **85.6 km**. Treat the preset as a planning estimate and use the actual site route for quoting when known.
- Bacolod's zero-distance preset identifies the origin city. It does not mean every survey site within Bacolod requires zero travel; manual km supports those sites too.
- Travel pricing includes the ferry fares, tolls and overnight expenses confirmed by the user. Do not add those charges again separately.

### Recommended design for a future Dumaguete office

Use **one application with multiple office origins**, rather than separate calculators or a destination list that mixes distances from different offices.

| Record | Recommended fields |
| --- | --- |
| Office | Stable office ID, display name, actual address/map pin, active status |
| Destination | Stable locality ID, official name, province, aliases |
| Distance preset | Office ID, destination ID, route label, one-way km, source, reviewed date |
| Pricing version | Version ID, effective date, base rates, area bands, travel rate/unit, report charge, rounding rules |
| Quote | Office ID, distance method, destination/site label, actual km used, route/source when applicable, pricing version, inputs and breakdown |

1. Start with **Bacolod** as the only active origin.
2. When the Dumaguete office opens, add its exact base location and activate it. Manual-distance quotes can work immediately without waiting for a complete Negros Oriental table.
3. Add independently reviewed **Dumaguete-origin** presets for Negros Oriental and other useful destinations.
4. Require the user to select the dispatching office. The app must use only presets belonging to that office; a missing preset requires manual km.
5. When the office changes, clear the selected preset and manually entered km so stale distances cannot carry over. Never reuse Bacolod km for Dumaguete or estimate routes by subtracting distances from Bacolod.
6. Keep one shared rate configuration initially. Introduce office-specific rates only if the business approves different pricing; distance origin and pricing policy are separate concepts.
7. Save the selected office and applied distance with each issued quote. Changing offices, presets, or rates later must not alter an issued quote.

The workbook currently fixes the origin to Bacolod and rejects an unconfigured origin. The multi-office selector is planned for the browser app, not active in the workbook.

## Phase 1 — Confirm scope and freeze the specification

- [ ] Confirm the business domain and preferred address, such as `pricing.<business-domain>` or a path on the existing website.
- [ ] Identify the existing website platform, hosting provider, and deployment constraints.
- [ ] Record the exact Bacolod office address/map pin for future route checks. The present local table uses published Bacolod city estimates.
- [ ] Decide whether the first release is staff-only or public. Recommended starting point: staff-only, with separate administrator access for rate changes.
- [ ] Confirm the maximum sublot count and permitted area precision.
- [x] Require a positive remaining lot for subdivision. Reject additional-sublot totals equal to or greater than the mother-lot area. Implemented and tested in both workbooks.
- [ ] Confirm whether taxes, discounts, quote expiry, and other fees are out of scope. Do not add them to the calculation without approved rules.
- [ ] Review representative quotes against business expectations, including all three services and large lots.
- [ ] Approve the initial rate configuration and expected results as the implementation baseline.

**Done when:** the calculation specification and remaining business decisions are agreed, with no ambiguous rules needed by the first release.

## Phase 2 — Build and test the pricing engine

- [ ] Extract the confirmed settings and reviewed destination distances into a structured configuration with explicit units and a version identifier. Key each distance preset by office and destination, with its route/source metadata.
- [ ] Implement one pricing engine independent of the user interface.
- [ ] Return a structured breakdown: lot areas, chargeable hectares, base prices, tier charges, travel, report fee, subtotal, rounding adjustment, and final total.
- [ ] Implement town-estimate and manual-km modes with one shared travel calculation. Validate only the active method's required inputs.
- [ ] Use decimal-safe money and area handling so values near tier boundaries do not change because of floating-point rounding.
- [ ] Reject invalid service selections, missing or nonpositive mother-lot areas, negative/non-numeric sublots, missing additional sublots, and sublot totals exceeding the mother lot.
- [ ] Validate configuration before activation: numeric nonnegative rates, positive rounding increments and travel units, increasing thresholds, and unique destinations with valid distances.
- [ ] Ensure invalid or missing required inputs suppress the quote and produce a specific corrective message.
- [ ] Port the workbook's regression cases into automated engine tests and add tests for newly resolved edge cases.

**Done when:** the engine matches every approved expected result and a rate update changes all affected calculations consistently.

## Phase 3 — Build the quote form

- [ ] Provide service selection (Relocation, Original survey, Subdivision), area input, office origin, distance method, searchable destination selection for presets, manual one-way km with an optional site label, and a Survey report toggle.
- [ ] Initially show Bacolod as the fixed origin. Enable an office selector only when another office is configured.
- [ ] Show sublot inputs only for subdivision, with add/remove controls and the calculated remaining area.
- [ ] Show the quote and breakdown beside or below the form, with a layout that works on desktop and mobile.
- [ ] Place input errors beside the relevant fields and keep the final quote unavailable until errors are resolved.
- [ ] Show which pricing version produced the quote.
- [ ] Add a clean print view and copyable quote summary for client communication.
- [ ] Verify keyboard operation, clear labels, readable currency formatting, and usable touch controls.
- [ ] Remove spreadsheet-only helper fields and unused calculations from the user interface.

**Done when:** a staff member can prepare and share a quote without opening the workbook or understanding its formulas.

## Phase 4 — Add pricing administration

- [ ] Provide an administrator-only settings screen organized into base prices, sublot rates, area surcharges, travel, survey report, and rounding.
- [ ] Allow administrators to add or edit destinations and distances.
- [ ] Maintain offices and office-specific distance presets independently of the rate configuration. Do not expose unreviewed Dumaguete presets as active Bacolod data.
- [ ] Store settings centrally so all staff use the same active rates. Browser-local storage must not be the authoritative rate store.
- [ ] Support draft changes, validation, previewing sample quotes, and explicit activation of a new pricing version.
- [ ] Record who changed rates, when they changed them, and the previous values.
- [ ] Retain earlier versions and allow an administrator to restore one.
- [ ] Keep a quote tied to the rate version used when it was calculated; do not mix versions during an active quote.
- [ ] If saved quotes are included, retain their inputs, applied rates, breakdown, and final amount so later rate updates cannot silently rewrite them.
- [ ] Keep administrative permissions enforced on the server. If quotes are saved or issued through the server, recalculate there with the same engine before accepting the result.

**Done when:** authorized staff can update pricing without code changes, with traceable changes and a reliable way to restore earlier rates.

## Phase 5 — Pilot on a staging address

- [ ] Select the web framework, database, and hosting approach after inspecting the existing business infrastructure. Keep the first release small and maintainable.
- [ ] Deploy a staging environment with separate configuration and data from production.
- [ ] Run automated engine and user-flow tests against the deployed app.
- [ ] Have staff compare a set of actual quoting scenarios against approved workbook results.
- [ ] Test administrator access, unauthorized rate-change attempts, invalid requests, rate updates, and rollback.
- [ ] Check common desktop and mobile browsers, printing, and copied quote summaries.
- [ ] Show a clear unavailable state if the active pricing configuration cannot be loaded; do not silently issue quotes with guessed or stale rates.

**Done when:** business review passes and the deployed app reproduces approved quotes reliably.

## Phase 6 — Launch on the business domain

- [ ] Configure the approved domain/subdomain and HTTPS using the selected hosting provider.
- [ ] Configure production authentication, administrator access, database backups, and error monitoring.
- [ ] Activate the approved initial pricing version.
- [ ] Verify relocation, original survey, and subdivision quotes on the final domain, including travel and survey report charges.
- [ ] Verify rate editing, version history, and restoration in production using controlled changes.
- [ ] Document who maintains rates and how staff report pricing issues.
- [ ] Keep a rollback procedure and the reference workbook available during the transition.
- [ ] Obtain launch approval after the working staging app and final production plan are reviewable.

**Done when:** the pricing tool is reachable on the business domain, staff can use it, and the rate-maintenance and recovery procedures are verified.

## Minimum acceptance cases

Unless stated otherwise, use Bacolod City, no survey report, and the initial default settings.

| Scenario | Expected result |
| --- | --- |
| Relocation: 999 sqm | ₱10,000 |
| Relocation: 1,000 sqm | ₱13,000 |
| Relocation: 9,999 sqm | ₱13,000 |
| Relocation: 10,000 sqm | ₱15,000 |
| Relocation: 15,000 sqm | ₱17,000 after rounding |
| Relocation: 20,000 sqm | ₱20,000 |
| Relocation: 120,000 sqm | ₱55,000 |
| Original survey: 500, 9,999, or 10,000 sqm | ₱30,000 |
| Original survey: 15,000 sqm | ₱32,000 after rounding |
| Original survey: 20,000 sqm | ₱35,000 |
| Original survey: 50,000 / 100,000 / 120,000 sqm | ₱50,000 / ₱65,000 / ₱70,000 |
| Original survey: 500 sqm, manual 235 km | ₱12,000 travel; ₱42,000 final; ₱47,000 with survey report |
| Original base changed to ₱22,000, 500 sqm | ₱22,000; relocation/subdivision unaffected |
| Subdivision: 500 sqm mother lot, one 200 sqm additional sublot | 300 sqm remainder; ₱21,000 |
| Subdivision: 30,000 sqm mother lot, one 10,000 sqm additional sublot | 20,000 sqm remainder; ₱27,000 |
| Relocation: 500 sqm, Talisay City, survey report selected | ₱15,500 before rounding; ₱15,000 final |
| Additional sublots exceed mother-lot area | No quote; explain the excess |
| Missing, zero, or negative mother-lot area | No quote; request a valid area |
| Town-estimate mode: unknown destination or missing preset distance | No quote; request a valid destination/distance |
| Manual mode: 235 km, relocation 500 sqm | ₱12,000 travel; ₱22,000 final quote |
| Manual mode: 234.9 km, relocation 500 sqm | ₱11,500 travel; ₱21,000 final quote after rounding |
| Manual mode: explicit 0 km | Valid zero travel; blank, negative or nonnumeric km is invalid |
| Manual mode: 500 km | ₱25,000 travel; no former 210 km limit |
| Unknown town selection while valid manual km is active | Manual quote remains valid |
| Switch office in the future web app | Clear old route and km; require a matching-office preset or new manual km |
| Base price, sublot rate, or other rate is changed | Affected quotes update using the selected pricing version |
| Issued quote viewed after rates change, if quote saving is implemented | Original issued amount and applied rates remain unchanged |

Also test fractional areas immediately below/at/above each threshold, 5- and 10-hectare tier transitions, travel half-unit rounding, blank versus zero charges, invalid configuration, and the confirmed zero-remainder rule.

## Later enhancements

These are optional and require a separate scope decision:

- Saved quotes, quote numbers, customer details, and searchable quote history.
- Branded downloadable PDF quotations.
- Scheduled future pricing versions.
- Additional office origins and reviewed distance presets, including Dumaguete and Negros Oriental; separate regional rates only if approved.
- A public-facing estimate page distinct from staff-issued quotations.
- Customer-management or invoicing integrations.
- Route-based travel pricing, only if the business chooses to replace the current destination table.

## Negros review before sign-off

- Original survey base is now ₱30,000. Its shared area rates and independent base remain editable.
- Added service-specific input guidance. Invalid subdivision inputs now suppress the quote instead of displaying a zero-remainder warning alongside a price.
- **Confirmed: zero remainder.** A positive remainder is required, preserving the intended valid two-lot minimum of ₱21,000 in Negros and ₱21,000 in Zamboanga.
- **Confirmed: final rounding.** Keep rounding the combined total down to ₱1,000. Relocation 500 sqm with 10 km travel is ₱10,500 before rounding and ₱10,000 final, as intended by the user.
- **Optional quoting details.** Add client name, site/barangay, quote reference, date and validity when this becomes an issued-quotation workflow. These do not affect pricing and are not required to finish the calculator.
- **Confirmed: travel inclusions.** Ferry fares, tolls and overnight expenses are incorporated into travel pricing. Do not add separate charges.
- Validate the final workbook in the user's Excel or Google Sheets environment before operational sign-off. Current checks cover the authoring engine, export, reimport and visual layout.

## Next region: Zamboanga Pricing

The user subsequently specified separate Excel files for each region. Zamboanga's source is now supplied and analyzed in [Zamboanga/ANALYSIS.md](Zamboanga/ANALYSIS.md). Its working deliverable is `Zamboanga/Zamboanga_Pricing.xlsx`, separate from the Negros master. Scope is Zambo Pricing only. Approved rates copy Negros's relocation bands (₱10,000 / ₱13,000 / ₱15,000) and additional-sublot bands (₱8,000 below 5,000 sqm; ₱8,500 from 5,000 to below 10,000 sqm; ₱10,000 thereafter), while retaining Zamboanga's ₱13,000 remaining-lot base. Original Survey starts at ₱30,000. Travel follows Negros at ₱500 per rounded 10 km without a free-distance allowance, using Tetuan-based distances. Area surcharges, report and final rounding remain as agreed. The working workbook has been created and checked alongside Negros.

Apply shared feature, settings-layout and formatting changes in either region to both workbooks, following SKILL.md. Keep regional rates, approved pricing policies and office-distance tables independent. The future browser application can share one interface and calculation infrastructure with explicit regional configuration.

## Next step

Confirm the business domain, existing hosting setup, and staff-only versus public access. Then resolve the Phase 1 business rules and build the pricing engine before the browser interface. Use the office-aware distance model from the start, with Bacolod for Negros and Tetuan Barangay Hall for Zamboanga.

## Zamboanga destination update — 22 September 2026

- Include all 98 official barangays, with San Ramon retained as a locality in Talisayan. Store stable location IDs separately from display names in the future browser version.
- Use Tetuan Barangay Hall as the approved reference point. Prefer mapped barangay halls; label mapped locality-centre routes and retained source estimates clearly. These are approximate one-way distances; actual survey-site km can override them.
- Display `(island)` after island barangay names, preserving existing island presets and the same travel formula. No separate island or ferry surcharge.
- Landang Laum, Manalipa and Tumitus had no source preset. Keep unsupported distances blank until supplied; selecting such a preset must request a distance instead of issuing zero travel.
- Both workbooks use `Preset estimate` and `Manual km`, with region-appropriate destination labels and the same input styling. Preserve regional rates and destination data independently.

## Latest browser and pricing decisions — 22 September 2026

- Both regional pricing configurations use the current Negros amounts and thresholds. The remainder base is PHP 13,000 in each region.
- Keep manual additional-sublot entry with a calculated remainder. Entering 2,000 sqm against a 20,000 sqm mother lot leaves an 18,000 sqm remainder. Do not automatically reorder lots.
- Add sublot is confirmed for the HTML interface. Excel remains a formula reference, so no Excel button or macro is required.
- Equal Share is approved and implemented in the new Excel references: total area divided by an integer total lot count of at least two, including the first lot. Preserve full precision internally. Calculate existing lot charges, add travel/report once, divide the unrounded job total by lot count, then round each lot down to the editable PHP 500 step. Final total is rounded per-lot price multiplied by lot count; ordinary PHP 1,000 job rounding does not apply in this mode.
- Sheet protection and pricing-version/effective-date fields are deferred at the user's request.
- Display whole-peso prices without .00; retain meaningful fractional area and distance values.

## Equal Share reference files — latest working baseline

The user requested new copies for this feature. Current references are `Negros/Negros_Pricing_Equal_Share.xlsx` and `Zamboanga/Zamboanga_Pricing_Equal_Share.xlsx`. Earlier paths mentioned above are retained pre-Equal-Share backups and must not be overwritten. Shared feature and formatting changes must continue to apply to both new regional references.

Controls: Subdivision method C11, total equal lots G11, editable Equal Share rounding step in Pricing Settings C42. Show equal price per lot and final quote. Ignore the inactive manual sublot inputs without deleting them. Switching back to Specify sublots restores the existing remainder-based calculation. Browser implementation should use the same two modes, with Add sublot for manual entries.

Acceptance example: Bacolod 600 sqm into three 200 sqm lots: PHP 29,000 unrounded, PHP 9,500 per lot, PHP 28,500 final. Extras are included before dividing, as confirmed. Tests must cover changing the lot count, fractional areas, larger-sublot bands, area surcharges, invalid count/area/settings, extras, and unchanged ordinary pricing.

## Latest limit and readiness decisions

- Both current Equal Share reference workbooks enforce a maximum of 18 total lots. Equal Share requires an integer from 2 to 18; manual entry supports 17 additional sublots plus a positive remainder. Extended manual inputs are C52:C60 for Sublots 10–18. Existing C18:C25 inputs and all settings are preserved.
- No partition-agreement controls or separate 2–9 / 10–18 workflows. The user declined the proposed zero-price safeguard for extreme rounding-step changes; do not add it to HTML.
- Current approved settings produce the expected quotes. Limit, mode-switching, remainder validation, other-service regression, preservation and export/reimport checks passed in the authoring engine. Native Excel remains untested.
- Remaining minor review finding: workbook Equal Share validation still requires the ordinary rounding setting to be present. No change to this dependency was authorized in the latest request. It is not a blocker while the complete settings are retained; flag any proposed change to mode-specific validation explicitly during HTML implementation.
- Ready to begin the two HTML calculators using shared calculation rules and regional configuration. Domain publishing and how edited settings persist across users/devices remain implementation decisions; do not claim deployment readiness or silently choose shared storage.

## Standalone HTML delivery

- Built `Negros/ROSH Negros Pricing v.01.html` and `Zamboanga/ROSH Zamboanga Pricing v.01.html` using the user's compact mobile sketch. Files contain all styles, scripts, rates and locations; no external libraries or network connection are required for calculation.
- Shared interface and engine live under `web/`. Engineers choose survey type, area, preset location or manual one-way distance, report and subdivision mode. Add sublot reveals inputs on demand. Outputs include service cost, travel, total, equal price per lot and a readable survey summary; detailed lot charges are expandable.
- The diamond opens settings. Save applies rates/distances locally in that browser. Download updated HTML packages settings for engineers. No authentication or shared database has been implemented.
- Actual Edge browser checks passed 392 workbook-price comparisons (196 per region), all 131 destination entries, 18-lot rejection/acceptance, dynamic inputs, numeric character filtering, persisted settings and exported HTML behavior. Desktop and mobile renders were reviewed; there was no horizontal overflow at 390px. Many manual lots necessarily require vertical scrolling.
- Before domain deployment, choose the hosting path and whether administrator edits must propagate centrally. If yes, implement authenticated administration and shared configuration rather than relying on standalone browser storage.

## HTML appearance and expanded review

Both pages now use light blue dropdowns, light green entry fields and light yellow calculated amounts. Headers display ROSH ~ Surveying Services with the supplied logo embedded for offline use. Numeric fields accept decimal shorthand such as .5. Both pages passed 20,070 expanded computation scenarios, plus 392 workbook comparisons and destination/UI/settings/download checks. Desktop and mobile views were inspected, including 320 px widths and 18-lot manual entry. No calculation mismatches remained in the tested scenarios.

## Local settings password

Both v.01 HTML files now prompt for the administrator password before opening settings, and relock on close or reload. Save/reset/download require the unlocked session. Only a password digest is embedded. Downloaded copies retain the password gate. This standalone gate prevents casual edits but is not server-side access control; the hosting plan must still address authenticated shared administration.

## Multi-lot Relocation and user guide — 25 September 2026

Implemented in both standalone HTML files: 2–30 relocation lots, adjacent or nearby in the same city/municipality, with confirmation of one survey visit. Each lot uses its normal relocation pricing and area surcharge. One highest-priced lot stays full price; remaining lots receive an editable 50% adjacent or 30% nearby discount. Travel is charged once; optional reports are charged separately per lot, without discount. Selecting reports currently includes all lots. Sum all charges before flooring the job total to PHP 1,000. Subdivision and Equal Share retain their existing rules and 18-lot limit.

README.md explains engineer inputs, pricing, quotation copying, settings, local persistence and distributing updated HTML files. The Excel references do not contain Multi-lot Relocation. Future hosted implementation must preserve these rules and add central configuration/authentication if required.

Verification: 4,183 multi-lot calculation/order assertions per region; 2,249 existing workbook/UI/settings assertions overall; and 10,043 expanded scenarios per region passed. Mobile and desktop multi-lot layouts were visually inspected without unresolved formatting issues. These checks cover representative and boundary scenarios, not every possible numeric input.

## Release numbering — latest instruction

Each future delivered program update advances both regional HTML versions together: v.02, v.03, and so on. This supersedes earlier instructions to retain v.01. Update build outputs, download filenames, test targets and README links together, once per release. Current program remains v.01; the next program update is v.02. Git history retains previous releases.

## GitHub Pages v.02

Added index.html with a mobile-friendly regional selector and .nojekyll for static hosting from main/root. Both current calculators are v.02; pricing configuration and computation remain identical to v.01. Release number is centralized in web/version.txt. Home-page links, mobile layout and calculation regression checks passed locally. Prior v.01 files remain for old links; only v.02 is linked as current.


## v.03 relocation cutoff

For both regions, the PHP 13,000 relocation base now starts at exactly 2,000 sqm (previously 1,000). Positive areas below 2,000 use PHP 10,000; areas from 2,000 to below 10,000 use PHP 13,000; 10,000 and above retain PHP 15,000 plus applicable area surcharges. Applies per lot in Multi-lot Relocation too. Both current Excel references use Pricing Settings C10 = 2000. Other services, rates, rounding and layout remain unchanged.
