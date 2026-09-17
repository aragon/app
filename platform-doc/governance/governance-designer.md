---
type: capability
title: Governance designer
tags: [governance, onboarding, plugins]
source: aragon-knowledge-base/product/capabilities/governance-designer.md (first-slice brain dump, 2026-07-06); verbal product-owner briefing on governance flows (2026-07-16, see log.md) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner Granular Access Control and LockToVote marketing briefs + release-notes briefings, including token import/wrapping and Lock-to-Vote (inbox/2026-08-03-release-notes-ordered.md), 2026-08-03 + product-owner briefing and app/protocol verification (2026-08-04, app@122f1bd1; see log.md) + product-owner governance availability and permission-management answers (2026-08-05, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md)
---

# Governance designer

The flow for installing governance on an [account](../accounts/account.md). **User promise:** design a governance setup in the app and have it fully installed on the account by the end of the flow or after approved by governance.

The flow is accessed from two entry points: the **settings page**, or the **dashboard of a newly launched account** for an admin, with "+ Governance" button.

The designer is split between a **basic** and an **advanced** view. A plugin can be placed either way: **standalone as its own governance process, or as a body within a stage** of a multistage process. Either way, at process creation the designer asks for a **process key** (e.g. `PIP`) that names the process's proposals — see [proposal identifiers](./proposal-identifiers.md).

## Wizard sequence

Creating a process changes the DAO, so the entry route first identifies the existing [process](./process.md) that will carry the installation proposal. On a newly launched account that is normally Admin; selecting Admin means the eventual apply proposal executes immediately. The designer launches as a [full-screen wizard](../design/full-screen-wizard.md) with four primary steps:

