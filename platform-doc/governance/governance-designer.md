---
type: capability
title: Governance designer
tags: [governance, onboarding, plugins]
status: draft
source: aragon-knowledge-base/product/capabilities/governance-designer.md (first-slice brain dump, 2026-07-06); verbal product-owner briefing on governance flows (2026-07-16, see log.md) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner Granular Access Control and LockToVote marketing briefs + release-notes briefings, including token import/wrapping and Lock-to-Vote (inbox/2026-08-03-release-notes-ordered.md), 2026-08-03 + product-owner briefing and app/protocol verification (2026-08-04, app@122f1bd1; see log.md) + product-owner governance availability and permission-management answers (2026-08-05, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + basic-action-view audit (2026-09-10, app@f8bf9e87 + installed @aragon/gov-ui-kit@2.11.2; see log.md) + @aragon/app@1.39.0 tagged-source reconciliation (2026-09-10, see log.md) + product-owner briefings (2026-09-11, see log.md) + Gauge refusal comparison (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557 + published gov-ui-kit@2.11.4; see log.md) + OSx orientation contextual edits (2026-09-13, see log.md) + removal-alert verification (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557; see log.md) + product-owner editorial feedback (2026-09-13, see log.md) + live application-page coverage at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) + product-owner briefings (2026-09-15, see log.md)
---

# Governance designer

The governance designer lets people configure governance in the app and install it on an [account](../accounts/account.md). Installation completes by the end of the flow when Admin applies it immediately, or after the selected governance process approves and executes the installation proposal.

