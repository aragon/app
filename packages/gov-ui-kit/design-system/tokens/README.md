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
  spacing.roles.tokens.json     semantic spacing roles: insets, gaps, the navigation chrome (Today + preview modes)
  spacing.sizes.tokens.json     component sizes: control heights and their padding and gap, the tag, the row
  spacing.exceptions.tokens.json  Today exceptions of the spacing roles (`<role>--<pattern>`)
  spacing.config.json           not tokens: modes and selectors, families, scale, floors, budget, chrome rule, outputs
  semantic.config.json          not tokens: renames, code-only additions (order, usedBy), utilities, primitiveRemap
  scopes.config.json            not tokens: how the value sets are split into stylesheets and scoped to the breakpoint
  typography.today.tokens.json  semantic typography, Today: roles, exceptions, modifiers (what the code renders)
  typography.next.tokens.json   semantic typography, Next preview: plain role bundles in Sora / Inter Display
  typography.config.json        not tokens: modes and their selectors, the modifiers, outputs
  css/                          CSS that holds no token value and is copied verbatim: utilities, @font-face
  schema/format.2025.10.json    the published DTCG schema, unmodified
scripts/tokens/                 generate.mjs and lib/ (the generator), generate.test.mjs
```

The semantic spacing layer (`lib/spacing.mjs`) follows the same rule with `spacing.config.json`: it renders
`src/theme/tokens/spacing.css` (Today's value set on `:root`, one `@utility` per role or size × family and per exception ×
the families it lists; the `[data-spacing="new|looser|compact"]` sets and the coarse-pointer fallback are preview value
sets, see below) and
`src/core/types/spacingStyles.ts` (the names as TypeScript lists). Decisions, the role, size and exception tables:
`spacing.decisions.md`.

The semantic typography layer (`lib/typography.mjs`) follows the same rule with `typography.config.json`: it renders
`src/theme/tokens/typography.css` (Today's value set, one `@utility type-*` per role and exception, the modifiers)
and `src/core/types/typographyStyles.ts` (the style names as a TypeScript union and a class map, for `Heading`'s
`typeRole`). Decisions, the role table and the exception table: `typography.decisions.md`.

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
| `src/theme/tokens/semantic/colors.css` | the kit, the app (Today's colours and the utilities) |
| `.storybook/tokensPreview.css` | Storybook only (`.storybook/preview.tsx`): every preview value set; not in the published package |
| `apps/app/public/tokens-preview.css` | the app: every preview value set at both breakpoint scopes, linked by `layoutRoot.tsx` only while the debug panel is on and a preview is selected |
| `apps/app/src/modules/application/components/layouts/layoutRoot/tokensColumn.css` | the app (`layoutRoot.css`): Today's value sets at the application column's scope |
| `.design-sync/generated/govkit-primitives.css` | the app (`layoutRoot.css` imports it instead of the primitives barrel) |
| `src/theme/tokens/spacing.css` | the kit (via `tokens/index.css`), the app (`layoutRoot.css`), the help center |
| `src/core/types/spacingStyles.ts` | the role, size and exception names as TypeScript lists |
| `src/theme/tokens/typography.css` | the kit (via `tokens/index.css`), the app (`layoutRoot.css`), the help center |
| `src/core/types/typographyStyles.ts` | `Heading` (`typeRole`) and any component that takes a typography style |

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
- No palette or semantic mode file without `semantic.config.json`.
- `pnpm tokens:check` fails when any output is stale.

## Spacing tokens

A role, in `spacing.roles.tokens.json` (DTCG dimensions; `base` below 48rem, `md` from it; inset roles have `x` and
`y`; `$value` is Today and the preview modes are in the `modes` extension):

```json
"gap-related": {
    "$extensions": { "org.aragon.gov-ui-kit": { "kind": "gap" } },
    "base": { "$value": { "value": 12, "unit": "px" }, "$extensions": { "org.aragon.gov-ui-kit": { "modes": { "new": { "value": 8, "unit": "px" }, "looser": { "value": 12, "unit": "px" }, "compact": { "value": 6, "unit": "px" } } } } },
    "md": { "…": "…" }
}
```

The utility is `<family>-<role>` (`px-inset-item`, `gap-group`, `mt-related`: gap roles drop their prefix), a size's is
`<family>-<size>` (`h-control-md`), an exception's `<family>-<role>--<pattern>` (`gap-group--12-16`). An exception
(`space.exception.<role>--<pattern>`) holds its Today pair and the utility families it uses; every preview mode renders
its role (per axis for insets, per dimension for sizes), except under a navigation chrome role, whose exceptions carry
their own snapped values. A utility reads one variable; the variable is set to its desktop value once per breakpoint
(see "Breakpoint scopes" below). Nothing is written into Tailwind's `--spacing-*` namespace (it would turn every role
into width, size and inset utilities).

The generator validates: preview values on the scale, compact ≤ new ≤ looser, no step down at md, gap levels in order,
floors (phone page gutter 16, control heights ≥ 24 and ≥ 28 in compact), the chrome rule (New = Today snapped, one step
at most), the New change budget for every role and exception (4 px up to 24 px, 8 px above; owner decision 0), and every
exception's role, families and redundancy. `pnpm tokens:report` prints the role, size and exception tables with the
places using them and the change in New, and fails when an exception has no place.

## Typography tokens

A role, in `typography.today.tokens.json` (two DTCG `typography` composites, `base` below 48rem and `md` from it):

```json
"supporting": {
    "base": { "$value": { "fontFamily": "{font.family.sans}", "fontSize": "{font.size.sm}", "fontWeight": "{font.weight.normal}", "letterSpacing": { "value": 0, "unit": "px" }, "lineHeight": "{font.leading.tight}" } },
    "md": { "$value": { "fontFamily": "{font.family.sans}", "fontSize": "{font.size.base}", "fontWeight": "{font.weight.normal}", "letterSpacing": { "value": 0, "unit": "px" }, "lineHeight": "{font.leading.tight}" } }
}
```

An exception (`type.exception.<role>--<pattern>`) keeps the bundle its places render today, with the pattern in
`$description` and `resolution` in its extension; in Next it is a composite alias of its role. Today never sets the
family or the letter spacing where they are the inherited defaults (`todayInherits`), so a role cannot override what a
parent sets. The desktop step is a value switch of the variables (see "Breakpoint scopes" below). The Next value set is keyed off
`[data-typography="next"]`, an axis independent of the colour theme. `pnpm tokens:report` prints the role and exception
tables with every place that uses them (and fails when an exception has no place).

## Breakpoint scopes and preview stylesheets

A spacing or typography utility reads one custom property (`gap: var(--space-gap-group)`); it carries no desktop rule.
The property holds the phone value and is set again to the desktop value once per breakpoint, where the breakpoint is
measured (`scripts/tokens/lib/scopes.mjs`, `scopes.config.json`; only the properties whose value changes are set again):

- root scope, in `spacing.css` / `typography.css`: `:root` under `@media (width >= 48rem)` (the `breakpoint.css.md`
  primitive). This is the kit's `md` and, in the app, everything outside the application column, where its `md` variant
  is a viewport media query too (dialogs and menus portalled to the body, the assistant panel, the column element itself);
- column scope, in the app only (`tokensColumn.css`): the children of the application column (`@container/app`) set the
  same properties to their phone value and, under `@container app (width >= 48rem)`, to their desktop value. The reset
  matters when the viewport is wide but the column narrow (the assistant docked beside it).

The preview value sets (colour Next and Dark, typography Next, spacing New, looser and compact, the coarse-pointer
fallback) are not in the stylesheet every user downloads. They are written to `.storybook/tokensPreview.css` (Storybook
loads it always) and `apps/app/public/tokens-preview.css` (the same sets at both scopes; `layoutRoot.tsx` links it in the
head only while the debug panel flag is on and a preview cookie is set, so there is no flash). The published kit keeps
`build.css` with Today only: the preview sheet is not part of the package, because the package has no subpath export for
it (`AGENTS.md`: no subpath exports). A preview rule is `:root[data-x="v"], [data-x="v"]`, one class more specific than
Today's `:root`, so the order of the sheets does not matter; and, as the sheet is plain CSS that Tailwind does not
process, a preview value that reads a theme variable carries its literal as the variable's fallback.

## Representation boundaries

- `--spacing` is the 4px Tailwind multiplier, not an enumerated spacing scale.
- Breakpoint numbers (`--breakpoint-*-px`, in `:root`) and rem dimensions (`--breakpoint-*`, in `@theme`) are separate;
  no root font-size assumption converts between them.
- Tailwind's built-in line heights that a typography style keeps (`--leading-default-*`) are DTCG numbers with a
  `ratio` extension, written as the same `calc()` Tailwind uses: the rounded number rendered 28.0001px where Tailwind
  renders 28px.
- `font-variant-numeric` has no DTCG type: the `numeric` modifier's per-mode values live in `typography.config.json`.
- `transparent` is sRGB black with alpha zero. The zero-length transparent shadow uses explicit zero blur and spread.
- `--radius-none: none` has no DTCG dimension; it is a `raw` line of the layout, like the namespace resets
  (`--color-*: initial`).
- Utilities, the focus-ring behaviour, the font faces and the app's z-index and position configuration are CSS, not
  tokens: `css/` and `layoutRoot.overrides.css`.
- The app artifact's header still carries the provenance of its first snapshot (`primitives.config.json`, `app.provenance`)
  because the artifact is kept byte-identical; it is not the current kit version.

## Changing tokens

1. Edit `source/` (a value, a name in `renames`, a utility in `semantic.config.json`).
2. `pnpm tokens:generate`, then review the CSS diff.
3. `pnpm tokens:semantic:map:check` (kit) and `pnpm --filter @aragon/app colors:map:check`: the component maps read the
   generated CSS.
4. A change under `src/` needs a kit changeset and, when the registry cites it, a refreshed registry
   (`skills/shared/rules/gov-ui-kit-changes`).

Background and decisions: `semantic-colors.decisions.md` (P-75 for this consolidation).
