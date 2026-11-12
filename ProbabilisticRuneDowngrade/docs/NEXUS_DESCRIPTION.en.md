# Probabilistic Rune Downgrade

## Hammer stack storage

Stack storage and optional monster drops are combined in **1.1.0**. No separate stacking mod is required.

1. Transmute **one single hammer alone** to pack it into a stack of one.
2. Drag stacks together to combine up to **256 hammers**.
3. Transmute **one stack alone** to withdraw one usable hammer and the remaining stack. Withdrawing the last hammer leaves only the single hammer.

Stacks are for storage. Rune downgrade recipes accept only the **single hammer**. Buying, crafting, drops and misses still produce singles. Existing hammers are not automatically converted, and pending runes cannot stack. Before downgrading/removing this version, unpack all stacks, resolve pending items and back up saves.

The conversion/splitting pattern adapts olegbl’s MIT-licensed stacking code. The original notice and license are included in `LICENSES/olegbl-MIT.txt`. **In-game quantity handling, prices, combining/splitting, save/reload and compatibility remain untested.**

## Optional monster drops — 1.1.0 alpha

**Development build: the new drop feature has not been tested in D2RMM or in game.** Historical 1.0.0 game tests do not validate it.

- **Enable hammer drops:** OFF by default. Disabled installs do not read or write the treasure-class table.
- **Hammer drop weight:** default 1, integer 1–1000. Used when enabled; this is not a percentage.
- Adds a hammer candidate to 15 act/difficulty Good treasure classes. Only drops using those paths are affected; this is not a promise that every monster or quest drop can produce hammers.
- **Hammers compete with existing loot candidates.** Original weights, NoDrop and Picks are preserved, but adding a candidate changes relative selection chances. Player count and other mods also affect the result. Larger weights have larger effects.
- Missing/duplicate target classes, full candidate lists, malformed weights or unsafe totals stop installation. Existing candidates are never overwritten.
- Vendor sales and crafting remain separate options. This is not an independent bonus-drop mechanism.


By **k0102575** · Version **1.1.0-alpha.2** · **Offline Reign of the Warlock only** · D2RMM **1.9+**

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

Both editions include **Sell hammers at Gheed**, enabled by default. Disable it to stop generating his hammer sale stock; crafting remains available either way. Reinstall with D2RMM and start a new game after changing the option. This does not remove owned hammers or prevent selling them to NPCs. Monster drop tables are unchanged when the new drop option is OFF.

See the validation scope below for game-test reports.

The cyan hammer icon was created with AI assistance, based on the Horadric Malus silhouette. The quest Malus is not an ingredient and is not modified. Both HD sprite resolutions are included. Classic graphics reference the original Malus icon; its fit in a 1×1 slot has not been tested.

This version no longer adds rune + Identify Scroll recipes and leaves other mods' recipes unchanged. Resolve old pending items before updating: their miss result would otherwise change from a scroll to a hammer.

Pending-rune tooltips show the actual result rune names, quantities and all four installed chances. Standard uses its shared settings; Tiered uses the input rune group. Stored winning outcomes are not revealed. The final color adjustments still require visual confirmation.

## Pending item icons

Pending items use **Glowing Runes** icons by **바론9**. Normal and resulting runes keep their installed icons. Eld–Ral have only subtle visual differences; identify pending items by the **“— Pending Downgrade”** name. Both HD sprite resolutions are included. Classic graphics retain the input rune icon.

## Installation

1. Close the game and back up offline characters and the shared stash.
2. Extract `ProbabilisticRuneDowngrade-1.1.0-alpha.2-<edition>-mods-only.zip` into the folder containing D2RMM. Confirm `mods/ProbabilisticRuneDowngrade/mod.json` exists, without an extra enclosing ZIP-name folder. The documentation ZIP is an alternative; install only one package.
3. In D2RMM 1.9+, enable the chosen edition. Standard has four shared chances; Tiered has four chances in each of three groups. Review the Gheed sale checkbox as well.
4. If using Relics of Sanctuary, place this mod **after Relics** in the install order. Click **Install Mods**.
5. Launch the offline game with your D2RMM configuration. Use a copy of your save for initial checks.

Each chance must be an integer from **0 to 100**. Standard’s four values must total **exactly 100**; in Tiered, each group must independently total **100**. Invalid settings stop installation. Defaults are `50 / 25 / 10 / 15`; equal chances are `25 / 25 / 25 / 25`.

## Save safety and compatibility

**Resolve all pending items before changing probabilities, removing this mod, changing mod order, adding stat-changing mods, or updating the game. Back up saves first.** Changing chances while pending items remain reinterprets their saved rolls under the new chances. Mod order and stat additions can change pending-item save compatibility. Automatic recovery of previously malformed pending items is not guaranteed.

Rune stacking and rune storage are features of other mods, not included here. Compatibility with every game patch or mod combination has not been established.

The Relics compatibility handling renames only later, identical `item-mythic` property definitions in the generated tables. It preserves the first definition, row positions and stats, and does not edit Relics source files. Conflicting definitions stop installation. This is not a general duplicate-property repair.

## Validation scope

The author reported that all 0.3.0 tiered-probability and 0.4.0 crafting test cases passed with **D2RMM 1.9.0 and game 3.4**. These features also passed in a mixed-mod game 3.3 setup. The exact 3.4 build and whether that session used other mods were not recorded.

Version 1.0.0 includes these features and subsequent display fixes: gold instructions, four white outcome lines, and the Gheed sale checkbox at the top of both editions. **A separate in-game confirmation of the final display fixes has not yet been recorded.** Check colors, wrapping and option placement while capturing screenshots.

**300 automated checks** cover both editions, all 32 ranks and stored rolls 1–100, tier boundaries, 0%/100% settings, invalid settings, crafting and tooltip strings. These checks do not run D2RMM or the game. Historical probability trials are documented separately in the [test record](https://github.com/k0102575/diablo2-mods/blob/main/ProbabilisticRuneDowngrade/docs/TESTING.ko.md). Classic hammer rendering in a 1×1 slot remains unverified. This is not a guarantee of compatibility with every patch or mod combination.

## Credits and disclosure

- Mod author: **k0102575**.
- The two-stage crafting idea was inspired by **Corruption Shards for RoTW**, by **rogeriogmm**: https://www.nexusmods.com/diablo2resurrected/mods/1051 . Its original code, images and files are not included in this distribution. rogeriogmm approved the proposed credit in a direct reply and also permitted use of his code if needed.
- Pending icons: **Glowing Runes / 빛나는 룬 아이콘** by **바론9**, https://www.inven.co.kr/board/diablo2/5734/1634 . Included unchanged under the source post’s permission to integrate and distribute with credit. These assets are not relicensed under MIT; see CREDITS.md in the mod folder.
- Uses D2RMM. Diablo II and its game assets belong to their respective rights holders. This repository's original code and documentation are under the MIT License; this does not license third-party game assets.
- AI assistance was used in code development, documentation and translation, and creation of the dismantling hammer icon. The in-game test results above were reported by the author; AI-generated text is not evidence of game testing.

Source and detailed test records: https://github.com/k0102575/diablo2-mods/tree/feature/hammer-drops-1.1.0/ProbabilisticRuneDowngrade
