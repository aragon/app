# APP-726: GovKit component registry audit

The registry is accepted for use without changing entry review states. Review is informational, not an eligibility requirement. This artifact does not approve component relocation, establish product policy, or complete APP-726. Source-derived guidance and discussion-derived review questions remain distinct.

## Baseline and scope

- App source: `3c9bb798f3679fb2eb8052a192847ab2274ed1d5`, audited in the APP-726 worktree. The requested `/Users/kd-m2air/Local/app-next` checkout has the same revision; its unrelated untracked `.teacher/` directory is outside this audit. The worktree was clean before these artifacts were created.
- Kit source: `/Users/kd-m2air/Local/gov-ui-kit`, revision `64b517f5b90052797ecaced5f15ab616b5733f30`, version `2.11.4`, clean at audit start.
- Consumption: `apps/app/package.json` uses `catalog:`; `pnpm-workspace.yaml:11` pins `2.11.4`; the App importer in `pnpm-lock.yaml` resolves `2.11.4`. The installed package in the named App checkout also resolves to `2.11.4`.
- App has moved under `apps/app`, but GovKit has **not** moved into this checkout. [APP-594](https://linear.app/aragon/issue/APP-594) is In Review, not a completed migration.
- The source checkout and consumed package are separate baselines. Matching version numbers do not prove implementation equivalence. The installed JavaScript source map lists 210 TypeScript source paths but embeds none of their contents; its 154 embedded entries are transformed assets. Do not treat the inventory as proof that every source behavior is present in the installed bundle.
- An independent TypeScript-checker comparison found the same 416 public names in the source entrypoint and installed declaration entrypoint, with no missing or extra names. This verifies name-set coverage, not matching prop contracts or implementation bytes.
- Historical baseline before the rebuild: the sibling kit's existing generated `dist` was stale. Its `dist/index.es.js` hash was `fe8800d5180d2d1c397791781ec5cc841e2837587b767c4ea7d8c1150129b1b8` (528,588 bytes) while the App's installed package had `a4659934c120f72e44536de13c5e1985577ccfd6f722d015aa79f9e1119bd0a9` (535,283 bytes); its `build.css` hash was `9a938b013a7070fd1f888bc590d4570ef0c172fd4efaad2c119fec8277295145` while installed `build.css` had `15e7b4327eab8ea1cca44f847930c31353178ddaaf5e00371cfcb83e5c675812`; its declaration tree had 440 `.d.ts` files while installed had 446. That stale local checkout output was not evidence of a release or publishing problem.
- Clean rebuild outcome: the prior generated `dist` was moved aside, then `pnpm build` ran with no existing `dist`. Rollup succeeded (`src/index.ts → dist`, `index.css → build.css`, exit 0). The rebuilt public runtime/style artifacts matched the installed package byte-for-byte: `dist/index.es.js` `a4659934c120f72e44536de13c5e1985577ccfd6f722d015aa79f9e1119bd0a9`, `build.css` `15e7b4327eab8ea1cca44f847930c31353178ddaaf5e00371cfcb83e5c675812`, and `index.css` `22c94650fd16431a5e8b606a44f9201ba79eb9e121c2ccc4f49c8c6c99b1071a`.
- Clean declaration-tree outcome: rebuilt and installed packages each have 446 `.d.ts` files; all 446 are byte-identical, with no files only on either side. The earlier five rebuilt-only declarations came from stale generated output under source paths that no longer exist; they were not a source/published divergence.
- Additional shipped-file check: the rebuilt and installed packages each contain 32 files under the package's shipped `src/**/*.css` and `src/theme/fonts/*` patterns; all 32 common files are byte-identical, with no extras or omissions.
- Release workflow context: normal stable releases are built in CI. `.github/workflows/publish.yml` checks out the release source, runs `pnpm build`, then publishes with `pnpm publish --access public --no-git-checks --provenance`; local generated `dist` in the sibling checkout is not the publishing source of truth.
- Scope: all public GovKit component exports and compound members, relevant subpaths, and static App usage under `apps/app`. App wrappers and alternatives encountered along those paths are evidence, not an exhaustive App-local inventory. Assistant workspace usage is outside the requested App audit. No runtime rendering, deployed-code identity, or remote Claude Design freshness is asserted.

`registry.json` is the inventory, not this report. Source references use repository labels and relative paths; IDs do not encode source directories.

## Consequential findings

### Public-good purpose, domain coupling and adoption cost

The maintainer discussion clarified the original ambition: serve Aragon while helping other governance builders solve difficult UI problems, including a Nouns DAO building its own flows. That is a review objective, not evidence of a validated outside consumer. A governance kit can legitimately include proposals, voting breakdowns and actions; reducing it to generic controls would miss that purpose.

The maintainer reports no major external consumer now or historically. The purpose is to make complex governance concepts easy to use for Aragon and other builders; external adoption is an ambition, not a demonstrated outcome. Avoid speculative generalization for imagined consumers, but do not treat the current App's assumptions as the only valid governance model.

The isolated package has value even without external adoption: it encourages thinking in reusable interfaces and systems, while Storybook supports development and testing apart from the App. Preserve that benefit when weighing boundaries. Review how many governance details, dependencies and configuration choices a consumer must understand to accomplish a task, which complexity the component handles for them, and whether its stories demonstrate use without App-specific setup. Package location alone does not answer those questions.

Any proposed split should preserve an easy default path for common use. Pushing resolution, validation or state handling back onto every caller would undermine the goal if it merely moves complexity out of the package. Judge changes by consumer effort and faithful support for their governance rules, not by fewer dependencies or more configurable props alone.

Review whether a consumer can express its own governance model through each component without adopting or imitating Aragon's OSx/SPP model. Proposal, voting and Actions families need this assessment alongside AddressInput. Distinguish reusable governance concepts from protocol-specific data shapes, lifecycle assumptions, terminology and dependencies. Do not classify every family member as Aragon-specific merely because of its name: layout, presentation and protocol integration may have different boundaries.

Adoption cost also matters. Useful design opinions include consistent appearance, accessible interaction and clear loading/error states. Requiring a particular dependency stack, network policy or application architecture to obtain that experience needs separate justification. Assess whether an outside consumer can supply its own data and services without rebuilding the designed component.

The registry marks these discussion-derived questions with `Review question (maintainer discussion):` in existing intent constraints; they are not verified source claims. The broader domain-coupling assessment remains open. Possible outcomes include keeping a component, improving its interface, separating an optional adapter, explicitly labeling Aragon-specific functionality, or moving it. No outcome is selected here.

### Selection needs contracts, not just names

`Button` can render either a native button or a link, depending on `href`; loading disables interaction. Its props and tests distinguish those behaviors (`kit:src/core/components/button/button.api.ts`, `button.tsx:179-328`, `button.test.tsx`). An intent description must not describe it solely as an action button or recommend it over `Link` without stating that distinction.

Compound namespaces are not interchangeable with renderable members. `Dialog` exports `Root`, `Header`, `Content`, and `Footer`, and the members also have direct exports (`kit:src/core/components/dialogs/dialog/index.ts`). Consumers need both public spellings without counting them as unrelated implementations. No-usage findings must follow these spellings before suggesting anything is unused.

The App's kit import is itself a client-boundary wrapper: `app:tsconfig.json:15-20` maps `@aragon/gov-ui-kit` to `src/shared/lib/@aragon/gov-ui-kit.ts`, which re-exports `@aragon/gov-ui-kit-original`. `tokenSetupMembershipImportToken.tsx` also imports `AlertCard` directly from the original alias. A literal package-name search alone misses part of the production graph; an export-star alone is not evidence that all components are rendered.

### AddressInput: reusable capability, adoption-cost review

The current kit `AddressInput` combines a reusable input surface with web3 resolution and presentation:

- `onChange` is the text channel; `onAccept` reports a resolved/checksummed address and normalized ENS name, or `undefined`. Resolution is debounced. They are not interchangeable form callbacks.
- ENS resolution uses mainnet regardless of the `chainId` used for explorer links. It depends on configured ENS support. The implementation calls query-client and Wagmi context hooks even when a `wagmiConfig` prop is supplied.
- Clipboard controls, checksum feedback, loading state and member-avatar presentation are part of the current implementation.

Evidence: `kit:src/modules/components/addressInput/addressInput.tsx:38-211`, its default story, and tests for callback results, missing mainnet configuration and explorer-chain separation.

The App already owns list/product policy in `app:src/shared/components/forms/addressesInput/addressesInputItem/addressesInputItem.tsx:60-109` and `app:src/shared/utils/addressesListUtils/addressesListUtils.ts`: required fields, duplicate detection, custom validation and React Hook Form integration. This is composition, not evidence of a duplicate single-address widget. `AutocompleteInput` instead composes `InputText` for item selection and has a different callback contract; it is not a drop-in ENS/address replacement.

Address entry is a reusable governance capability. The review concern is whether consumers must adopt its resolution/provider stack to obtain the designed experience. The maintainer also raised a package dependency needed to meet the design; the specific dependency and whether it is necessary remain to be traced, rather than inferred from the known Wagmi/React-Query requirements.

Ask whether a consumer could retain the interaction, appearance, accessibility and loading/error states while supplying its own resolution machinery and network policy. A presentation/resolution split or optional ready-to-use integration is an engineer-review option, not an approved design. Moving the entire component into the App could discard reusable functionality without addressing adoption cost. Keep the present implementation until the requirements and tradeoffs are reviewed; no components were moved or changed here.

### Additional reuse and adoption review candidates

- `GukModulesProvider` bundles Wagmi, React Query and core configuration with overrideable clients/config and default chains. Review whether those defaults simplify adoption while accommodating consumers' existing setup (`kit:src/modules/components/gukModulesProvider/gukModulesProvider.tsx:16-91`).
- `Wallet` and `MemberAvatar` invoke ENS hooks even when supplied identity/avatar data disables the queries. Review the setup required for direct-data display as well as automatic resolution. MemberAvatar also uses a mainnet ENS metadata URL and a browser-only Blockies fallback (`kit:src/modules/components/wallet/wallet.tsx:10-67`; `kit:src/modules/components/member/memberAvatar/memberAvatar.tsx:11-72`).
- `useBlockExplorer` calls `useChains` before choosing explicit or provider chains; it builds URLs using the `ChainEntityType` taxonomy. Review the provider and explorer-format assumptions for a consumer who already has chain data (`kit:src/modules/hooks/useBlockExplorer/useBlockExplorer.ts:5-36`; `useBlockExplorer.api.ts:1-46`).
- `ProposalStatus` and `proposalStatusToTagVariant` expose a lifecycle vocabulary and fixed visual mapping. Review whether another governance model can use those meanings faithfully, especially statuses such as `ADVANCEABLE` and `UNREACHED` (`kit:src/modules/components/proposal/proposalUtils.ts:3-31`). These are noncomponent exports, but still part of the public reuse contract.

Counterexamples matter: `AddressOutput` accepts a caller-supplied label/link without Wagmi or React Query, and `GukCoreProvider` exposes image/link/copy configuration with native defaults (`kit:src/core/components/addressOutput/addressOutput.tsx:9-79`; `kit:src/core/components/gukCoreProvider/gukCoreProvider.tsx:9-50`). Domain terminology or a provider-shaped API alone is not a coupling problem. Ordinary layout/presentation members were not flagged solely because they sit under Proposal or Actions.

### Existing design-sync is the consumer boundary

`.design-sync/config.json` selects the package, overrides previews, maps component source and docs, and adds `.design-sync/app-entry.ts` as a curated App surface. `.design-sync/NOTES.md:69-83` records bundling/provider limits. Preview inclusion is not the App's complete production usage graph.

The notes record a verified `2.10.0` upload, while this App consumes `2.11.4`. The clean rebuild comparison above verifies byte equality for the installed `2.11.4` package's public runtime JS, sourcemap, stylesheet entries, complete declaration tree and shipped CSS/font assets. The earlier declaration delta was stale local generated output retained because the local build has no `dist` cleanup step; it was not evidence of a release or publishing problem, and this comparison does not assert deployed-code identity or the current remote Claude Design project's state.

## Follow-on ownership

- [APP-728](https://linear.app/aragon/issue/APP-728): review consequential selection guidance against maintained contracts, especially input text versus accepted values, provider requirements, compound composition and App-owned policy. Resolve named architectural ownership only with engineer confirmation; do not promote inferred domain labels into team ownership. Existing `.design-sync/conventions.md` and source/props remain the detailed material, not a second inventory.
- [APP-729](https://linear.app/aragon/issue/APP-729): demonstrate a discovery flow from stable ID to intent, public export, props, stories/tests and actual App example. Include an aliased compound member, an App wrapper and a scoped no-use example. Compare old/new Claude Design bundles and record the outcome without assuming improvement.
- [APP-1208](https://linear.app/aragon/issue/APP-1208): include this registry in the existing sync bundle and check its source revisions, consumed kit version and source fingerprints against the bundled code. Determine accepted versus deployed revision identity and resolve installed/source parity before claiming alignment. No bundle integration is implemented here.
- [APP-730](https://linear.app/aragon/issue/APP-730) remains canceled. No separate catalog, server or publishing pipeline was introduced.

## Engineer review required

1. Are the evidence-derived purposes, selection constraints and related-component distinctions correct? Review is per entry; no automated run can supply human approval.
2. Who owns architectural decisions for the cross-cutting kit/web3/App boundary? Package ownership is observable; named team/person ownership is unknown.
3. Can an outside consumer obtain AddressInput's designed experience with its own resolution machinery? Which dependencies support that experience, and which impose avoidable adoption cost? No split or relocation is approved.
4. Does the completed clean-build byte comparison satisfy the source/installed-package verification requirement? Keep that evidence separate from deployed-code identity and design-bundle freshness, which were not checked.
5. Which no-use components need better discovery/examples? No App usage is not a deletion recommendation.
6. Can a concrete non-Aragon proposal/voting/action flow, such as a Nouns flow, use the relevant components without distorting its governance model into OSx/SPP? Record the actual constraints per component; this scenario has not been exercised.
7. Which opinions belong to the reusable governance experience, and which should be optional integrations or explicitly Aragon-specific functionality? Serving Aragon is compatible with the public-good goal; unnecessary coupling is what needs examination.

## Migration recheck

After APP-594 lands, point the kit source root at the integrated package and regenerate. Recheck package `exports`, the source entrypoint and build mapping, App workspace dependency/catalog/lock resolution, the client shim and original alias, and design-sync source/preview paths. Keep existing IDs and curated judgments; refresh source references and review any changed evidence. Do not copy the inventory into a new catalog or silently infer an integrated package location before it exists.

## Update and validation

Run from the App workspace root. The tooling reuses installed TypeScript and Ajv; it does not call an LLM, install packages, rebuild GovKit or run design-sync.

```sh
export GOVKIT_KIT_ROOT=/Users/kd-m2air/Local/gov-ui-kit
export GOVKIT_CONSUMED_ROOT=/Users/kd-m2air/Local/app-next/apps/app/node_modules/@aragon/gov-ui-kit
node .design-sync/component-registry/registry.mjs extract
node .design-sync/component-registry/registry.mjs validate
node .design-sync/component-registry/registry.mjs check
node --test .design-sync/component-registry/registry.test.mjs .design-sync/component-registry/selection-guide.test.mjs
```

`GOVKIT_APP_ROOT` defaults to this workspace's `apps/app`. Point `GOVKIT_KIT_ROOT` at the integrated source package after migration; `GOVKIT_CONSUMED_ROOT` identifies the package actually installed for the App, rather than the source checkout or its local build output.
Registry references labeled `app` resolve relative to `GOVKIT_APP_ROOT`; references labeled `kit` resolve relative to `GOVKIT_KIT_ROOT`. Paths elsewhere in this report are workspace-relative unless labeled.


Edit curated selection fields in `registry.json`, not a second catalog. Extraction refreshes mechanical facts while preserving intent and its original evidence fingerprints. Changed or missing supporting files flag the intent as stale; they do not silently replace its evidence or confer human approval. Review the guidance and update its evidence before clearing a stale flag. Export removals require explicit reconciliation rather than silently discarding old judgments.

### Compact selection guide

`selection-guide.json` is a generated view of this registry, not a second curated catalog. Components, compound namespaces and documented runtime utilities share one `entries` array, distinguished by `kind`. Component contracts use `keyProps`; utility contracts use `methods`. Alternatives describe genuine substitutions, while composition records how pieces work together.

All UI entries are eligible regardless of review state. Source-derived status appears once at file level; per-entry review bookkeeping and detailed audit fingerprints stay in the registry. Discussion-derived questions remain in this report and the audit registry, but are excluded from the guide's factual constraints. Missing supported guidance stays empty rather than being invented.

Update authoritative descriptions, use cases, alternatives, prop/method contracts and composition in registry intent, then regenerate:

```sh
node .design-sync/component-registry/selection-guide.mjs generate
node .design-sync/component-registry/selection-guide.mjs check
node --test .design-sync/component-registry/selection-guide.test.mjs
node .design-sync/component-registry/selection-guide.mjs print govkit:AddressInput govkit:Button govkit:Dialog govkit:formatterUtils
```

The guide is not included in the sync bundle by this change.

## Verified coverage and limits

- Schema `1.1.0`: 418 records covering all 416 source/root declaration exports plus two CSS subpaths. The 143 UI entries are 124 renderable components and 19 compound namespaces; the remaining root exports are seven runtime utilities and 266 other noncomponents. Compound members link to canonical entries, including `ProposalVoting.Progress`. The compact guide includes all 143 UI entries and the seven utilities.
- All 143 UI entries have source-grounded selection guidance and remain `unreviewed`; selected entries also carry explicitly labeled discussion-derived review questions. Maintainer ownership is unknown. Of 124 renderable components, 123 have props references. The remaining `ProposalActionsItemSkeleton` takes no props.
- Static App references were found for 122 UI entries; 21 have none within the recorded scope. Examples include `InputSearch`, `AvatarBase`, and `LinkBase`. This does **not** mean unused at runtime: kit-internal composition, dynamic access, and runtime reachability are outside the scan.
- `AddressInput` has 18 JSX references across 17 App files. The original-package `AlertCard` import and the conditional App `DialogRoot` wrapper resolve to kit declarations. The App's relative `node_modules` stylesheet import is recorded separately.
- All 12,116 source-reference occurrences resolve against 1,121 distinct files with matching hashes and valid lines. Extraction preserves curated intent and its evidence fingerprints. The new utility contracts carry source evidence, including the formatter preset definitions.

The scanner reads TS/JS throughout `<app>/src`, including tests and stories, follows compiler symbols through import aliases and transparent re-exports, and records quoted CSS imports. Bare unused imports are not usage. Markdown/MDX prose, files outside that source root (including design-sync previews), computed property access, and interprocedural render reachability are not analyzed. Actual references here are classified as production or test; fixture coverage also exercises the story category. New JavaScript package subpaths fail extraction until their source mapping is supported rather than being silently omitted.

Validation passed: `extract`, `validate`, `check`, the focused registry regression tests (three passing, zero skipped), and the repository's Biome check for the tooling/schema. Isolated fixtures exercise used and unused import aliases, local shadowing, nested compounds, contexts/enums, stylesheet imports versus comments, preserved intent, changed supporting-source fingerprints, and baseline-bound provenance preservation/invalidation. Negative checks rejected a missing required record field, an unknown field, duplicate IDs, and a `human-reviewed` claim without reviewer/date. Temporary negative-check files were removed.

The compact guide has permanent regression coverage in `selection-guide.test.mjs`: 11 tests covering curated contracts, kind-specific fields, eligibility independent of review state, discussion-question filtering, composition versus alternatives, exact-projection drift detection, and five negative validation cases. Those five cases reject leaked review questions, unknown alternatives, stale fingerprints, missing entries and UI-only fields on a utility. The tests replace the former CLI `self-test` command; temporary output files used by the tests are cleaned up, but the test code remains in the repository. The combined registry/guide suite passed with 14 tests and zero skips; the guide freshness check and Biome check also passed.

The guide includes 150 entries. Ten UI entries currently have curated key-prop contracts; other UI entries retain their existing selection guidance without invented prop contracts. All seven utility entries have method contracts. Source facts, provenance and all 418 entry review states were preserved.

The clean rebuild matches the installed package byte-for-byte for public runtime JS, sourcemap, both stylesheet entries, all 446 declaration files and all 32 shipped CSS/font files. The initial five-file declaration difference was caused by stale generated `dist` contents retained by a non-clean local build, not by source/published divergence. The registry now records `sourceEquivalence: verified` under the existing schema enum. Extraction retains that status only when the previously verified kit commit, dirty paths, source version, entrypoints, consumed version and artifact fingerprints still match, and the current public artifact trees match; supporting changes invalidate it to `unknown`. This audit neither publishes the registry into the design bundle nor demonstrates improved Claude Design output.
