# Changelog

## 0.4.1 — 2026-11-10

- Display all four pending-tooltip result lines in white, stripping inherited rune-name color codes. Keep the instruction line gold.
- Move the Tiered Gheed sale checkbox above the rune groups.
- Record successful game 3.4 tests for the preceding build with D2RMM 1.9.0. These two display adjustments still need visual confirmation.
- Preserve recipes and probabilities.

## 0.4.0 — 2026-11-10

- Align the version metadata, package names and descriptions at 0.4.0. No gameplay changes from the current development build.
- Record rogeriogmm’s direct approval of the proposed credit and permission to use code if needed; no original files from that mod are bundled.
- Game 3.3 tiered/crafting tests were reported as passed. Subsequent tooltip changes and game 3.4 compatibility remain unverified.

## 0.4.0-alpha.1 — 2026-11-09

- Add three hammer crafting recipes: Magic Maul, War Club or Ogre Maul + Dol Rune + Perfect Skull + Jewel → one Rune Dismantling Hammer. Consume all four ingredients.
- Add a shared Gheed sale checkbox, enabled by default; crafting stays available with vendor stock disabled. Missing old saved checkbox values preserve vendor sales.
- Include the recipe in the English/Korean hammer tooltip, with English fallback for other locales.
- Preserve the 3,232 downgrade recipes, probabilities, item/stat codes and artwork. Do not change monster drop tables.
- Pass 215 automated checks across Standard and Tiered; crafting, vendor disablement and tooltip rendering still require D2RMM/game tests.

## 0.3.0-alpha.1 — 2026-11-09

- Add Tiered settings: Low Eld-Lem (2-20), Mid Pul-Gul (21-25), High Vex-Zod (26-33), with four independent percentages per group.
- Default every group to 50/25/10/15 and validate each total separately before any game writes.
- Build Standard and Tiered packages from the same generator; Standard retains the four legacy configuration IDs. Install only one edition.
- Retain hammer acquisition, artwork, 3,232 recipes, pending codes and saved-roll stats. Old settings do not automatically migrate to new group IDs.
- Pass 171 automated checks including both edition regressions and boundary/distribution checks. D2RMM UI and in-game validation remain pending.

## 0.2.0 — 2026-11-07

- Promote the tested hammer version to 0.2.0 with default name coloring. Gameplay and assets are unchanged from the tested alpha.
- Record author-reported Gheed sales, 1-gold purchase/resale, four outcomes, ground display and save/reload checks with D2RMM 1.9.0 and game 3.3 alongside other mods.
- Pass 58 automated checks and installation ZIP validation. Game 3.4 and classic rendering remain unverified.

## 0.2.0-alpha.1 — 2026-11-06

- Restore the default hammer name display without an explicit color code in all languages (2026-11-07); item codes and recipes are unchanged.

- Replace the Identify Scroll ingredient with a non-stackable 1×1 Rune Dismantling Hammer, configured for sale by Gheed in all difficulties.
- Return one hammer instead of a scroll on a miss; retain all four default percentages and rune quantities.
- Add the approved cyan AI-assisted hammer icon in both HD resolutions and preserve the original quest Malus.
- Set base cost to 1 without editing global NPC prices. Actual purchase/resale prices and stock require in-game validation.
- Preserve pending item codes and saved-roll stats. Resolve pending items and back up saves before updating because the miss result changes.
- Pass 58 automated checks; no D2RMM app/game validation claimed.

## 0.1.1 — 2026-11-06

- Add 바론9’s Glowing Runes HD icons exclusively to pending downgrade items, with source attribution and both sprite resolutions.
- Preserve normal rune icons, classic icons, drop-model definitions, recipes, probabilities, pending item codes and saved-roll format.
- Include sprite assets and third-party credits in both installation ZIPs.
- Add icon isolation, source integrity and missing-model checks; 45 automated checks pass. New visuals and model aliases require in-game validation.

