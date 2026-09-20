# GovKit token parity

`govkit-primitives.tokens.json` records the current GovKit primitive values and focus-ring color aliases in [DTCG 2025.10 format](https://www.designtokens.org/tr/2025.10/format/). Existing CSS remains the runtime source; this directory does not emit or load consumer styles.

## Source

- Package: `@aragon/gov-ui-kit@2.11.4`
- GovKit source revision: `64b517f5b90052797ecaced5f15ab616b5733f30`
- Primitive import barrel: `src/theme/tokens/primitives/index.css`
- App CSS: `apps/app/src/modules/application/components/layouts/layoutRoot/layoutRoot.css`

`parity-baseline.json` maps every represented CSS variable to its DTCG path and original CSS value. It also records namespace resets, utility rules, font faces, imports, the unsupported `--radius-none: none` value, and app runtime overrides. These CSS constructs must survive any later output conversion.

The reviewed local Figma exports use a different palette: `gray/50` is `#FAFAFA`, whereas GovKit `--color-neutral-50` is `#F5F7FA`. The snapshot follows consumed CSS rather than adopting those semantic roles or theme modes.

## Validation

After `pnpm install`, run from the repository root:

```sh
pnpm tokens:validate
pnpm test:tokens
```

The validator reads the installed `apps/app/node_modules/@aragon/gov-ui-kit` package. To compare a source checkout instead:

```sh
GOVKIT_KIT_ROOT=/path/to/gov-ui-kit pnpm tokens:validate
```

`source.mjs` follows the primitive CSS imports, parses them with the app's PostCSS dependency, and converts the supported values for comparison. Validation checks the package version, full token inventory, types, values, alias targets and cycles, retained CSS, and app overrides. It rejects unsupported new value syntax instead of silently skipping it. Editing both JSON snapshots cannot conceal a difference from CSS.

Captured App overrides must be direct declarations in a top-level `:root` rule; conditional or nested scopes are rejected. Primitive `@theme` blocks must have no parameters. Declarations extracted as primitive values, namespace resets, or App overrides cannot use `!important`, because those records do not preserve importance. Utilities and font faces retain their full CSS, including nested rules and importance, and remain subject to baseline comparison.

Schema validation runs offline through the root `ajv` dependency. `schema/format.2025.10.json` is the unmodified [published bundled schema](https://www.designtokens.org/schemas/2025.10/format.json), retrieved 2026-09-19 (SHA-256 `32e93b780e4e4bca778d0780cb797a560deedc470c608af16576223f7e42915f`). It declares JSON Schema draft-07. The document schema cannot tell which type a value was declared as, so each token's resolved value is validated again against its inherited type. The regression suite runs in the root `test` and `test:coverage` commands.

## Representation boundaries

- `--spacing` is the 4px Tailwind multiplier, not an enumerated spacing scale.
- Breakpoint numbers and rem dimensions remain separate; no root font-size assumption converts between them.
- `transparent` is sRGB black with alpha zero. The zero-length transparent shadow uses explicit zero blur/spread; both preserve the CSS values' meaning.
- `--radius-none: none` stays in the unsupported list rather than becoming a fabricated dimension.
- Namespace resets, gradients, focus behavior, font loading, and app z-index/position configuration remain CSS, not DTCG tokens.

When GovKit changes, review the source differences before updating both snapshots and their provenance. The extractor supports this CSS vocabulary, not arbitrary CSS or a general DTCG resolver.
