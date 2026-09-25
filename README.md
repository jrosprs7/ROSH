# ROSH regional pricing calculators

Open either file directly in a modern browser:

- [Negros Pricing v.01](Negros/ROSH%20Negros%20Pricing%20v.01.html)
- [Zamboanga Pricing v.01](Zamboanga/ROSH%20Zamboanga%20Pricing%20v.01.html)

The files work offline. Each contains its own logo, rates, destinations and calculation code. The current files are not published on the business domain.

## Preparing a quotation

1. Choose Relocation, Original Survey or Subdivision.
2. Enter the lot area in square metres. For subdivision, this is the mother-lot area.
3. Choose a preset Location or enter the one-way Distance from the office reference. Negros uses Bacolod; Zamboanga uses Tetuan. Manual distance replaces the preset, rather than adding to it.
4. Select whether a survey report is included.
5. Complete any subdivision or multi-lot fields. The total updates automatically.
6. Expand **Quotation summary**, then select **Copy quotation** to paste it into a message to the client.

Blue fields are dropdowns, green fields accept typed entries, and yellow amounts are calculated. Numeric fields reject letters and negative signs. Invalid or incomplete inputs suppress the quote. Blank distance is different from an explicitly entered zero.

The optional Site / project field identifies the actual site. With manual distance and no site name, the quotation says the exact location is to be confirmed. A survey-report line is omitted from the client quotation unless reports are selected. Relocation and Subdivision use the owner-approved scope wording, including DENR subdivision-plan approval. Original Survey has no prewritten scope beyond the service and lot information.

## Relocation and Original Survey

Normal relocation bases:

| Area | Base |
| --- | ---: |
| Below 1,000 sqm | ₱10,000 |
| 1,000 to below 10,000 sqm | ₱13,000 |
| 10,000 sqm and above | ₱15,000 |

Original Survey starts at ₱30,000. Both services add the progressive area surcharge described below, travel and any report charge. Ordinary final quotations round **down to ₱1,000**, after combining the charges.

## Multi-lot Relocation

Select **Multi-lot Relocation**, enter Lot 1 in the main area field, and click **Add lot** for each other area. This mode supports **2–30 lots** and applies only to Relocation.

- Choose **Adjacent** or **Nearby · same city / municipality**.
- Confirm that all lots qualify for one site visit. Simply being in the same city does not qualify distant sites. Use separate quotations for separate visits.
- Each lot gets its normal relocation charge, including its own area surcharge.
- The highest-priced lot is charged at full price. Other lots receive **50% off when adjacent**, or **30% off when nearby**.
- Input order does not change the total. If two lots tie for the highest normal charge, only one is full price.
- Travel is charged **once** for the combined visit.
- Selecting reports includes a **separate report for every lot**, charged at the normal report rate per lot, without discount. This version does not select reports for only some lots.
- Sum discounted lot charges, travel and reports, then round the **combined total down to ₱1,000**. Individual discounted lot charges are not separately rounded.
- Discounts can be changed under password-protected Settings → Multi-lot discounts. They must be between 0% and 100%.

Example: 600 sqm, 2,000 sqm and 12,000 sqm normally cost ₱10,000, ₱13,000 and ₱15,000. At zero travel, without reports:

| Arrangement | Before rounding | Final |
| --- | ---: | ---: |
| Adjacent | ₱15,000 + ₱5,000 + ₱6,500 = ₱26,500 | **₱26,000** |
| Nearby | ₱15,000 + ₱7,000 + ₱9,100 = ₱31,100 | **₱31,000** |

At the default ₱5,000 report rate, selecting reports adds ₱15,000 before final rounding for these three lots. Price breakdown identifies the full-priced and discounted lots. The client quotation lists each lot's area and discounted service charge, then the final quotation including extras and rounding.

## Subdivision: specify sublots

Subdivision allows **2–18 total lots**. Enter the mother-lot area, leave Equal Share unchecked, and click **Add sublot** as needed.

Sublot 1 is calculated automatically: mother-lot area minus the entered additional lots. Enter at most 17 additional sublots. A positive remainder is required; the total entered area cannot consume or exceed the mother lot. Zero sublot entries do not add a charge; blank added boxes must be completed or removed.

