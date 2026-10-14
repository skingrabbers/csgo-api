# csgo-api

Self-hosted CS2 item names in the 13 Skin Grabbers locales. [ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API) only publishes `en` and `zh-CN`; its generator can produce more, so this repo runs that generator unmodified on a schedule and publishes small name maps.

## Consuming

```
https://raw.githubusercontent.com/skingrabbers/csgo-api/generated/names/<locale>.json
https://raw.githubusercontent.com/skingrabbers/csgo-api/generated/source.json
```

The `generated` branch is an orphan branch holding a single commit. Never depend on its history.

## File shapes

- `names/en.json`: `{ [byMykelId]: market_hash_name ?? name }`, the English identity used for joins.
- `names/<locale>.json`: `{ [byMykelId]: name }`.
- `source.json`: `{ "upstreamSha": "...", "fileTrackerManifestId": "..." }`.

Ids cover everything in upstream `all.json` (per-wear skins such as `skin-e757fd7191f9_0`, stickers, crates, collections, ...) plus the grouped ids from `skins.json` (`skin-e757fd7191f9`). JSON is minified with sorted keys, so identical data produces identical bytes and no push.

## Locale map

| Site locale | Upstream folder |
| --- | --- |
| en | en |
| zh-CN | zh-CN |
| pt | pt-BR |
| es | es-ES |
| fr, de, it, nl, sv, tr, ja, pl, ko | same as locale |

The map lives in `build_names.mjs` and nowhere else. The build fails if a folder is missing or a locale has under 90% of the `en` ids.

## Re-running

Runs every 6 hours. To run now: Actions, then "Generate locale names", then "Run workflow" (or `gh workflow run generate.yml`).

## Credit and license

Names come from [ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API) (MIT, Copyright (c) 2023 ByMykel), which is checked out and run unmodified by the workflow. Its license text is reproduced in [LICENSE](LICENSE). Underlying data derives from Valve's game files; Counter-Strike is a trademark of Valve Corporation.
