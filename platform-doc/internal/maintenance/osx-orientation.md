---
type: reference
title: OSx orientation design
tags: [maintenance, cross-cutting, governance, access-control]
source: design-platform-osx-orientation analysis (2026-09-10, see log.md) + protocol-doc@800da8d9 + @aragon/app@1.39.0 (adad6787) action-composer verification + app-backend@107103b4 indexer sources + aragon/osx and plugin repository audit sections and aragon.org metrics (retrieved 2026-09-10)
---

# OSx orientation design

Design artifact for the completed `design-platform-osx-orientation` task: one platform entry page explaining the application's relationship with Aragon OSx and routing readers into the protocol documentation. It records the owner decisions the page must honor, the verification evidence behind its consequential wording, the chosen home, type, outline and navigation, and the bounded edits to existing pages. The [coverage map](./osx-orientation/coverage-map.md) gives each representative question its platform-only answer boundary and precise next link. The authoring and contextual edits are complete; their close-outs are recorded in the log. This artifact preserves the decisions and evidence used by those passes.

## Owner decisions carried into authoring

| Decision | Ruling (2026-09-10) | Consequence for the page |
| --- | --- | --- |
| Audience and purpose | Ordinary signers and voters, proposal authors changing settings, and advanced permission managers. The page is an informative sign outside a door: a sufficient short answer, or a clear reason to read the protocol documentation, which is outside platform documentation. | Short question-led sections; no attempt to teach every nuance; every section ends with the upstream destination and the reason to follow it. |
| OSx and the application | OSx is a highly flexible operating system for DAOs. The app abstracts and simplifies common work and guides supported flows; the protocol permits broader configurations. Users can misconfigure a DAO or its governance; app guidance and audited contracts do not establish that a configuration is sound. | A dedicated configuration-honesty section; practical setup cautions stay on Account creation and Governance designer and link to the page and then upstream. |
| Signing and indexed data | DAO and governance interactions target OSx contracts. Readers are not required to interpret wallet function displays. App data is based on indexed events, primarily from OSx contracts, with token and ENS sources where useful. Event inventories, indexer internals and synchronization detail are out of scope. | Two sections at the stated depth; no event catalogue; wallet rendering stays with `supply-wallet-batch-confirmation-evidence`. |
| Permissions and conditions | High-level introduction only, plus when deeper understanding becomes necessary. `grant`/`revoke` examples and composition context belong in Action builder; the exclusion explanation belongs in Basic action views. Rationale: deliberate restraint, so authors understand consequences and research OSx first; the operations remain possible through the generic action surface, subject to authorization. | The page's permissions section introduces the model and points to Action builder for the grant/revoke route; no grant/revoke tutorial on the page. |
| Security framing | A short statement that the contracts are audited by several firms, currently govern billions in assets, and carry audit links in their repositories. Link to audit material without itemizing firms or reports; keep audit coverage distinct from safe configuration. | One short section with the verified wording and destinations below; the configuration section states the distinction. |
| AI source access | Protocol documentation is neither in the assistant's corpus nor available on demand; the corpus is platform documentation only. | Each section must be understandable when retrieved alone and must carry enough context for a short answer plus a precise link the assistant can name but not read. |
| Compact topic navigation | Explore a question-led index on the page, a few sentences per topic followed by the protocol link and the reason to read further; a proposed presentation, not a requirement for a separate page. | Adopted as the page's section pattern rather than as a trailing catalogue; see [Compact index decision](#compact-index-decision). |

