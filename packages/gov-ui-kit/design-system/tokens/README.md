# GovKit design tokens

One DTCG 2025.10 token source, one generator. The token values live in JSON; the CSS is generated from it.

```text
design-system/tokens/source/
  primitives.tokens.json        the primitives: colours, shadows, radius, breakpoints, spacing, type, focus ring colours
  semantic.tokens.json          the semantic colour roles of the default theme, as aliases of the primitives
  typography.tokens.json        the typography roles, their exceptions and the modifiers of the default theme
  spacing.tokens.json           the spacing roles, the component sizes and their exceptions of the default theme
  app.tokens.json               the tokens only the app uses (colour aliases, type and spacing exceptions no kit component takes)
  <layer>.config.json           not tokens: the CSS name of each token, the layout of the generated files, the previews
  modes/                        the preview modes (Next, Dark, the spacing densities): documents merged over the default theme
  schema/format.2025.10.json    the published DTCG schema, unmodified
design-system/tokens/app/       the generated CSS of app.tokens.json (do not edit)
design-system/tokens/preview/   the generated preview CSS (do not edit)
design-system/tokens/nextTypographyFonts.css   the faces of the Next typography preview, loaded with the preview
scripts/tokens/                 generate.mjs and lib/ (the generator), generate.test.mjs
src/theme/tokens/<layer>/       the generated CSS (do not edit)
src/theme/tokens/               hand-written CSS that goes with the tokens: colour, spacing and type role, focus ring and gradient utilities
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
A `typography` composite becomes one token per part (`<path>.fontSize`, …): each part may alias a token of its own
type, and a whole-composite alias aliases each part of its target.

The `components` are the colour; the `hex` is its readable form, which DTCG keeps optional and this source always
carries. `pnpm tokens:generate` writes it, so a new colour needs only its components. To change a colour by its hex,
edit the hex and run the generator: it stops on the mismatch and prints the components of that hex to paste in.

## Layout config

Each `<layer>.config.json` lays out the tokens of `<layer>.tokens.json`: it maps each generated file to its blocks, and
each block (`@theme`, `:root`) to its lines. A line ending in `;` is CSS with no DTCG form, such as a namespace reset
(`--color-*: initial;`) or `--radius-none: none;`. Any other line is a token path: it places that token, or every
token under that group, in document order. The files go to `src/theme/tokens/<layer>/`, or to the kit-relative `dir`
of the config (`app.config.json`: `design-system/tokens/app/`). `cssNames` rules apply across layers. `preview` maps
each preview file to its mode selectors, and each selector to a list: the mode documents merged over the default
theme, in order; follow rules such as `{ "type.exception.*--*": "type.role.$1" }`, which make every token under a
matching group alias the same token under the target group (after the documents, and only where no listed document
sets the token; a `*` matches within one path segment, and the first matching rule wins); and CSS lines ending in `;`
for a value with no DTCG type. An at-rule key (`"@media (pointer: coarse)": { <selector>: [...] }`) writes its modes
inside that rule: each adds its list to the one of the same selector outside and holds only the tokens that differ
from that mode.

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

## Typography roles

Text takes a role by its job, not a size. `typography.tokens.json` holds 15 roles (`type.role.<role>`: display,
title-page, title-section, title-group, title-item, body, body-compact, supporting, caption, label, label-option,
control, control-sm, stat, tooltip). A role has a `base`, a DTCG `typography` composite whose parts alias the type
primitives, and an `md` from the md breakpoint that holds only the parts that may step: font size, line height and
letter spacing (family and weight never change at `md`).

```json
"supporting": {
    "base": { "$value": { "fontFamily": "{font.family.sans}", "fontSize": "{font.size.sm}", "fontWeight": "{font.weight.normal}", "letterSpacing": { "value": 0, "unit": "px" }, "lineHeight": "{font.leading.tight}" } },
    "md": {
        "fontSize": { "$type": "dimension", "$value": "{font.size.base}" },
        "lineHeight": { "$type": "number", "$value": "{font.leading.tight}" },
        "letterSpacing": { "$type": "dimension", "$value": { "value": 0, "unit": "px" } }
    }
}
```

Each part is a `--guk-type-<property>-<role>` theme variable (`--guk-type-md-…` for `md`). `src/theme/tokens/
typeRoles.css` declares one functional utility, `type-*`, that sets the five properties and steps through the `md`
variant of the build that compiles it: a container query on the app column in the app. Tailwind emits only the
variables of the roles in use.

- **Exceptions** (`type.exception.<role>--<pattern>`): a place that renders another bundle than its role, its
  `$description` naming the place. The class is `type-<role>--<pattern>`. An exception no kit component uses lives in
  `app.tokens.json`, so the published CSS does not carry it. In a preview mode an exception follows its role: one rule
  in `typography.config.json` (`"type.exception.*--*": "type.role.$1"`).
- **Modifiers**: `type-strong` (`type.modifier.strong`, 600), `type-mono` (`type.modifier.mono`) and `type-numeric`
  (tabular figures in Next, a CSS line of the preview because `font-variant-numeric` has no DTCG type; the parent's
  figures otherwise).
- **Order**: a role sorts before raw `text-*`, `leading-*`, `font-*` and `tracking-*` classes and the modifiers, so
  those win over it at every width; a raw `text-*` brings its own line height. Between two roles on one element the
  later name in the alphabet wins.
- **A new role or exception**: add it to `typography.tokens.json` (an exception only the app uses to
  `app.tokens.json`; a role also to `modes/typography.next.tokens.json`), run `pnpm tokens:generate`, use the class.
  Reuse a role or an exception with the same bundle before adding one.
- **Next**: `modes/typography.next.tokens.json` holds the designer's 15 role bundles and the two faces they use;
  `design-system/tokens/preview/typography.css` sets them under `data-typography="next"`. Storybook (toolbar) and the
  app's debug panel load it with `nextTypographyFonts.css`; nothing of Next ships in the kit's CSS.

Lint: `biome-plugins/{js,css}/noPrimitiveTypography.grit` flag primitive type classes (`text-sm`, `md:text-lg`,
`leading-*`, `font-semibold`, `tracking-*`, `text-[13px]`) outside the theme. A class kept on purpose takes
`biome-ignore lint/plugin/noPrimitiveTypography: <reason>` on the line above.

## Spacing roles

Padding, margins, gaps and control heights take a role by its job, not a number. `spacing.tokens.json` holds the roles
(`space.role.<role>`), the component sizes (`space.size.<size>`) and their exceptions; each value has a `base` and an
`md` (from the md breakpoint), in px. An inset has an `x` and a `y`; a size a `height`, an `x` and `y` padding and a
`gap`, whichever it sets.

```json
"inset-item": {
    "$description": "Padding of one item among peers that steps up on desktop: data list rows, accordion headers and bodies, …",
    "x": { "base": { "$value": { "value": 16, "unit": "px" } }, "md": { "$value": { "value": 24, "unit": "px" } } },
    "y": { "base": { "$value": { "value": 12, "unit": "px" } }, "md": { "$value": { "value": 20, "unit": "px" } } }
}
```

| Group | Tokens | Job (each `$description` says where) |
|---|---|---|
| Insets | `inset-tight`, `inset-item`, `inset-item-flat`, `inset-surface`, `inset-surface-flat`, `inset-surface-wide`, `inset-page`, `inset-flush` | the padding of a box, by what the box is |
| Gaps | `gap-tight`, `gap-phrase`, `gap-related`, `gap-group`, `gap-group-stepped`, `gap-section`, `gap-section-stepped`, `gap-section-wide`, `gap-layout` | the space between siblings, from the parts of one element to page columns |
| Navigation chrome | `inset-nav`, `inset-nav-item`, `inset-nav-bar`, `gap-nav-tight`, `gap-nav-related`, `gap-nav-group`, `gap-nav-section` | the app shell around the navigation |
| Sizes | `control-sm`, `control-md`, `control-lg`, `control-item`, `control-item-flat`, `control-label`, `tag`, `row` | control heights and their padding |

- **Classes**: each value is a `--guk-space-<dimension>-<name>` theme variable (`--guk-space-md-…` for `md`), the
  dimension `x`, `y`, `gap` or `height`; a gap drops its `gap-` prefix. `src/theme/tokens/spacingRoles.css` declares
  one functional utility per family in use (`p`, `px`, `py`, `pt`, `pb`, `pl`, `pr`, `ps`, `mx`, `my`, `mt`, `mb`,
  `ml`, `mr`, `ms`, `gap`, `gap-x`, `gap-y`, `space-x`, `space-y`, `h`, `min-h`, `w`): a padding or margin reads its
  axis, then the gaps; `h-`, `min-h-` and `w-` read a height. So `px-inset-item`, `py-control-lg`, `gap-related`,
  `mt-section`, `h-control-md`. One class holds both widths: it steps through the `md` variant of the build that
  compiles it, a container query on the app column in the app. A number falls through to Tailwind (`p-4`, `gap-0`).
- **Exceptions** (`space.exception.<role>--<pattern>`): a place that keeps its own value, the pattern spelling it
  (`fixed-8`, or `12-16` phone then desktop). The class is `<family>-<role>--<pattern>` (`gap-related--8-12`,
  `py-inset-item--12-24`). An exception holds the dimensions its classes read. One no kit component and no docs page
  uses lives in `app.tokens.json`, like the roles only the app uses.
- **Order**: a role declares its property twice (base and `md`), so it sorts before a raw class of the same property,
  and the raw class wins at every width: a raw base class passed to a component also replaces the role's `md` value.
  Between two roles on one element the later name in the alphabet wins (`gap-related--8-12` over `gap-related`), so a
  caller that overrides the role a kit component sets passes its role with the important modifier (`gap-related!`).
  `generate.test.mjs` pins this order.
- **A new role, size or exception**: add it to `spacing.tokens.json` (or `app.tokens.json`), run
  `pnpm tokens:generate`, use the class; a family not yet in `spacingRoles.css` needs its utility there. Reuse a role
  or an exception with the same value before adding one.
- **Previews**: `modes/spacing.new.tokens.json`, `spacing.looser.tokens.json` and `spacing.compact.tokens.json` hold the
  values that differ from the default theme, `spacing.compact.coarse.tokens.json` the controls that keep their New size
  on a touch screen (written inside `@media (pointer: coarse)`). To change a preview value, edit or add it in its mode
  document (a `base` or `md` a role or size leaves out keeps the default) and run `pnpm tokens:generate`. An exception follows its role,
  a `control-*` one its size, unless its mode document sets it: the navigation chrome and the density-invariant
  exceptions have their own values there, and an exception its role would move the wrong way (tighter than the
  default in looser, looser in compact) keeps its default value there; `generate.test.mjs` checks the direction.
  `design-system/tokens/preview/spacing.css` sets the modes under `data-spacing="new|looser|compact"`; Storybook
  (toolbar) and the app's debug panel load it.

Lint: `biome-plugins/{js,css}/noPrimitiveSpacing.grit` flag number, `px`, arbitrary and variable values of padding,
margin, gap and space classes (`p-4`, `md:gap-x-2.5`, `-ml-1`, `pt-[72px]`) outside the theme; zero and `auto` pass. A
class kept on purpose takes `biome-ignore lint/plugin/noPrimitiveSpacing: <reason>` on the line above.

## What the generator checks

- The document against the DTCG 2025.10 schema, every alias (missing target, cycle, type mismatch, typography parts
  included), every resolved value against the schema of its type; the same for every preview mode.
- Every token has a CSS name of its own and is placed exactly once; a mode has no token the default theme lacks.
- Every colour's `hex` agrees with its components.

## Representation boundaries

- `--spacing` is the 4px Tailwind multiplier, not an enumerated spacing scale. The spacing roles are pixel values, not
  multiples of it: DTCG has no expression to alias `4 × --spacing`.
- Breakpoint numbers (`--breakpoint-*-px`, in `:root`) and rem dimensions (`--breakpoint-*`, in `@theme`) are separate
  tokens; no root font-size assumption converts between them.
- `transparent` is sRGB black with alpha zero.
- Colours are sRGB with numeric components; the generator rejects other colour spaces.
- Tailwind's built-in line heights that a typography style keeps (`font.leadingDefault.*`) are numbers with a
  `ratio` extension, written as the `calc()` Tailwind writes: the rounded decimal renders a fraction of a pixel off.
