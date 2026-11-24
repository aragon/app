# GovKit design tokens

One DTCG 2025.10 token source, one generator. The token values live in JSON; the CSS is generated from it.

```text
design-system/tokens/source/
  primitives.tokens.json        the tokens: colours, shadows, radius, breakpoints, spacing, type, focus ring colours
  primitives.config.json        not tokens: the CSS name of each token and the layout of the generated files
  schema/format.2025.10.json    the published DTCG schema, unmodified
scripts/tokens/                 generate.mjs and lib/ (the generator), generate.test.mjs
src/theme/tokens/primitives/    the generated CSS (do not edit)
src/theme/tokens/               hand-written CSS that goes with the tokens: focus ring and gradient utilities
src/theme/fonts/                the font files and their @font-face rules
```

`design-system/` is not in the npm package; `files` in the kit's `package.json` ships the generated CSS. The app and
the docs site import the kit's CSS by path, so a regenerated file reaches them without another step.

## Changing a token

1. Edit `source/primitives.tokens.json` (a value) or `source/primitives.config.json` (a name, the layout).
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

The `components` are the colour; the `hex` is its readable form, which DTCG keeps optional and this source always
carries. `pnpm tokens:generate` writes it, so a new colour needs only its components. To change a colour by its hex,
edit the hex and run the generator: it stops on the mismatch and prints the components of that hex to paste in.

## Layout config

`primitives.config.json` maps each generated file to its blocks, and each block (`@theme`, `:root`) to its lines. A
line ending in `;` is CSS with no DTCG form, such as a namespace reset (`--color-*: initial;`) or
`--radius-none: none;`. Any other line is a token path: it places that token, or every token under that group, in
document order.

## What the generator checks

- The document against the DTCG 2025.10 schema, every alias (missing target, cycle, type mismatch), every resolved
  value against the schema of its type.
- Every token has a CSS name and is placed exactly once.
- Every colour's `hex` agrees with its components.

## Representation boundaries

- `--spacing` is the 4px Tailwind multiplier, not an enumerated spacing scale.
- Breakpoint numbers (`--breakpoint-*-px`, in `:root`) and rem dimensions (`--breakpoint-*`, in `@theme`) are separate
  tokens; no root font-size assumption converts between them.
- `transparent` is sRGB black with alpha zero.
- Colours are sRGB with numeric components; the generator rejects other colour spaces.
