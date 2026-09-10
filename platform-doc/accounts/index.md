# Accounts

This area covers both the entity a user deploys and governs through the app and the ENS-backed identity of a participant acting around it. The deployed entity is called an **account** in product language and a **DAO** in protocol language (see [Account](./account.md) for why both are right); an [Aragon Profile](./aragon-profiles.md) identifies a participant's wallet, a separate thing from the account it acts around.

## Governed accounts

The onboarding arc these pages describe: [create an account](./account-creation.md) → it starts in the [admin flow](./admin-flow.md) (a transitional, admin-run state) → install real governance via the [governance designer](../governance/governance-designer.md) → leave the admin flow via [admin management](./admin-management.md) (the app warns, but never blocks, if no known process would remain — [removing the last process](./last-process-removal.md)).

- [Account](./account.md) — the account-vs-DAO distinction, why the product says "account", and how the app names and presents an account: metadata-backed naming, the address fallback, and the account's optional `dao.eth` subname.
- [Dashboard](./dashboard.md) — an account's overview page: fixed section order, the shared Proposals/Members visibility gate, and the account-keyed header slot.
- [Explore page](./explore-page.md) — the app's landing page: browse launched accounts, and the self-serve way into creation.
- [Account creation](./account-creation.md) — the two entry points and the self-serve deployment flow.
- [Admin flow](./admin-flow.md) — the transitional admin-run state a new account starts in.
- [Admin management](./admin-management.md) — what the app lets admins do while the admin plugin is installed.
- [Contract upgrades](./contract-upgrades.md) — the governed, opt-in path for available OSx DAO and compatible plugin updates.
- [Install admin plugin by default](./admin-plugin-by-default.md) — the decision behind the bootstrap.
- [Removing the last governance process](./last-process-removal.md) — the decision to warn, never block, and why.

Cutting across the lifecycle, several accounts can be presented together — one primary account with any number of **linked accounts**:

- [Linked account](./linked-account.md) — the primary-and-linked abstraction and how it surfaces across the app.
- [Linked-account signaling](./linked-account-signaling.md) — how the relationship is recorded on-chain and read back as a signal.
- [Linking does not imply control](./linking-does-not-imply-control.md) — why linking is display-only, and how real control is configured separately.
- [Executing on a linked account](./executing-on-a-linked-account.md) — driving a linked account's actions from the primary over WalletConnect.

An account other than a linked account can also connect and act in the app in its own right:

- [Safe](./safe.md) — a smart contract account that combines multisignature governance with the ability to act as itself.
- [Connecting a Safe](./connecting-a-safe.md) — operating the Aragon app as a Safe, so the Safe itself is the connected actor.

## Participant identity

- [Aragon Names](./aragon-names.md) — the overview of the ENS-backed participant-identity cluster.
- [ENS as the profile layer](./ens-as-the-profile-layer.md) — why ENS and IPFS remain authoritative instead of an Aragon-owned profile database.
- [Claiming an Aragon Name](./claiming-an-aragon-eth-name.md) — eligibility, mainnet transactions, constraints, rename, and release for the `aragon.eth` fallback.
- [Aragon Profiles](./aragon-profiles.md) — ENS profile resolution, display, editing, and the member-profile context.
- [Delegate profile record](../governance/delegate-profile-record.md) — the token-specific statement pointer stored on a participant's ENS name.