**Authorized summary boundary.** The owner explicitly authorizes the author to study protocol-doc closely and summarize or reuse suitable source passages for this orientation. Brief, source-grounded explanations of OSx topics are therefore permitted on this one page despite the general rule in [WORKFLOW.md](../../WORKFLOW.md#what-this-base-is-and-is-not) against restating mechanisms. Detailed definitions, parameters, function signatures and protocol procedures remain upstream. The authoring task carries this ruling; it is not an open owner question and it does not license duplicating the protocol reference elsewhere.

## Verification evidence

### Default action list and Basic views: no `grant` or `revoke`

Checked at the documented-through release `@aragon/app@1.39.0` ([`adad6787`](https://github.com/aragon/app/commit/adad67873c8f9dd75e3ed340b70df3e985ae3557)).

- The default **+ Action** list is assembled from three sources and nothing else: items each installed plugin contributes through its `GOVERNANCE_PLUGIN_ACTIONS` slot, items the action-view registry maps to permission IDs found in the account's indexed grants, and the app's native items ([composition](https://github.com/aragon/app/blob/adad67873c8f9dd75e3ed340b70df3e985ae3557/apps/app/src/modules/governance/components/actionComposer/actionComposerUtils.ts#L49), [permission-derived items](https://github.com/aragon/app/blob/adad67873c8f9dd75e3ed340b70df3e985ae3557/apps/app/src/modules/governance/components/actionComposer/actionComposerUtils.ts#L190)). The registry's permission registrations are the Capital Distributor, Gauge Voter and Gauge Registrar families; the native DAO-group item is the metadata update gated by `SET_METADATA_PERMISSION` ([native item](https://github.com/aragon/app/blob/adad67873c8f9dd75e3ed340b70df3e985ae3557/apps/app/src/modules/governance/components/actionComposer/actionComposerUtils.ts#L427)).
- The only `grant`, `revoke` and `grantWithCondition` encoders in the app are internal transaction builders used by the governance designer's install, update and uninstall bundles and by the execute-condition swap ([`grant`](https://github.com/aragon/app/blob/adad67873c8f9dd75e3ed340b70df3e985ae3557/apps/app/src/shared/utils/permissionTransactionUtils/permissionTransactionUtils.tsx#L41), [`revoke`](https://github.com/aragon/app/blob/adad67873c8f9dd75e3ed340b70df3e985ae3557/apps/app/src/shared/utils/permissionTransactionUtils/permissionTransactionUtils.tsx#L54), [`grantWithCondition`](https://github.com/aragon/app/blob/adad67873c8f9dd75e3ed340b70df3e985ae3557/apps/app/src/shared/utils/permissionTransactionUtils/permissionTransactionUtils.tsx#L67), [ABI](https://github.com/aragon/app/blob/adad67873c8f9dd75e3ed340b70df3e985ae3557/apps/app/src/shared/utils/permissionTransactionUtils/abi/permissionManagerAbi.ts)). No action-view descriptor, plugin slot or locale string offers them as a selectable item, and the [Basic action view audit](./basic-action-views.md)'s 22 identities contain no permission operation. This is implementation evidence for the absence; the *reason* is the owner's restraint ruling above, and prose must keep the two distinct.
- The generic route exists: **Add contract address** opens the verification dialog, which resolves a proxy's implementation, checks explorer verification and fetches the ABI ([dialog](https://github.com/aragon/app/blob/adad67873c8f9dd75e3ed340b70df3e985ae3557/apps/app/src/modules/governance/dialogs/verifySmartContractDialog/verifySmartContractDialog.tsx)); a verified DAO ABI contributes its write functions, including `grant`, `revoke` and `grantWithCondition`, as Decoded forms. Upload and WalletConnect can also carry such a call as Decoded or Raw. Whether the call executes is decided by the DAO's permission table at execution: these functions are gated by `ROOT_PERMISSION_ID`, normally held by the DAO itself, so the batch must run through a route that lets the DAO call itself ([ROOT administers the table](../../access-control/osx-authorization-paths.md#root-administers-the-dao-permission-table)).

### Indexed data sources

Checked at `app-backend@107103b4` ([commit](https://github.com/aragon/app-backend/commit/107103b4cc9d8f778c78e09c7265f9a4ead89d6e)), the checkout the existing platform pages cite; it establishes the source pattern, not the production event list at the app tag.

- The indexer configuration subscribes to OSx framework and core events (DAO registration, plugin-repo registration, installation, update and uninstallation preparation and application, `Granted`, `Revoked`, `Executed`, `MetadataSet`, native deposits), governance-plugin events (proposal lifecycle, votes, membership and settings updates, stage updates, execute-selector allow and disallow), and events from the associated token, escrow, gauge and distribution contracts ([configuration](https://github.com/aragon/app-backend/blob/107103b4cc9d8f778c78e09c7265f9a4ead89d6e/src/services/aragon-indexer/configIndexer.ts)).
- Governance-token `Transfer` events are polled alongside native deposits ([polling crawler](https://github.com/aragon/app-backend/blob/107103b4cc9d8f778c78e09c7265f9a4ead89d6e/src/modules/poolingCrawler.ts)); treasury balances are read through the network's configured provider and priced from CoinGecko, as [Assets](../../treasury/assets.md) already states; ENS records are read through ENS contracts and resolvers ([helper](https://github.com/aragon/app-backend/blob/107103b4cc9d8f778c78e09c7265f9a4ead89d6e/src/helpers/ens.ts)), consistent with [ENS as the profile layer](../../application/aragon-profiles.md#ens-as-the-profile-layer).
- The platform consequences the page may state are already documented: the index lags the chain and the submission dialog waits for it ([transaction submission](../../application/submitting-a-transaction.md)); Permission Viewer shows indexed configuration rather than a block-specific verdict ([interpretation boundary](../../access-control/permission-viewer.md#interpretation-boundary)); the app serves the chain ([principles](../design/principles.md)).

### Audit statement

Retrieved 2026-09-10 from each repository's `main` branch README.

| Contracts | Audit material | Location |
| --- | --- | --- |
| OSx core and framework (`aragon/osx`) | Halborn (v1.0.0, 2023; v1.3.0, 2023; v1.4.0, 2024–2025), Code4rena (v1.3.0, 2023), Verity Labs formal verification of `dao.execute` (v1.4.0, July 2026). The `audits/` folder also holds a Halborn v1.4 report dated 2026-06-01. | [README Audits section](https://github.com/aragon/osx#audits); [audits folder](https://github.com/aragon/osx/tree/main/audits) |
| Token Voting | Halborn v1.4 (2025); earlier versions through the OSx v1.4 report | [README](https://github.com/aragon/token-voting-plugin#audit) |
| Multisig, Admin | OSx v1.4 Halborn report | [Multisig README](https://github.com/aragon/multisig-plugin#audit), [Admin README](https://github.com/aragon/admin-plugin#audit) |
| Staged Proposal Processor | Halborn reports in the OSx audits folder (2025-01-03 and 2026-06-01) | [README](https://github.com/aragon/staged-proposal-processor-plugin#audit) |
| Lock to Vote | Spearbit (Cantina), July–August 2025 | [README](https://github.com/aragon/lock-to-vote-plugin#audit) |
| Condition library | Halborn, July 2025 (library) and September 2025 (Safe owner condition) | [README](https://github.com/aragon/conditions#audit) |

Supported wording: the OSx contracts and the governance plugins the app installs have been audited by several firms across releases, and each contract repository links its audit reports from its README. The page links the OSx audits folder and states that each repository's README carries an Audit section; it names no firm or report. The protocol's own phrasing sits in [Why OSx](../../protocol-doc/guides/why-osx.md#change-always-controlled), the precise upstream destination. Audit coverage says nothing about whether a chosen configuration is sound; the page states that distinction beside the audit sentence. Bespoke deployments (veLocker, Capital Distributor, cross-chain) are outside this statement.

### Asset-scale statement

[aragon.org](https://www.aragon.org/) (retrieved 2026-09-10) shows **$35B** under "Assets governed" and **10K** under "Projects launched", and describes the stack as "Audited, battle-tested, and trusted with $35B+". The figure is Aragon's self-reported headline metric with no date or methodology on the page. Disposition: the page may say the contracts govern billions of dollars in assets, attributing the current figure to Aragon and citing the retrieval date in `source:`; it must not present the exact number as documentation truth or imply that the documentation keeps it current. The owner may substitute a preferred figure or source at review; no owner decision is required to publish the bounded wording.

## Page plan

| Attribute | Decision | Rationale |
| --- | --- | --- |
| Home | `/osx-and-the-platform.md` at the repository root | Cross-cutting orientation that belongs to no single area, beside the other general-purpose root pages ([WORKFLOW.md](../../WORKFLOW.md#structure)). |
| Type | `concept` | It explains an idea and its consequences; it is not lookup material, a user walkthrough or a product rule. |
| Title | Aragon OSx and the platform | Expands `OSx` on first sight for readers who do not know the protocol ([voice terminology](../../voice.md#6-terminology)). |
| Tags | `cross-cutting`, `permissions`, `security`, `indexing` | Existing vocabulary only. |
| Status and source | `status: draft`; `source:` names the owner commission and answers (2026-09-10, see log.md), the protocol-doc pin, the app tag and the retrieved audit and metric sources. | Draft until the owner reviews; provenance lets each claim be rechecked. |
| Length | About 900–1,300 words | A sign outside a door: readable in one sitting and retrievable per section. |

### Outline

Each section answers one question in two to five sentences of platform-level explanation, then closes with the upstream destination and the reason to read it. The [coverage map](./osx-orientation/coverage-map.md) supplies the answer boundary, the passages that may be summarized and the exact links.

1. **Lead.** Definition first: Aragon OSx is the protocol the Aragon platform runs on, a framework for building DAOs as smart contracts: a lean core (one `DAO` contract that holds assets, executes actions and owns its permission table) extended by plugins under one permission system. The platform is the application over it: it abstracts and simplifies common work, guides supported flows, and never restricts what the account can do. Where the protocol documentation begins ([protocol front door](../../protocol-doc/index.md), [Why OSx](../../protocol-doc/guides/why-osx.md)) and why a reader would go there.
2. **What OSx is, and what the platform adds.** The three protocol ideas in product vocabulary: the DAO contract is the [account](../../accounts/account.md); plugins are the capabilities the app interprets as [processes](../../governance/process.md) and [bodies](../../governance/body.md); the permission system is the one authorization layer the app reads and configures. What the app adds: product semantics, guided creation and governance design, readable actions, indexed views. What it does not add: restrictions on the account ([principles](../design/principles.md)).
3. **Where the app's information comes from.** Indexed events, primarily from OSx contracts, with token and ENS sources where useful; the backend's derived view; the index can lag the chain; the presentation is a reading of onchain state and the drill-down reaches the authoritative fact.
4. **What a signature commits you to.** DAO and governance interactions target OSx contracts: the account's `DAO` contract, its plugins, the plugin setup processor and the factory. One transaction can carry a whole action batch; the app's Basic, Decoded and Raw views are the readable route before signing, and what the wallet itself renders belongs to the wallet. Signing is not execution: a proposal's actions run only when the proposal passes and someone executes it; a direct transaction runs immediately. Not every signature targets OSx: profile, name and token transactions target other contracts.
5. **Changing governance settings.** Settings live in the installed plugin and change through actions the account executes: usually inside a proposal on a process authorized to make that change, or through a direct transaction when the connected actor holds execute permission. The designer installs new processes; the Basic action views carry the settings forms. When the protocol page is needed: parameter meaning, the three thresholds, voting modes, and the rule that existing proposals keep their recorded settings.
6. **Permissions and conditions.** A permission is who may do what, where, recorded on the account's own contract; a condition makes a grant depend on a rule evaluated at call time; ROOT is the permission to change permissions, and a healthy account holds it itself. Where the app shows them: Permission Viewer, the process details page, the designer's Permissions step. When deeper understanding becomes necessary: composing a grant, revoke or conditional grant, changing an allowlist, uninstalling the last process, or acting on a Permission Viewer row. Pointer to Action builder for why permission operations are not default Basic actions.
7. **Why an action can be visible without being executable.** Discovering a function through a verified ABI, or seeing a Basic form, is a reading of the contract's interface; whether the call succeeds is decided by the account's permission table and the target's own guards at execution. Scoped grants, the allowed-actions filter and simulation are aids; none of them is authorization.
8. **Configurations the app will not stop you from choosing.** The protocol permits configurations the app does not offer or judge; app validation refuses only settings that can never hold. Audited contracts and guided flows do not make a configuration sound. Examples with their upstream cautions: ROOT left with an externally owned account, an unrealistic duration, an allowlist that denies everything, a condition rotated in two transactions, removing the only unrestricted process. Setup cautions live on Account creation and Governance designer.
9. **Security and audits.** The verified statement, the audits-folder link and the README pattern, then the distinction from safe configuration.

### Compact index decision

| Option | Assessment | Decision |
| --- | --- | --- |
| Question-led sections that each end with the protocol link and its reason | One passage per question serves a human scanning headings and the retrieval of a single section; there is no second list to keep in step. | **Adopted.** The section headings are the index; each closes with a sentence naming the destination and the reason to read it. |
| A trailing catalogue of protocol pages | Repeats the section links and drifts toward the exhaustive catalogue the owner declined. | Rejected. |
| A separate topic-index page | Splits the sign from the door and doubles the maintenance surface. | Rejected; the owner did not require one. |

### Inbound navigation

- Root [index](../../index.md): link the page from the introduction's OSx sentence and from *Understand or change the platform* before the reading order; keep the protocol front-door link beside it; add it to the general-reference line.
- [Access control](../../access-control/index.md) and [Governance](../../governance/index.md) indexes: link the page in the sentence that already sends readers to protocol mechanics, so the orientation precedes the deep pages.
- The [Accounts](../../accounts/index.md) index may link it from the account-versus-DAO sentence; optional.

## Contextual edits

Bounded edits to existing pages, each a sentence or short paragraph, each linking to the entry page's relevant section and then upstream. A page that already carries `status: draft` keeps it; Governance designer, currently reviewed, returns to draft because the added paragraph changes its content.

| Page | Edit | Links |
| --- | --- | --- |
| [Action builder](../../application/action-builder.md) | In *Adding one action* and the permission-management paragraph: `grant`, `revoke` and `grantWithCondition` are deliberately absent from the default list and have no Basic form, because authors should understand their consequences and research OSx before composing them; they remain composable through **Add contract address** (verified DAO ABI, Decoded form), upload or WalletConnect; they execute only through a route the account's permission table admits, normally a process that can make the account call itself. | Entry page *Permissions and conditions*; [ROOT administers the table](../../access-control/osx-authorization-paths.md#root-administers-the-dao-permission-table); [Manage permissions through governance](../../protocol-doc/guides/manage-permissions.md); [granting and revoking](../../protocol-doc/core/permissions.md#granting-and-revoking). |
| [Basic action views](../../application/basic-action-views.md) | In *Preparing and reviewing*: permission grants, revocations and conditional grants have no Basic form or details view; they appear as Decoded when the ABI resolves, otherwise Raw; one clause of rationale and the Action builder link. Keep the default-list and Basic-view distinction explicit. | Action builder paragraph above; entry page *Permissions and conditions*. |
| [Account creation](../../accounts/account-creation.md) | After the admin-plugin sentence: the new account is an OSx DAO whose factory bootstrap leaves ROOT with the account and whose admin can execute immediately; the guided flow and the audited contracts do not make later governance choices sound. Retain the Sepolia recommendation and the admin-flow link. | Entry page *Configurations the app will not stop you from choosing*; [bootstrapping ROOT](../../protocol-doc/core/dao.md#deployment-and-bootstrapping-root); [Admin flow](../../governance/admin-flow.md). |
| [Governance designer](../../governance/governance-designer.md) | One short paragraph after *Choosing authorized actions*: validation refuses only values that can never hold; it does not judge whether thresholds, durations, allowlists or body composition fit the organization. Link the page's existing cautions (duration, unrestricted execution, empty allowlist, admin proposals executing immediately, last-process removal) rather than restating them. | Entry page *Configurations*; [majority voting](../../protocol-doc/plugins/majority-voting.md); [Token Voting § Keep in mind](../../protocol-doc/plugins/token-voting-plugin.md#keep-in-mind); [permissions § Keep in mind](../../protocol-doc/core/permissions.md#keep-in-mind); [Refuse unsatisfiable configuration](../design/invariant-validation.md). |
| Root, access-control and governance indexes | The inbound navigation above. | — |
| [Permission Viewer](../../access-control/permission-viewer.md), [OSx authorization paths](../../access-control/osx-authorization-paths.md) | Optional: one orientation link to the entry page in the opening paragraph. | Entry page lead. |

## Distinctions the prose must keep

- Signing versus execution: a signature submits a transaction; a proposal's actions execute later, when the proposal passes and is executed; a direct transaction executes at once.
- ABI discovery versus authorization: a verified ABI shows what a contract can do; the permission table and downstream guards decide whether this caller may do it now.
- Proposal approval versus permission: a passed proposal still executes only through its process's Execute grant and that grant's condition.
- Indexed presentation versus onchain state: the app shows an indexed reading that can lag; the chain is authoritative.
- Not every signature targets OSx, and not every settings change needs the proposal route: direct execution exists for actors holding execute permission.

## Coordination

- The completed [purpose audit](./page-purpose-and-topology.md) and [section audit](./section-fit-and-location.md) retain the root orientation and its bounded protocol handoffs.
- The future guide-layer review retains protocol orientation here and on the root index, outside the guide portfolio.
- Wallet-confirmation, direct/linked execution, recovery, and authoring-label work is complete; the close-outs are in [the log](./log.md). [Create transaction](../../treasury/create-transaction.md), [linked-account execution](../../accounts/executing-on-a-linked-account.md), and [recovery evidence](./recovery-without-execute.md) carry the resulting behavior and limits.
- Current owner review is ordered on the [backlog](./backlog.md#ready-for-your-input). This reference contains no outstanding coordination ask.

## Evidence limits

None blocks authoring. The exact asset figure remains an attributed, dated citation rather than documentation truth, and the backend event pattern is verified at an older checkout than the app tag, so the page names sources rather than an event list.
