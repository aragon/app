# GovKit token parity baseline

`govkit-primitives.tokens.json` is a DTCG 2025.10 snapshot of the current GovKit primitive token layer. It preserves the existing CSS namespaces and values; it does not introduce semantic color roles, theme modes, generated consumer output, or Figma synchronization.

## Source of truth

- Package: `@aragon/gov-ui-kit@2.11.4`
- Source revision: `64b517f5b90052797ecaced5f15ab616b5733f30`
- Source path: `src/theme/tokens/primitives/`
- App CSS entry: `apps/app/src/modules/application/components/layouts/layoutRoot/layoutRoot.css`
- DTCG schema: `https://www.designtokens.org/schemas/2025.10/format.json`

The snapshot records source variables in `parity-baseline.json`, including the source file, CSS spelling, DTCG token path, and a value digest. Unsupported CSS utilities and the seven App runtime overrides are recorded rather than silently converted into invented design tokens.

## Reviewed local design artifacts

Local research and Figma exports were reviewed but are not adopted as this rendered-behavior baseline:

- `.claude/semantic-tokens-investigation.md` proposes semantic roles and theme modes.
- `.claude/tmp/figma-tokens/semantic/Light.tokens.json` and `Dark.tokens.json` are semantic Figma exports.
- `.claude/tmp/figma-tokens/primitives/Default.tokens.json` is a Figma primitive export.

These paths are local research evidence, not checked-in source. The Figma primitive palette does not match the current GovKit CSS palette: Figma `gray/50` is `#FAFAFA`, while GovKit `--color-neutral-50` is `#F5F7FA`. Importing those files would change rendered behavior, so the parity source uses the pinned GovKit CSS revision.

## Validation

```sh
pnpm tokens:validate
```

The repository-local validator enforces the selected DTCG 2025.10 subset: canonical token types, valid token/group names, typed color/dimension/font/shadow/number values, resolvable same-type aliases, complete source mappings, and unchanged value digests. The official DTCG schema URL is recorded in both JSON files for downstream schema validators.