The flow is accessed from **Process** in [Settings](../accounts/settings.md#governance), or the governance-setup action on the [dashboard of a newly launched account](./admin-flow.md#onboarding-dashboard) for an admin.

The designer offers self-service **Basic** setup and **Advanced** governance **On request** through the Aragon team. Basic setup installs a plugin as its own governance process. Aragon can configure an advanced process with bodies arranged in stages. Each process has a **process key** (e.g. `PIP`) that names its proposals — see [proposal identifiers](./proposal-identifiers.md).

## Wizard sequence

Creating a process changes the account, so [execution routing](../application/execution-routing.md) first identifies the existing process that will decide the installation proposal. On a newly launched account that is normally Admin; selecting Admin means the eventual apply proposal executes immediately. The designer launches as a [full-screen wizard](../application/wizard.md#full-screen-wizard) with four primary steps:

1. **Metadata** — process name, process key, description, and resources.
2. **Governance** — **Basic** is the default and requires one voting body. Choosing **Advanced** shows **On request** and hands setup to the Aragon team; users cannot continue into a self-service stage builder.
3. **Proposal creation** — choose whether [members](./member.md#membership-and-participation) of the process's body or bodies can propose, or whether anyone can. In a basic process the member choice refers to its single body; the advanced composition is detailed on [proposal creation](./proposal-creation.md).
4. **Permissions** — leave the default **Any action** scope, or choose **Specific actions** to constrain what the process may make the DAO execute ([Choosing authorized actions](#choosing-authorized-actions)).

In Basic setup's Proposal creation step, restricted creation requires an enabled body that can supply a creation condition; choosing anyone satisfies that check directly. This checks that a creation route is configured. It does not establish that a current holder meets the selected voting-power requirement. Check the intended proposers against the requirement before publishing.

Publishing then moves into the transaction dialogs that prepare the installation and create the proposal that applies it ([Preparing and applying an installation](#preparing-and-applying-an-installation)).

## The basic flow

In the basic view the user must add one [body](./body.md), represented by **a single [plugin](./plugin.md)**. There is no orchestration — the staged proposal processor is not installed. **Add voting body** opens a dialog wizard nested inside the full-screen wizard; a body returns to the designer only once its plugin's fields are satisfied. The first dialog step selects one of the three self-service governance types: multisig, token voting, or **lock to vote**. The remaining screens come from that plugin. Use [Choose a token voting-power mechanism](../guides/choose-token-voting-power-mechanism.md) to decide how to govern with an existing token or create a new one.

The picker offers types with setup support and a deployed repository on the selected network. Lock to Vote is available to every connected address on those networks; voting requires locking the chosen ERC-20 tokens.

These plugins **target the DAO directly**: a proposal created on them passes its actions to the DAO, so each one is a [process](./process.md) of its own.

For a **multisig**, the membership screen adds or removes member addresses and requires at least one member. The governance screen then sets the approval threshold — the required approvals in the multisig's X-of-Y rule. The threshold is bounded by the member count: a threshold no roster could meet is refused, while a threshold a minority of members can meet is allowed and marked as a minority configuration.

### Configuring token-based governance

For **Token Voting**, the membership screen first chooses between creating a new token and importing an existing one:

- **Create** asks for the token name and symbol, then for the initial recipients and the amount minted to each. At least one recipient is required. The DAO receives the mint permission, so this initial distribution does not make the supply permanently fixed.
- **Import** asks for a token address. The app checks the ERC-20 interface and calls `getVotes`, `getPastVotes`, and `getPastTotalSupply` to test the token's current and historical voting-power interface. A compatible `IVotes` / `ERC20Votes` token is used directly. If the token is ERC-20-compatible but fails that check, token-voting setup deploys a governance wrapper. A holder must wrap before a proposal's creation snapshot for that power to count in the proposal. The developer portal's [Importing Existing Tokens](https://docs.aragon.org/token-voting/1.x/importing-existent-tokens.html) guide explains the compatibility check; see the protocol reference for [wrapper mechanics](../protocol-doc/plugins/token-voting-plugin/governance-tokens.md).

The next screen sets support threshold, minimum participation, and minimum proposal duration, followed by the early-execution and vote-change switches. The support control runs from 1% to 99%; minimum participation runs from 0% to 100%. The protocol compares support strictly and participation loosely, so a support threshold of exactly 100% could never be met while full participation can ([comparison rule](../protocol-doc/plugins/majority-voting.md)). A support threshold below half remains available with a minority-configuration warning. Early execution and vote change are mutually exclusive choices. For the underlying settings and modes, see [Token Voting](../protocol-doc/plugins/token-voting-plugin.md).

Standalone Token Voting and Lock-to-Vote forms require a minimum proposal duration of at least one hour, but do not enforce the protocol's 365-day upper limit. Keep the configured duration within that limit and allow enough time for participation or intervention. Passing the form's checks does not establish that every protocol constraint is satisfied.

Both token-based paths expose the support threshold and minimum participation. The application does not expose or offer the **approval threshold**, the protocol's third pass criterion and an absolute floor on approving voting power; it installs that value as zero ([upstream criteria](../protocol-doc/plugins/majority-voting.md)). That is a current product choice, not a protocol limit.

For **Lock to Vote**, the dialog asks for the ERC-20 token address, then configures support threshold and minimum participation. A standalone process also configures proposal duration; a Lock-to-Vote body in a stage uses the stage's voting period. The **Vote change** switch maps the setup to Vote Replacement instead of the default Standard mode; the upstream [voting model](../protocol-doc/plugins/lock-to-vote-plugin.md#the-voting-model-and-how-it-differs) and [unlock regimes](../protocol-doc/plugins/lock-to-vote-plugin.md#getting-your-tokens-back-two-unlock-regimes) own the resulting behavior. These settings flow into the same [prepare-and-apply publication sequence](#preparing-and-applying-an-installation) as the other plugins.

## The advanced flow

Advanced governance uses the [staged proposal processor](../protocol-doc/plugins/spp-plugin.md) and requires setup by the Aragon team. Users reach that team through **Advanced — On request** in the Governance step. The panel is headed "Governance custom-built for" the account's own name and lists what the team can compose: different proposal flows per decision type, granular permissions, optimistic governance, security councils, and governance that adapts over time. The wizard's **Next** control is disabled; **Get in touch** opens the Aragon assistance form ([getting help](../application/getting-help.md)).

The model:

- A governance process using the staged proposal processor has **one or more [stages](./stage.md)**.
- Every stage has **zero or more [bodies](./body.md)**.
- Any account can have **zero or more governance processes**.

Aragon configures each body's plugin, membership, governance settings, and metadata. Each body plugin's sub-proposal includes an [action that reports its result to the Staged Proposal Processor](./target.md#plugin-targets). An advanced-process body receives its own name, description, and resources because it has an identity distinct from the parent process; the basic process reuses its single plugin's process metadata.

One type of plugin therefore serves in different contexts: standalone as its own process, or as a body within a stage. An already-installed plugin instance can also serve as a body in more than one process, but its governance settings are then shared across those processes; [bodies that span multiple processes](./body.md#bodies-that-span-multiple-processes) carries the trade-offs.

Each [stage](./stage.md) has duration, expiration, approval-only early advance, body roles, and separate approval and veto thresholds. Aragon configures these for the agreed process; [staged proposals](./proposal.md#staged-proposals) explains how a proposal traverses it. A stage's approval or veto threshold cannot exceed the number of bodies of that role ([stage](./stage.md#stage-rules)).

### Adding a body

Aragon can add an external address as a body, including a [Safe](../accounts/safe.md) ([Safe as a body](./safe-as-a-body.md)). In the team's configuration flow, **add body → any address** requires a valid address and waits for the Safe-recognition check to finish. A non-Safe address, including an EOA, remains eligible. When the address is recognized as a Safe ([recognition is a name heuristic, and fallible](./safe-as-a-body.md#recognizing-a-safe-body)), setup deploys a `SafeOwnerCondition` and offers it as the only condition for that body's proposal-creation toggle. Other eligibility on the process is composed as usual ([proposal creation](./proposal-creation.md)).

## Choosing authorized actions

The **Permissions** step defines which actions the new process may make the account execute:

- **Any action** gives the process unrestricted execution. The empty-state copy calls this **Unrestricted execution**.
- **Specific actions** scopes execution to an allowlist. The app describes this choice as "Selected actions can be added to proposals."

For a specific scope, the action composer provides standard actions the app can compose, including updating DAO metadata; available plugin actions depend on their support and the permissions the app can recognize as granted. A user can also add a verified target contract and select one of its write functions. The app derives the target address and 4-byte function selector from that choice; the user selects a contract function rather than entering a raw selector. A process can include multiple authorized actions, with duplicate target-selector pairs rejected.

Specific-actions mode may also be published with no actions selected. When the installation is applied, its permission changes replace the plugin setup's default unrestricted execute grant with a grant conditioned by an execute selector condition populated with the chosen target/function selectors. With an empty allowlist, the process cannot execute an account action until a later governed change adds an allowed selector. For the product meaning of that state, see [Scoped authority](../access-control/scoped-authority.md); for its mechanism, see the [execute selector condition](../protocol-doc/helpers/condition-library/execute-selector-condition.md).

In Basic setup, this step lets users set a new process's execution scope themselves. Aragon sets that scope as part of an advanced-governance engagement. Permission changes outside this flow remain ordinary smart-contract [actions](./action.md) that an authorized account can compose through the [action builder](../application/action-builder.md); the designer's supported forms do not define the full set of grants or revocations the account can execute.

## Before publishing

The form aims to reject unsatisfiable settings; passing the form does not establish that every protocol constraint is satisfied or that thresholds, durations, allowlists or body composition fit the organization. Review [duration limits](#configuring-token-based-governance), [unrestricted execution and empty allowlists](#choosing-authorized-actions), and [immediate Admin execution](#preparing-and-applying-an-installation) alongside the [configuration choices that remain your responsibility](../osx-and-the-platform.md#which-configurations-remain-your-responsibility). For the underlying rules and cautions, see [majority voting](../protocol-doc/plugins/majority-voting.md), [Token Voting](../protocol-doc/plugins/token-voting-plugin.md#keep-in-mind) and [permissions](../protocol-doc/core/permissions.md#keep-in-mind).

## Preparing and applying an installation

Clicking **Publish** deliberately begins two transaction submissions. First, the designer uses the plugin setup processor to **prepare** the installation: one transaction deploys or configures the requested plugins and permission condition, and computes the permission changes and helpers the installation will require. Preparation is permissionless and does not itself change the DAO's permissions ([why prepare and apply are separate](../protocol-doc/framework/plugin-setup-processor.md#why-prepare-and-apply-are-separate)).

The second submission creates the proposal that **applies** that prepared installation to the live DAO, including its permission changes. Because applying changes the DAO's permission state, an already-authorized governance process must make the DAO execute it ([installing onto a live DAO](../protocol-doc/framework/plugin-setup-processor.md#installing-onto-a-live-dao)). The proposal's later passage and execution perform the installation; the wallet submission alone does not grant permissions on an established account. An admin proposal passes and executes automatically during bootstrap, but it remains a proposal — admin is the immediate route through the authorization model, not an exception to it. On an established DAO, another process can carry the installation proposal if its permissions admit the installation actions.

Both transactions move through the shared transaction dialog ([submitting a transaction](../application/submitting-a-transaction.md)).

## Editing across the lifecycle

The designer prepares governance changes as **proposals** for the DAO to execute:

- **Creating a process** follows the [prepare-and-apply installation flow](#preparing-and-applying-an-installation).
- A **basic process** — a single plugin that is both the process and its own body — can be adjusted through proposals containing the relevant [membership](../application/basic-action-views.md#multisig-membership-and-rules), [voting-settings](../application/basic-action-views.md#token-governance) or [metadata](../application/basic-action-views.md#assets-and-identity) actions. Each action changes its own part of the configuration.
- **Bodies in general can be edited** the same way, including a body inside a staged process — e.g. changing a token voting body's quorum or support threshold — without touching the advanced process's own configuration (its stages, which bodies belong to which stage).
- **An advanced process's stage and body configuration cannot be edited in the app.** Its [process](./process.md) page shows the staged composition read-only, with no edit control and no contact entry point. The contracts support those changes, and Aragon supports them hands-on ([getting help](../application/getting-help.md)). Its descriptive metadata can be updated through the metadata action without changing the stage configuration.

These action-based changes support [evolving governance](../value-proposition.md), with advanced stage configuration handled through Aragon. Ending a process is a separate flow: [Removing a governance process](./process-removal.md) covers where it starts, what the app requires, and the rule for the last recognized process.

## Worked example: installing a multisig

1. Configure the [multisig](../protocol-doc/plugins/multisig-plugin.md) by choosing its members and approval threshold.
2. Specify who can create proposals ([proposal creation](./proposal-creation.md)).
3. In the [Permissions step](#choosing-authorized-actions), choose unrestricted **Any action** or an allowlist of **Specific actions**. The latter attaches an [execute selector condition](../protocol-doc/helpers/condition-library/execute-selector-condition.md) to the plugin's Execute grant on the DAO — see [scoped authority](../access-control/scoped-authority.md) for why a bare Execute grant requires an execute-aware condition to enforce that scope. A process's authorized-action scope is visible on its [Process details page](./process.md#process-details-page).
4. [Prepare the installation, then apply it through a proposal](#preparing-and-applying-an-installation); in this onboarding case the apply step is an admin proposal ([why that works in-session](./admin-flow.md#starting-with-admin)).
5. The installed multisig appears in the [proposals](./proposal.md) list as its own process tab (in this basic flow it targets the DAO directly, so it is a [process](./process.md)).
