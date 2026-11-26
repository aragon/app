# GovKit design tokens

One DTCG 2025.10 token source, one generator. The token values live in JSON; the CSS is generated from it.

```text
design-system/tokens/source/
  primitives.tokens.json        the primitives: colours, shadows, radius, breakpoints, spacing, type, focus ring colours
  semantic.tokens.json          the semantic colour roles of the default theme, as aliases of the primitives
  app.tokens.json               the tokens only the app uses (component aliases no kit component takes)
  <layer>.config.json           not tokens: the CSS name of each token, the layout of the generated files, the previews
  modes/                        the preview modes (Next, Dark): documents merged over the default theme
  schema/format.2025.10.json    the published DTCG schema, unmodified
design-system/tokens/app/       the generated CSS of app.tokens.json (do not edit)
design-system/tokens/preview/   the generated preview CSS (do not edit)
scripts/tokens/                 generate.mjs and lib/ (the generator), generate.test.mjs
src/theme/tokens/<layer>/       the generated CSS (do not edit)
src/theme/tokens/               hand-written CSS that goes with the tokens: role, focus ring and gradient utilities
src/theme/fonts/                the font files and their @font-face rules
```

`design-system/` is not in the npm package; `files` in the kit's `package.json` ships the generated CSS. The app and
the docs site import the kit's CSS by path, so a regenerated file reaches them without another step. The app also
imports `design-system/tokens/app/index.css` from its `layoutRoot.css`; the docs site does not.

## Changing a token

1. Edit `source/<layer>.tokens.json` (a value), `source/modes/` (a preview value) or `source/<layer>.config.json` (a
   name, the layout).
2. Run `pnpm tokens:generate` in the kit and review the CSS diff.
3. Commit the JSON and the CSS together. A change under `src/` needs a kit changeset.

`pnpm tokens:check` fails when a file on disk is stale and writes nothing. `pnpm test` runs the generator tests
(`pnpm test:tokens`), which include that check, so CI catches a forgotten regeneration.

## Token shapes

Tokens follow the DTCG format. A colour is a colour object, a dimension a value with a unit:

```json
"color": { "$type": "color", "primary": { "500": { "$value": { "colorSpace": "srgb", "components": [0, 0.23137254901960785, 0.9607843137254902], "hex": "#003bf5" } } } }
"radius": { "$type": "dimension", "md": { "$value": { "value": 4, "unit": "px" } } }
```

A token can alias another of the same type (`"$value": "{color.primary.200}"`); the CSS then holds a `var()`.
Individual shadow layers and their fields must be literals. Set `"inset": true` on a layer for an inner shadow.

The `components` are the colour; the `hex` is its readable form, which DTCG keeps optional and this source always
carries. `pnpm tokens:generate` writes it, so a new colour needs only its components. To change a colour by its hex,
edit the hex and run the generator: it stops on the mismatch and prints the components of that hex to paste in.

## Layout config

Each `<layer>.config.json` lays out the tokens of `<layer>.tokens.json`: it maps each generated file to its blocks, and
each block (`@theme`, `:root`) to its lines. A line ending in `;` is CSS with no DTCG form, such as a namespace reset
(`--color-*: initial;`) or `--radius-none: none;`. Any other line is a token path: it places that token, or every
token under that group, in document order. The files go to `src/theme/tokens/<layer>/`, or to the kit-relative `dir`
of the config (`app.config.json`: `design-system/tokens/app/`). `cssNames` rules apply across layers. `preview` maps each preview file to its mode selectors, and each selector to the mode documents
merged over the default theme, in order.

## Semantic colours

Components take colours from roles, not from the primitive ramps. Three tiers:

- **Primitives** (`primitives.tokens.json`): the ramps, `--color-neutral-0` … `--color-critical-900`, and the shadows.
- **Roles** (`semantic.tokens.json`): `<family>-<group>-<role>`, each an alias of a primitive. Families: `bg`, `text`,
  `icon`, `border`, `ring`, `gradient`, `shadow`. Groups: `surface`, `accent`, `brand`, `link`, `success`, `warning`,
  `critical`, `info`. Roles name a rank (`primary`, `secondary`, `tertiary`, `solid`, `subtle`, `inverse`) or a state
  (`default`, `hover`, `active`, `selected`, `disabled`, `focus`), alone or combined (`hover-inverse`).