- Remaining-lot base: ₱13,000.
- Other sublot bases: ₱8,000 below 5,000 sqm; ₱8,500 from 5,000 to below 10,000 sqm; ₱10,000 thereafter.
- Each lot gets its own subdivision area surcharge.
- Travel and the optional report are charged once per subdivision job.
- Round the combined quotation down to ₱1,000.

## Subdivision: Equal Share

Check **Equal Share**, then enter an integer **2–18** in Total lots. The mother-lot area is divided equally at full internal precision. The displayed area may be shortened for readability.

1. Price one equal lot using the remaining-lot base and the others using the additional-sublot bands.
2. Apply the usual subdivision area surcharge to each lot.
3. Add travel and the optional report once.
4. Divide this unrounded total by the number of lots.
5. Round each share **down to ₱500** (editable separately).
6. Final quotation = rounded share × number of lots. Do not apply ordinary ₱1,000 rounding again.

Example: 600 sqm into three equal lots gives ₱13,000 + ₱8,000 + ₱8,000 = ₱29,000. Each share rounds down to ₱9,500, giving **₱28,500 total**. Rounding can absorb some extras. Manual sublot entries remain available when switching back, but are ignored in Equal Share.

## Area surcharges, travel and reports

Convert each applicable area to hectares and round down to the configured increment, initially 0.5 ha. Apply progressive rates, not the highest rate to the entire area:

| Portion | Relocation / Original per ha | Subdivision per ha |
| --- | ---: | ---: |
| First 1 ha | Included | Included |
| Above 1 through 5 ha | ₱5,000 | ₱4,000 |
| Above 5 through 10 ha | ₱3,000 | ₱3,000 |
| Above 10 ha | ₱2,500 | ₱2,000 |

Travel defaults to **₱500 × nearest whole number of 10 km units**, with positive halves rounding up. Examples: 4.99 km → ₱0; 5 km → ₱500; 15 km → ₱1,000. No return-trip multiplier is added. Ferry, toll and overnight allowances are treated as part of travel pricing, not separate additions.

Presets are approximate reference distances, not exact site routes. Zamboanga includes 98 barangays plus San Ramon locality. Island names are marked `(island)`; a missing preset requires manual km. Default report charge is ₱5,000 per job, except Multi-lot Relocation, which charges it per lot.

## Administrator settings and distributing updates

Click the diamond Settings button and enter the administrator password. Closing the panel, pressing Escape or reloading locks it again. The password is not documented here; obtain it from the owner.

- **Save settings** applies changes in the current browser. It does not update colleagues' browsers or rewrite the original HTML on disk.
- **Download updated HTML** embeds the current rates and distances in a new copy for distribution. It retains the password gate, branding and footer. Use the revised copy for engineers who need those rates.
- **Restore file defaults** restores the configuration embedded in that particular file.
- Browser storage is separate by file/origin and embedded configuration; moving files, changing browsers or clearing browser data can change which saved settings are available.
- Existing local rates are preserved when this multi-lot update loads; new discount fields default to 50% and 30% if absent.

The password is a convenience lock in a standalone file, not enforceable server-side security. Someone who edits the HTML/JavaScript can bypass it. Shared authenticated administration requires a hosted backend. Do not distribute the file publicly: **ROSH File Only - Do Not Distribute.**

## Files and maintenance

- `web/pricing.js`: shared calculation, validation, quotation, settings and password behavior.
- `web/pricing-template.html`: shared responsive layout and appearance.
- `web/negros-settings.json`, `web/zamboanga-settings.json`: embedded configuration used by the builder.
- `web/assets/default-header.png`: shared header image.
- `web/build-html.py`: assembles the two standalone v.01 files. Both regions must receive shared feature fixes together.
- `SKILL.md`: project rules and approved pricing decisions.
- `ROADMAP.md`: future domain-hosting work.
- `outputs/negros-pricing-20260921/`: browser and workbook verification scripts.

Before rebuilding, preserve any rates edited in distributed HTML copies or browser storage. Do not re-extract old workbook defaults over newer approved HTML settings. Keep v.01 filenames until a new version is explicitly requested.

The Equal Share Excel files remain reference workbooks for the pre-multi-lot rules. **Multi-lot Relocation and its discount settings are currently implemented in the HTML calculators, not those Excel references.** The original pre-Equal-Share Excel backups are retained separately.
