# Probabilistic Rune Downgrade

By **k0102575** · Version **0.4.0** · **Offline Reign of the Warlock only** · D2RMM **1.9+**

Downgrade Eld through Zod with four configurable outcomes. Use one rune and one Rune Dismantling Hammer, then transmute the pending item alone to receive the result.

## How to use

1. Put **one rune + one Rune Dismantling Hammer** into the Horadric Cube and transmute.
2. Remove any other ingredients. Transmute the **pending downgrade item alone**. No extra material is needed.
3. Collect the result:

| Outcome | Default chance |
|---|---:|
| Two runes of the immediately lower rank | 50% |
| One rune of the immediately lower rank | 25% |
| Original input rune returned | 10% |
| One Rune Dismantling Hammer returned — miss | 15% |

All **32 input ranks, Eld (r02) through Zod (r33)**, are enabled. El (r01) cannot be downgraded. The two-rune outcome always gives **two**, at every rank, regardless of the vanilla upgrade recipe. There is no Ist-only option. The first step consumes both ingredients; rune outcomes do not refund the hammer. A miss consumes the rune and returns only the hammer.

## Choose one edition

**Standard:** four chance settings shared by every input rune rank.

**Tiered:** three collapsible groups, with four settings each:

| Group | Input runes |
|---|---|
| Low | Eld-Lem (r02-r20) |
| Mid | Pul-Gul (r21-r25) |
| High | Vex-Zod (r26-r33) |

The input rune determines the group. Defaults are **50/25/10/15 in all groups**. Each group must independently total 100. Higher ranks are not automatically harder; configure the chances you want. These are the mod's chosen boundaries, not an official universal trading classification.

Choose either the `-standard-mods-only.zip` or `-tiered-mods-only.zip` file. Both install to `mods/ProbabilisticRuneDowngrade`; **install only one edition**. Both use the same hammer, recipes and artwork. The source folder directly installs Tiered. Previous global settings are not automatically migrated into the twelve Tiered settings: review them in D2RMM before installation. Resolve all pending items and back up saves before switching editions or probabilities.

## Why two transmutations?

The pending item stores a roll from 1 to 100 when first created. The second transmutation resolves that stored roll into one of the four outcomes; it does not roll again. This provides four mutually exclusive outcomes with configurable percentages using generated cube recipes.

## Dismantling hammer

Buy the dedicated **Rune Dismantling Hammer** from **Gheed in Act I**. It is a non-stackable, 1×1 material configured for Normal, Nightmare and Hell. Its base cost is 1 gold. With D2RMM 1.9.0 and game 3.3 alongside other mods, the author reported normal vendor stock behavior and 1-gold purchase and resale. Other vendor prices are not modified.

### Craft a hammer

Transmute **one Magic Maul, War Club or Ogre Maul + one Dol Rune + one Perfect Skull + one Jewel** to create **one Rune Dismantling Hammer**. All four ingredients are consumed. Only Magic (blue) weapons qualify; other qualities, the Great Maul family and one-handed hammers do not. Ethereal Magic bases are allowed by the recipe and require in-game verification. Jewel quality is unrestricted, so choose the jewel carefully. The output is a fixed tool, without randomized crafted affixes.

Both editions include **Sell hammers at Gheed**, enabled by default. Disable it to stop generating his hammer sale stock; crafting remains available either way. Reinstall with D2RMM and start a new game after changing the option. This does not remove owned hammers or prevent selling them to NPCs. No monster drop tables are changed.

The author reported that the 0.3.0 tiered and 0.4.0 crafting test cases passed with D2RMM 1.9.0, game 3.3 and other mods installed. Subsequent hammer/pending-tooltip changes and game 3.4 compatibility still require in-game verification.

The cyan hammer icon was created with AI assistance, based on the Horadric Malus silhouette. The quest Malus is not an ingredient and is not modified. Both HD sprite resolutions are included. Classic graphics reference the original Malus icon; its fit in a 1×1 slot has not been tested.

This version no longer adds rune + Identify Scroll recipes and leaves other mods' recipes unchanged. Resolve old pending items before updating: their miss result would otherwise change from a scroll to a hammer.

## Pending item icons

Pending items use **Glowing Runes** icons by **바론9**. Normal and resulting runes keep their installed icons. Eld–Ral have only subtle visual differences; identify pending items by the **“— Pending Downgrade”** name. Both HD sprite resolutions are included. Classic graphics retain the input rune icon.

## Installation

1. Close the game and back up offline characters and the shared stash.
2. Extract `ProbabilisticRuneDowngrade-0.4.0-<edition>-mods-only.zip` into the folder containing D2RMM. Confirm `mods/ProbabilisticRuneDowngrade/mod.json` exists, without an extra enclosing ZIP-name folder. The documentation ZIP is an alternative; install only one package.
3. In D2RMM 1.9+, enable **Probabilistic Rune Downgrade** and set the four chances.
4. If using Relics of Sanctuary, place this mod **after Relics** in the install order. Click **Install Mods**.
5. Launch the offline game with your D2RMM configuration. Use a copy of your save for initial checks.