## 0.1.0 publication documentation — 2026-11-06

- Use k0102575 as the public author name, with 빵길빵길 in Korean documentation; retain the existing mod.json author value.
- Link mod-specific source references to ProbabilisticRuneDowngrade within the multi-mod repository.
- Add inspiration credit, unpublished Nexus preparation notes, and distinguish pending post-patch game checks from automated validation.
- Keep runtime code, configuration and the minimal installation package unchanged.

## 0.1.0 documentation refresh — 2026-11-05

- Update the release page and documentation archive with all four validation sessions and shared rune-use checks.
- Distinguish D2RMM 1.9.2 standalone tests from D2RMM 1.9.0 mixed-mod tests.
- Replace only the documentation archive and its checksum; preserve the minimal installation ZIP, runtime code and v0.1.0 tag.

## 0.1.0 documentation and minimal package — 2026-11-05

- Add a mods-only installation ZIP containing mod.js, mod.json and the MIT notice.
- Clarify runtime comments about stat IDs, saved draw values, Relics compatibility and installation writes; executable tokens are unchanged from v0.1.0.
- Preserve the original release ZIP and tag; add the minimal ZIP as a separate asset.

## 0.1.0 — 2026-11-04

- Set the mod name to Probabilistic Rune Downgrade and author to 빵길빵길.
- Remove the Ist-only option and always generate all 32 ranks (Eld through Zod), including when stale saved configuration still contains istOnly=true.
- Use the user's tested mod.js as the release baseline, retaining its Relics of Sanctuary compatibility implementation.
- Record user-reported recipe, resulting-rune, mixed-mod 100-trial, and save/reload validation; do not claim universal mod compatibility.

## 0.1.0-alpha.4 — 2026-11-04

- Add narrowly scoped Relics of Sanctuary compatibility: give identical redundant item-mythic property rows unique PRG aliases, preserving the first definition, all row positions, and every other value.
- Reject conflicting Mythic definitions and unrelated duplicate property codes before writing. Relics source files are not modified.
- Pass 39 synthetic scenarios and an installer integration check using the user's four output TSVs with synthetic supporting tables and resources.
- In-game compatibility and previously created broken pending items remain unverified. Retest with a fresh pending item in a copy of the pre-test save.

## 0.1.0-alpha.3 — 2026-11-04

- Fix installation aborting when misc.txt has no unused auto prefix column.
- Make misc normcode/ubercode/ultracode optional on both schema validation and item generation; never synthesize missing columns.
- Keep other column checks and leave auto prefix blank when the column exists.
- Add missing-column regression scenarios for the reported 100/0/0/0 Ist-only configuration and full-rank generation.
- Treat itemstatcost ID labels as annotations; preserve existing rows and use the append position as the new runtime ID. Reject empty/duplicate stat names and retain the reserved-ID guard.
- Reject duplicate property codes from combined source tables before writing; report the conflicting code and row indices. This prevents silently installing a suspected mislinked draw property.
- First-transmute failure remains unresolved in game; verify installation before testing one recipe.

## 0.1.0-alpha.2 — 2026-11-03

- Replace four-character pending codes with three-character pg0-pgv codes for D2R HD mapping compatibility.
- Add item-code collision checks across misc, armor, weapons and HD mappings.
- First-transmute symptom resolution remains unverified in game.
- Old pending items are not save-compatible with the new codes.

## 0.1.0-alpha.1 — 2026-11-02

- Pending items reuse the input rune graphics and localized rune name with a pending suffix.
- Reign of the Warlock only; fixed global/excel path with no base-game selector.
- Independent two-step runtime-engine rune draw; Ist-only default and optional Eld–Zod generation.
- Four validated percentage settings, nonoverlapping exact-value recipes, isolated pending items, Korean/English strings and reused game icons.
- Installation guards, local mock verification, game checklist, unpublished listing drafts and local ZIP packaging.
- Actual D2RMM/game compatibility remains unverified.
