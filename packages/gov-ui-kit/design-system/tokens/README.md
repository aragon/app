# GovKit design tokens

One DTCG 2025.10 token source, one generator. The primitives that were once kept twice, as the kit's hand-written CSS
and as the app's DTCG snapshot with its parity baseline, now live once in `source/`; the CSS is generated.

```text
design-system/tokens/source/
  primitives.tokens.json        today's primitives: colours, shadows, radius, breakpoints, spacing, type, focus ring
  primitives.config.json        not tokens: CSS names, the layout of each primitive CSS file, the app artifact
  spacing.roles.tokens.json     semantic spacing roles: insets, gaps, the navigation chrome (Today + preview modes)
  spacing.sizes.tokens.json     component sizes: control heights and their padding and gap, the tag, the row
  spacing.exceptions.tokens.json  Today exceptions of the spacing roles (`<role>--<pattern>`)
  spacing.config.json           not tokens: modes and selectors, families, scale, floors, budget, chrome rule, outputs
  css/                          CSS that holds no token value and is copied verbatim: utilities, @font-face
  schema/format.2025.10.json    the published DTCG schema, unmodified
scripts/tokens/                 generate.mjs and lib/ (the generator), generate.test.mjs
```

The source holds primitives only. The generator also renders a semantic colour layer (`lib/semantic.mjs`) when the
source has one: `semantic.config.json`, which then requires `palette.tokens.json` and the mode files it names, and adds
the output `src/theme/tokens/semantic/colors.css`. Without the config nothing semantic is read or written, and a palette
or mode file without it fails the generator instead of being ignored.

The semantic spacing layer (`lib/spacing.mjs`) follows the same rule with `spacing.config.json`: it renders
`src/theme/tokens/spacing.css` (one value set per mode on `:root` and `[data-spacing="new|looser|compact"]`, the
coarse-pointer fallback, one `@utility` per role or size × family and per exception × the families it lists) and
`src/core/types/spacingStyles.ts` (the names as TypeScript lists). Decisions, the role, size and exception tables:
`spacing.decisions.md`.

The kit owns the source: it owns the tokens and is the published package, and the app artifact is a projection of it.
(`design-system/` itself is not in the npm package: `files` in the kit's `package.json` ships the generated CSS.)
Do not edit the CSS the generator writes; change the source and regenerate.

## Commands

From the kit (or the root as `pnpm tokens:generate` / `pnpm tokens:check`):

```sh
pnpm tokens:generate   # validate the source, write every output
pnpm tokens:check      # validate, fail when an output on disk is stale (CI-safe, writes nothing)
pnpm tokens:report     # semantic layer only: which Today values are verified against code, which are fallbacks
node scripts/tokens/generate.mjs --check --source <dir>   # check a scratch copy of the source against the repo
pnpm test:tokens       # (root) generator tests + the app's consumer compile
```

Outputs, all with a do-not-edit header:

| Output | Consumer |
| --- | --- |
| `src/theme/tokens/primitives/*.css` and `index.css` | the kit build, Storybook, npm consumers |
| `.design-sync/generated/govkit-primitives.css` | the app (`layoutRoot.css` imports it instead of the primitives barrel) |
| `src/theme/tokens/spacing.css` | the kit (via `tokens/index.css`), the app (`layoutRoot.css`), the help center |
| `src/core/types/spacingStyles.ts` | the role, size and exception names as TypeScript lists |

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
their own snapped values. Every utility declares the base value and the md value through Tailwind's `md` variant, so it
steps on the app column in the app. Nothing is written into Tailwind's `--spacing-*` namespace (it would turn every role
into width, size and inset utilities).

The generator validates: preview values on the scale, compact ≤ new ≤ looser, no step down at md, gap levels in order,
floors (phone page gutter 16, control heights ≥ 24 and ≥ 28 in compact), the chrome rule (New = Today snapped, one step
at most), the New change budget for every role and exception (4 px up to 24 px, 8 px above; owner decision 0), and every
exception's role, families and redundancy. `pnpm tokens:report` prints the role, size and exception tables with the
places using them and the change in New, and fails when an exception has no place.

## Representation boundaries

- `--spacing` is the 4px Tailwind multiplier, not an enumerated spacing scale.
- Breakpoint numbers (`--breakpoint-*-px`, in `:root`) and rem dimensions (`--breakpoint-*`, in `@theme`) are separate;
  no root font-size assumption converts between them.
- `transparent` is sRGB black with alpha zero. The zero-length transparent shadow uses explicit zero blur and spread.
- `--radius-none: none` has no DTCG dimension; it is a `raw` line of the layout, like the namespace resets
  (`--color-*: initial`).
- Utilities, the focus-ring behaviour, the font faces and the app's z-index and position configuration are CSS, not
  tokens: `css/` and `layoutRoot.overrides.css`.
- The app artifact's header still carries the provenance of its first snapshot (`primitives.config.json`, `app.provenance`)
  because the artifact is kept byte-identical; it is not the current kit version.

## Changing tokens

1. Edit `source/` (a value, or the layout in `primitives.config.json`).
2. `pnpm tokens:generate`, then review the CSS diff.
3. A change under `src/` needs a kit changeset and, when the registry cites it, a refreshed registry
   (`skills/shared/rules/gov-ui-kit-changes`).