Each chance must be an integer from **0 to 100**, and the four values must total **exactly 100**. Invalid settings stop installation. Defaults are `50 / 25 / 10 / 15`; equal chances are `25 / 25 / 25 / 25`.

## Save safety and compatibility

**Resolve all pending items before changing probabilities, removing this mod, changing mod order, adding stat-changing mods, or updating the game. Back up saves first.** Changing chances while pending items remain reinterprets their saved rolls under the new chances. Mod order and stat additions can change pending-item save compatibility. Automatic recovery of previously malformed pending items is not guaranteed.

Rune stacking and rune storage are features of other mods, not included here. Compatibility with every game patch or mod combination has not been established.

The Relics compatibility handling renames only later, identical `item-mythic` property definitions in the generated tables. It preserves the first definition, row positions and stats, and does not edit Relics source files. Conflicting definitions stop installation. This is not a general duplicate-property repair.

## Validation scope

The following author-reported game checks used **0.1.0, before the icon change**. Additional hammer-version checks are recorded separately below. Outcome order below is **two lower / one lower / returned rune / miss**.

| Environment | Chances | Trials / result |
|---|---|---|
| D2RMM 1.9.2, this mod alone | Each outcome set to 100% in turn | All four outcomes and quantities worked |
| D2RMM 1.9.2, this mod alone | 50 / 25 / 10 / 15 | 41: **24 / 10 / 2 / 5** |
| D2RMM 1.9.0, alongside other mods | 25 / 25 / 25 / 25 | 100 before release: **27 / 25 / 23 / 25** |
| D2RMM 1.9.0, alongside other mods | 25 / 25 / 25 / 25 | 50 with the prior GitHub release package: **9 / 15 / 10 / 16** |

The combined setup included Relics of Sanctuary, Corruption Shards for RoTW, and rune stacking. Checks also covered descending from Zod to El, runewords, rune storage and stacking, existing upgrade recipes, socket use, save/reload, and resolving a pending item after save/reload. The exact game build and complete active mod list were not recorded. These samples do not prove the random distribution or universal compatibility.

**0.4.0 validation:** 215 automated checks pass across both editions. The author subsequently reported successful tiered/crafting tests on game 3.3 with D2RMM 1.9.0 alongside other mods. The latest tooltip edits and game 3.4 remain unverified.

Generator checks using synthetic fixtures cover all ranks and stored rolls, settings validation and compatibility cases. Each of the four configurations with exactly one outcome at 0% and all others positive passed automated checks. Separately, the author reported **10 in-game trials each with mod 0.1.0, D2RMM 1.9.2 and game version 3.3** with `33/33/34/0`, `33/33/0/34`, `33/0/33/34` and `0/33/33/34`: **40 trials with no issues reported**. The exact game build, standalone/mixed-mod status and outcome counts for these additional trials have not yet been recorded. **Game version 3.4 has not been verified.** Automated checks do not run D2RMM or the game.

**0.1.1 icon-version check:** With D2RMM 1.9.0 and game 3.3, the author confirmed the glowing pending icon, save/reload and all four outcomes. No 100- or 50-trial probability run was performed in this session; standalone/mixed-mod status, settings and outcome counts were not recorded. This does not validate the hammer feature in-game.

**0.2.0-alpha.1 hammer-version check:** With D2RMM 1.9.0 and game 3.3 alongside other mods, the author reported no issues with Gheed sales in all difficulties, 1-gold purchase/resale, repeat purchases, the non-stackable one-slot icon, each outcome set to 100%, ground display, or save/reload followed by transmutation. Trial counts, the full mod list and exact game build were not recorded. This does not establish game 3.4 or universal mod compatibility.

## Credits and disclosure

- Mod author: **k0102575**.
- The two-stage crafting idea was inspired by **Corruption Shards for RoTW**, by **rogeriogmm**: https://www.nexusmods.com/diablo2resurrected/mods/1051 . Its original code, images and files are not included in this distribution. rogeriogmm approved the proposed credit in a direct reply and also permitted use of his code if needed.
- Pending icons: **Glowing Runes / 빛나는 룬 아이콘** by **바론9**, https://www.inven.co.kr/board/diablo2/5734/1634 . Included unchanged under the source post’s permission to integrate and distribute with credit. These assets are not relicensed under MIT; see CREDITS.md in the mod folder.
- Uses D2RMM. Diablo II and its game assets belong to their respective rights holders. This repository's original code and documentation are under the MIT License; this does not license third-party game assets.
- AI assistance was used to prepare and translate this description and to create the dismantling hammer icon. The in-game test results above were reported by the author; AI-generated text is not evidence of game testing.

Source and detailed test records: https://github.com/k0102575/diablo2-mods/tree/main/ProbabilisticRuneDowngrade


Pending-rune tooltips show the actual result rune names, quantities and all four installed chances. Standard uses its shared settings; Tiered uses the input rune group. Stored winning outcomes are not revealed. The added tooltip still requires in-game display verification.