1. **Metadata** — process name, process key, description, and resources.
2. **Governance** — design the process. **Basic** is the default and requires one voting body. **Advanced** composes stages and bodies. Both are self-serve; a complicated advanced configuration may still warrant help from the Aragon team.
3. **Proposal creation** — choose whether members of the process's body or bodies can propose, or whether anyone can. In a basic process the member choice refers to its single body; the advanced composition is detailed on [proposal creation](./proposal-creation.md).
4. **Permissions** — leave the default **Any action** scope, or choose **Specific actions** to constrain what the process may make the DAO execute ([Choosing authorized actions](#choosing-authorized-actions)).

Publishing then moves into the transaction dialogs that prepare the installation and create the proposal that applies it ([Preparing and applying an installation](#preparing-and-applying-an-installation)).

## The basic flow

In the basic view the user must add one [body](./body.md), represented by **a single [plugin](./plugin.md)**. There is no orchestration — the staged proposal processor is not installed. **Add voting body** opens a dialog wizard nested inside the full-screen wizard, the supported [wizard-nesting direction](../design/wizard.md#choosing-the-container). The first dialog step selects one of the three self-service governance types: multisig, token voting, or **lock to vote**. The remaining screens come from that plugin. For an existing token, [choosing a token voting-power mechanism](../guides/choose-token-voting-power-mechanism.md) owns the decision.

These plugins **target the DAO directly**: a proposal created on them passes its actions to the DAO, so each one is a [process](./process.md) of its own. Much of this view is deliberately reused for the advanced flow.

For a **multisig**, the membership screen adds or removes member addresses and requires at least one member. The governance screen then sets the approval threshold — the required approvals in the multisig's X-of-Y rule.

### Configuring token-based governance

For **Token Voting**, the membership screen first chooses between creating a new token and importing an existing one:

- **Create** asks for the token name and symbol, then for the initial recipients and the amount minted to each. At least one recipient is required. The DAO receives the mint permission, so this initial distribution does not make the supply permanently fixed.
- **Import** asks for a token address. The app checks the ERC-20 interface and calls `getVotes`, `getPastVotes`, and `getPastTotalSupply` to test the token's current and historical voting-power interface. A compatible `IVotes` / `ERC20Votes` token is used directly. If the token is ERC-20-compatible but fails that check, token-voting setup deploys a governance wrapper. A holder must wrap before a proposal's creation snapshot for that power to count in the proposal. The developer portal's [Importing Existing Tokens](https://docs.aragon.org/token-voting/1.x/importing-existent-tokens.html) guide explains the compatibility check; protocol-doc owns the [wrapper mechanics](../protocol-doc/plugins/token-voting-plugin/governance-tokens.md).

The next screen sets support threshold, minimum participation, and minimum proposal duration, followed by the early-execution and vote-change switches. Duration is a safety parameter rather than presentation detail: an unrealistically short value can make meaningful participation or intervention impossible. Protocol-doc owns the [Token Voting settings and modes](../protocol-doc/plugins/token-voting-plugin.md), while the designer owns their placement in this setup flow.

Both token-based paths expose the support threshold and minimum participation. The application does not expose or offer the **approval threshold**, the protocol's third pass criterion and an absolute floor on approving voting power; it installs that value as zero ([upstream criteria](../protocol-doc/plugins/majority-voting.md)). That is a current product choice, not a protocol limit.

For **Lock to Vote**, the dialog asks for the ERC-20 token address, then configures support threshold and minimum participation. A standalone process also configures proposal duration; a Lock-to-Vote body in a stage uses the stage's voting period. The **Vote change** switch maps the setup to Vote Replacement instead of the default Standard mode; the upstream [voting model](../protocol-doc/plugins/lock-to-vote-plugin.md#the-voting-model-and-how-it-differs) and [unlock regimes](../protocol-doc/plugins/lock-to-vote-plugin.md#getting-your-tokens-back-two-unlock-regimes) own the resulting behavior. These settings flow into the same [prepare-and-apply publication sequence](#preparing-and-applying-an-installation) as the other plugins.

## The advanced flow

The advanced flow is the **orchestrated** flow — one way to think of it: a UI for configuring the [staged proposal processor](../protocol-doc/plugins/spp-plugin.md). Governance Designer makes granular permission management self-serve. Complicated configurations can still warrant contacting the Aragon team, especially where existing conditions and sub-plugin interactions with the staged proposal processor need context the flow cannot honestly flatten. In those cases, the app follows the [reach-out-to-the-team pattern](../design/reach-out-to-the-team.md).

The model:

- A governance process using the staged proposal processor has **one or more [stages](./stage.md)**.
- Every stage has **zero or more [bodies](./body.md)**.
- Any account can have **zero or more governance processes**.

Bodies are configured exactly the way a standalone plugin in a basic process is — except each body plugin's approved action **reports its result to the staged proposal processor** rather than executing on the DAO ([target](./target.md)). An advanced-flow body also receives its own metadata (name, description, and resources) because it has an identity distinct from the parent process; the basic process reuses its single plugin's process metadata. After the prerequisite governance-type choice, that metadata precedes the body's role, membership, and governance configuration.

That reuse is the main point: one type of plugin serves in different contexts to orchestrate governance, without building new contracts and getting them audited — a shared framework that lets the platform generalize at the semantic layer and isolate the bespoke parts ([principles](../principles.md)). An already-installed plugin instance can also serve as a body in more than one process, but its governance settings are then shared across those processes; [reusing a plugin body](./body.md#reusing-a-plugin-body) carries the trade-offs.

### Adding a body

The processor also accepts a body that is not a plugin — a [Safe](../accounts/safe.md) can be a stage's governing body ([Safe as a body](./safe-as-a-body.md)). Adding a stage's body — plugin or otherwise — goes through the same **add body** flow, which includes an **any address** option: any address, unvalidated, can be registered as a body (an EOA works). When the address is a Safe ([recognition is a name heuristic, and fallible](../accounts/connecting-a-safe.md#how-the-product-recognizes-a-safe)), the designer deploys a `SafeOwnerCondition` behind the scenes and offers it as the *only* condition available for that body's proposal-creation toggle — other eligibility on the process is composed as usual ([proposal creation](./proposal-creation.md)).

What a user configures per stage (duration, expiration, approval-only early advance, each body's approval or veto role, and the two body thresholds) is the [stage](./stage.md) page; how the resulting proposal traverses the stages is [staged proposals](./staged-proposals.md). A configuration value that could never satisfy its own threshold is refused as invalid input, rather than treated as a restriction on an account action (see [invariant validation](../design/invariant-validation.md)).

## Choosing authorized actions

The **Permissions** step defines which actions the new process may make the account execute:

- **Any action** gives the process unrestricted execution. The empty-state copy calls this **Unrestricted execution**.
- **Specific actions** scopes execution to an allowlist. The owner's source calls this choice **Selected actions**; the current app labels the choice **Specific actions** and describes it as "Selected actions can be added to proposals."

For a specific scope, the action composer provides standard actions the app can compose, including updating DAO metadata; available plugin actions depend on their support and the permissions the app can recognize as granted. A user can also add a verified target contract and select one of its write functions. The app derives the target address and 4-byte function selector from that choice; it does not currently expose the brief's raw selector-entry field. A process can include multiple authorized actions, with duplicate target-selector pairs rejected.

Specific-actions mode may also be published with no actions selected. When the installation is applied, its permission changes replace the plugin setup's default unrestricted execute grant with a grant conditioned by an execute selector condition populated with the chosen target/function selectors. With an empty allowlist, the process cannot execute an account action until a later governed change adds an allowed selector. [Scoped authority](../access-control/scoped-authority.md) owns the meaning of that state; the [execute selector condition](../protocol-doc/helpers/condition-library/execute-selector-condition.md) owns the mechanism.

This step is the fully self-serve route for granular permission management when setting a new process's scope. Permission changes outside this flow remain ordinary smart-contract [actions](./action.md) that an authorized account can compose through the [action builder](./action-builder.md); the designer's supported forms do not define the full set of grants or revocations the account can execute.

## Preparing and applying an installation

Clicking **Publish** deliberately begins two transaction submissions. First, the designer uses the plugin setup processor to **prepare** the installation: one transaction deploys or configures the requested plugins and permission condition, and computes the permission changes and helpers the installation will require. Preparation is permissionless and does not itself change the DAO's permissions ([why prepare and apply are separate](../protocol-doc/framework/plugin-setup-processor.md#why-prepare-and-apply-are-separate)).

The second submission creates the proposal that **applies** that prepared installation to the live DAO, including its permission changes. Because applying changes the DAO's permission state, an already-authorized governance process must make the DAO execute it ([installing onto a live DAO](../protocol-doc/framework/plugin-setup-processor.md#installing-onto-a-live-dao)). The proposal's later passage and execution perform the installation; the wallet submission alone does not grant permissions on an established account. An admin proposal passes and executes automatically during bootstrap, but it remains a proposal — admin is the immediate route through the authorization model, not an exception to it. On an established DAO, another process can carry the installation proposal if its permissions admit the installation actions.

Both transactions move through the shared [transaction submission stepper](../design/transaction-submission.md).

## Editing across the lifecycle

The designer serves the whole governance lifecycle, and every edit is itself a **proposal**, because the DAO holds the permission to do the work:

- **Creating a process** follows the [prepare-and-apply installation flow](#preparing-and-applying-an-installation).
- A **basic process** — a single plugin that is both the process and its own body — *can* be edited: one proposal edits its governance settings, everything on the plugin, in one sweep.
- **Bodies in general can be edited** the same way, including a body inside a staged process — e.g. changing a token voting body's quorum or support threshold — without touching the advanced process's own configuration (its stages, which bodies belong to which stage).
- **Advanced processes themselves cannot be edited in the app.** The contracts support it, but the UI does not — it is complex, and Aragon supports those customers hands-on; anyone who needs it should reach out to the Aragon team.

So it is specifically advanced processes that cannot be adjusted this way; bodies, and basic single-plugin processes, can. This is the shape of [evolving governance](../value-proposition.md). Removing a process is a distinct operation from editing one: **any plugin the app knows about can be uninstalled from the UI**. The process's own page first prepares the uninstallation, then applies it through a proposal to the DAO. This includes the last known process; that one dangerous edge warns but never blocks ([removing the last process](../accounts/last-process-removal.md)).

## Worked example: installing a multisig

1. Configure the plugin in its [plugin slot](../design/plugin-slots.md) — for a [multisig](../protocol-doc/plugins/multisig-plugin.md), the members and the approval threshold.
2. In the [Permissions step](#choosing-authorized-actions), choose unrestricted **Any action** or an allowlist of **Specific actions**. The latter attaches an [execute selector condition](../protocol-doc/helpers/condition-library/execute-selector-condition.md) to the plugin's Execute grant on the DAO — see [scoped authority](../access-control/scoped-authority.md) for why a bare Execute grant requires an execute-aware condition to enforce that scope. A process's full permission set, however it was granted, is visible on its [process details page](./process.md).
3. Specify who can create proposals ([proposal creation](./proposal-creation.md)).
4. [Prepare the installation, then apply it through a proposal](#preparing-and-applying-an-installation); in this onboarding case the apply step is an admin proposal ([why that works in-session](../accounts/admin-plugin-by-default.md)).
5. The installed multisig appears in the [proposals](./proposal.md) list as its own process tab (in this basic flow it targets the DAO directly, so it is a [process](./process.md)).
