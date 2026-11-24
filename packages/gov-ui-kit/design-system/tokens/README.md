# GovKit design tokens

One DTCG 2025.10 token source, one generator. The primitives that were once kept twice, as the kit's hand-written CSS
and as the app's DTCG snapshot with its parity baseline, now live once in `source/`; the CSS is generated.

```text
design-system/tokens/source/
  primitives.tokens.json        today's primitives: colours, shadows, radius, breakpoints, spacing, type, focus ring
  primitives.config.json        not tokens: CSS names, the layout of each primitive CSS file, the app artifact
  typography.today.tokens.json  semantic typography, Today: roles, exceptions, modifiers (what the code renders)
  typography.next.tokens.json   semantic typography, Next preview: plain role bundles in Sora / Inter Display
  typography.config.json        not tokens: modes and their selectors, the md variant, the modifiers, outputs
  css/                          CSS that holds no token value and is copied verbatim: utilities, @font-face
  schema/format.2025.10.json    the published DTCG schema, unmodified
scripts/tokens/                 generate.mjs and lib/ (the generator), generate.test.mjs
```

The source holds the primitives. The generator also renders the semantic typography layer when the source has one.

The layer (`lib/typography.mjs`) is read from `typography.config.json` and the mode files it names; without the config nothing typographic is read or written, and a typography mode file without it fails the generator instead of being ignored. It renders
`src/theme/tokens/typography.css` (one value set per mode, one `@utility type-*` per role and exception, the modifiers)
and `src/core/types/typographyStyles.ts` (the style names as a TypeScript union and a class map, for `Heading`'s
`typeRole`). Decisions, the role table and the exception table: `typography.decisions.md`.

The kit owns the source: it owns the tokens and is the published package, and the app artifact is a projection of it.
(`design-system/` itself is not in the npm package: `files` in the kit's `package.json` ships the generated CSS.)
Do not edit the CSS the generator writes; change the source and regenerate.

## Commands

From the kit (or the root as `pnpm tokens:generate` / `pnpm tokens:check`):

```sh
pnpm tokens:generate   # validate the source, write every output
pnpm tokens:check      # validate, fail when an output on disk is stale (writes nothing)
node scripts/tokens/generate.mjs --check --source <dir>   # check a scratch copy of the source against the repo
pnpm test:tokens       # (root) generator tests + the app's consumer compile
```

Outputs, all with a do-not-edit header:

| Output | Consumer |
| --- | --- |
| `src/theme/tokens/primitives/*.css` and `index.css` | the kit build, Storybook, npm consumers |
| `.design-sync/generated/govkit-primitives.css` | the app (`layoutRoot.css` imports it instead of the primitives barrel) |
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

## What the generator checks

- Each source document against the DTCG 2025.10 schema, every alias (missing target, cycle, type mismatch), every
  resolved value against its type.
- Every primitive token is placed in the CSS exactly once (`primitives.config.json` places each; an unplaced or
  doubly placed token fails), and every token has a CSS name.
- The app overrides rule above; font URLs in the artifact all rebased.
- `pnpm tokens:check` fails when any output is stale; `pnpm test:tokens` runs the same comparison in CI.

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
parent sets. The desktop step is applied through Tailwind's `md` variant inside each utility, so it follows whatever
`md` means where the CSS is compiled (a container query on the app column in the app). The Next value set is keyed off
`[data-typography="next"]`, an axis independent of the colour theme. `pnpm tokens:report` prints the role and exception
tables with every place that uses them (and fails when an exception has no place).

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

## Changing tokens

1. Edit `source/` (a value, or the layout in `primitives.config.json`).
2. `pnpm tokens:generate`, then review the CSS diff.
3. A change under `src/` needs a kit changeset and, when the registry cites it, a refreshed registry
   (`skills/shared/rules/gov-ui-kit-changes`).
