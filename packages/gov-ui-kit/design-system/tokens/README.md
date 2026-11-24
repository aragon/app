# GovKit design tokens

One DTCG 2025.10 token source, one generator. Everything that was once copied between the kit's primitive CSS, the
app's DTCG snapshot, the designer's semantic export and a parity file now lives in `source/`; the CSS is generated.

```text
design-system/tokens/source/
  primitives.tokens.json        today's primitives: colours, shadows, radius, breakpoints, spacing, type, focus ring
  palette.tokens.json           the designer's palette (gray, aragon, green, orange, red, blue)
  semantic.today.tokens.json    semantic tokens, mode "today": the default theme (:root)
  semantic.next.tokens.json     the same tokens, mode "next": the designer's Light values
  semantic.dark.tokens.json     the same tokens, mode "dark": the designer's Dark values
  primitives.config.json        not tokens: CSS names, the layout of each primitive CSS file, the app artifact
  semantic.config.json          not tokens: renames, code-only additions (order, usedBy), utilities, primitiveRemap
  css/                          CSS that holds no token value and is copied verbatim: utilities, @font-face
  schema/format.2025.10.json    the published DTCG schema, unmodified
scripts/tokens/                 generate.mjs and lib/ (the generator), generate.test.mjs
```

The kit owns the source: it owns the tokens and is the published package, and the app artifact is a projection of it.
(`design-system/` itself is not in the npm package: `files` in the kit's `package.json` ships the generated CSS.)
Do not edit the CSS the generator writes; change the source and regenerate.

The semantic layer is optional for the generator: `semantic.config.json` switches it on and then requires the palette
and the three mode files; without the config the source is primitives only and no semantic output is written.

## Commands

From the kit (or the root as `pnpm tokens:generate` / `pnpm tokens:check`):

```sh
pnpm tokens:generate   # validate the source, write every output
pnpm tokens:check      # validate, fail when an output on disk is stale (CI-safe, writes nothing)
pnpm tokens:report     # which Today values are verified against code and which are rule-derived fallbacks
node scripts/tokens/generate.mjs --check --source <dir>   # check a scratch copy of the source against the repo
pnpm test:tokens       # (root) generator tests + the app's consumer compile
```

Outputs, all with a do-not-edit header:

| Output | Consumer |
| --- | --- |
| `src/theme/tokens/primitives/*.css` and `index.css` | the kit build, Storybook, npm consumers |
| `src/theme/tokens/semantic/colors.css` | the kit, the app |
| `.design-sync/generated/govkit-primitives.css` | the app (`layoutRoot.css` imports it instead of the primitives barrel) |

The app artifact flattens the primitive files, rebases the font URLs to its own location and appends the app's runtime
overrides (`layoutRoot.overrides.css`, generator input only). Those overrides must be direct custom properties of one
top-level `:root` rule: no other selector, no nesting or conditions, no `!important`; the generator rejects anything
else. Never edit the emitted CSS.

## Token shapes

A primitive, in `primitives.tokens.json` (colours are DTCG colour objects):

```json
"color": { "$type": "color", "primary": { "500": { "$value": { "colorSpace": "srgb", "components": [0, 0.23137254901960785, 0.9607843137254902] } } } }
```

A semantic token has the same path in the three mode files. Today aliases a primitive, Next and Dark alias the palette:

```json
// semantic.today.tokens.json
"surface": { "primary": { "$value": "{color.neutral.0}", "$extensions": { "org.aragon.gov-ui-kit": { "evidence": "Card: bg-neutral-0" } } } }
// semantic.next.tokens.json            // semantic.dark.tokens.json
"primary": { "$value": "{palette.gray.0}" }   "primary": { "$value": "{palette.gray.900}" }
```

(under `semantic.bg.surface`). A code-only alias token follows another token in Next and Dark and has its own Today value:

```json
// semantic.today.tokens.json: today's colour, a primitive
"subtle-tag": { "$value": "{color.info.200}", "$description": "Code-only, pending design review (P-51): the Tag (info) fill. …" }
// semantic.next.tokens.json and semantic.dark.tokens.json: follow the aliased token
"subtle-tag": { "$value": "{semantic.bg.info.primary}" }
```

(under `semantic.bg.info`; `bg/info/primary` is the Figma name of the token the code calls `bg/info/subtle`).

Reading rules:

- **Names.** A token is the designer's Figma name as a path (`bg/surface/primary` is `semantic.bg.surface.primary`).
  A code-only addition uses its code name. `renames` in `semantic.config.json` maps Figma names to code names (the CSS
  variable and class); several Figma names may share one code name only when all three modes agree. `additions` lists
  the code-only tokens in output order. An alias to a renamed token is written with its Figma name.
- **Today.** An alias of a primitive wherever one exists. Two exceptions, because DTCG has no colour modifier and a
  primitive cannot carry an alpha: a literal colour object where today uses a tint no primitive holds (the shadow
  colours), and a colour with a `mix` extension (`{ "of": "{color.primary.400}", "percent": 8 }`) where today mixes a
  primitive with transparent. The value of a `mix` token is the equivalent sRGB colour, and the generator fails if it
  stops matching its primitive at that percentage; the CSS keeps `color-mix(in srgb, var(--color-primary-400) 8%,
  transparent)` so it follows the primitive.
- **Evidence.** `evidence` (and `conflict`) in the Today token's extension marks a value checked against component code
  (`verified from code` in the CSS). A token without it holds the rule-derived fallback: the same step of the paired
  ramp (`rampPairs`), the nearest step when that step does not exist today, the same alpha for alpha steps. The
  generator recomputes the rule and fails when the stored value differs, so a hand-edited fallback needs evidence.
- **Next and Dark.** Aliases of the palette, or a literal colour where the designer used a raw colour (the shadows).
  A code-only alias token has an alias of its target in both.
- **Formats.** Palette, Next and Dark colours are written as lower-case hex (eight digits with an alpha); primitive and
  Today literals as hex, `rgba(r, g, b, a)` or `transparent`.

## Modes

The three modes are three mode files, not a DTCG Resolver document. The Resolver module
(<https://www.w3.org/community/reports/design-tokens/CG-FINAL-resolver-20251028/>) could not be fetched where this was
built, so a resolver file would have been written from memory and could not be validated; and the generator needs the
three modes side by side with aliases kept symbolic (`var(--guk-…)`), while a resolver produces one flattened set per
input. The files are shaped as resolver contexts: the same token paths in each, resolved against the shared sets
(primitives, palette), so a resolver document can wrap them without changing a token. The generator validates each mode
as that merged view: every document against the published schema, every alias (missing target, cycle, type mismatch)
and every resolved value against its own type.

## What the generator checks

- Each source document against the DTCG 2025.10 schema, every alias in every mode, every resolved value against its type.
- Every primitive token is placed in the CSS exactly once (`primitives.config.json` places each; an unplaced or
  doubly placed token fails), and every token has a CSS name.
- The three mode files hold the same tokens; merged Figma names agree in every mode; every addition exists; every
  rename source is a Figma token; a code-only alias aliases a token with values of its own.
- Today values: the evidence / fallback rule above, and `mix` tokens against their primitive.
- The app overrides rule above; font URLs in the artifact all rebased.
- `pnpm tokens:check` fails when any output is stale; `pnpm test:tokens` runs the same comparison in CI.

## Representation boundaries

- `--spacing` is the 4px Tailwind multiplier, not an enumerated spacing scale.
- Breakpoint numbers (`--breakpoint-*-px`, in `:root`) and rem dimensions (`--breakpoint-*`, in `@theme`) are separate;
  no root font-size assumption converts between them.
- `transparent` is sRGB black with alpha zero. The zero-length transparent shadow uses explicit zero blur and spread.
- `--radius-none: none` has no DTCG dimension; it is a `raw` line of the layout, like the namespace resets
  (`--color-*: initial`).
- Utilities, the focus-ring behaviour, the font faces and the app's z-index and position configuration are CSS, not
  tokens: `css/` and `layoutRoot.overrides.css`.

## Changing tokens

1. Edit `source/` (a value, a name in `renames`, a utility in `semantic.config.json`).
2. `pnpm tokens:generate`, then review the CSS diff.
3. `pnpm tokens:semantic:map:check` (kit) and `pnpm --filter @aragon/app colors:map:check`: the component maps read the
   generated CSS.
4. A change under `src/` needs a kit changeset and, when the registry cites it, a refreshed registry
   (`skills/shared/rules/gov-ui-kit-changes`).

Background and decisions: `semantic-colors.decisions.md` (P-75 for this consolidation).