- **Component aliases**: a role with a component suffix (`bg-surface-tertiary-avatar`, `border-surface-default-switch`)
  where one component needs a value no role has. Its `$description` names the component. Reuse a role before adding
  one. An alias that no kit component uses (only the app or the assistant chat) goes in `app.tokens.json`, so the
  published kit CSS does not carry it.

The variables are `--guk-<family>-<group>-<role>` theme variables; shadows are `--shadow-<group>-<size>` on Tailwind's
own namespace. Tailwind emits only the variables a class or a `var()` in the scanned source uses.

Shadow classes: the neutral and primary primitives keep their Tailwind names, and their classes (`shadow-neutral-sm`)
inline the default value, so they ignore a preview mode. The status primitives are `--guk-shadow-<status>-<size>`,
which no utility reads, so `shadow-success-sm` is the class of the `semantic.shadow.success.sm` role and follows the
mode.

Classes: `src/theme/tokens/colorRoles.css` declares one functional utility per family and property (`bg-*`, `text-*`,
`icon-*`, `border-*` and its sides, `ring-*`) that reads those variables, so `bg-surface-primary` sets
`background-color: var(--guk-bg-surface-primary)`. A value with no role variable falls through to Tailwind's own
utility (`bg-neutral-0`, `text-sm`, `border-2`). `gradients.css` builds the fades. Any other property takes the
variable: `fill-(--guk-bg-info-solid-tooltip)`, `caret-(--guk-text-accent-primary)`.

To add or change a role, edit `semantic.tokens.json` (the default value), then `modes/semantic.next.tokens.json` and
`modes/semantic.dark.tokens.json` if the preview modes differ, and run `pnpm tokens:generate`. A new family or group
needs a `cssNames` rule in `semantic.config.json`; a new family also needs its utility in `colorRoles.css`.

Modes: `semantic.config.json` `preview` defines Next and Dark as documents merged over the default theme (`modes/`
holds the designer's palette, its primitives, shadows and roles). The generator writes, per mode selector, every token
whose value differs from the default as a literal to `design-system/tokens/preview/`. The file is not in the npm
package: Storybook switches it from `.storybook/tokenPreviews.json`, the app loads it with its debug panel.

Lint: `biome-plugins/{js,css}/noPrimitiveColors.grit` flag primitive colour classes and variables in kit and app
source outside the theme. A class kept on purpose takes `biome-ignore lint/plugin/noPrimitiveColors: <reason>` on the
line above.

Code names that differ from Figma:

| Figma | Code |
|---|---|
| `bg/accent/primary` | `bg/accent/solid` |
| `bg/accent/primary-inverse` | `bg/accent/subtle` |
| `bg/brand/primary` | `bg/brand/solid` |
| `bg/brand/primary-inverse` | `bg/brand/subtle` |
| `bg/success/primary` | `bg/success/subtle` |
| `bg/success/tertiary` | `bg/success/solid` |
| `bg/warning/primary` | `bg/warning/subtle` |
| `bg/warning/tertiary` | `bg/warning/solid` |
| `bg/critical/primary` | `bg/critical/subtle` |
| `bg/critical/tertiary` | `bg/critical/solid` |
| `bg/info/primary` | `bg/info/subtle` |
| `bg/info/tertiary` | `bg/info/solid` |
| `text/accent/default-inverse`, `hover-inverse`, `active-inverse` | `text/accent/inverse` |
| `icon/accent/default-inverse`, `hover-inverse`, `active-inverse` | `icon/accent/inverse` |
| `text/surface/primary-inverse` | `text/surface/inverse` |

## What the generator checks

- The document against the DTCG 2025.10 schema, every alias (missing target, cycle, type mismatch), every resolved
  value against the schema of its type; the same for every preview mode.
- Every token has a CSS name of its own and is placed exactly once; a mode has no token the default theme lacks.
- Every colour's `hex` agrees with its components.

## Representation boundaries

- `--spacing` is the 4px Tailwind multiplier, not an enumerated spacing scale.
- Breakpoint numbers (`--breakpoint-*-px`, in `:root`) and rem dimensions (`--breakpoint-*`, in `@theme`) are separate
  tokens; no root font-size assumption converts between them.
- `transparent` is sRGB black with alpha zero.
- Colours are sRGB with numeric components; the generator rejects other colour spaces.
