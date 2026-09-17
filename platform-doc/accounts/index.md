# Accounts

An [account](./account.md) holds assets and acts under its configured authority. These pages describe account entities, their lifecycle, their own views, and relationships between them.

## Account model and lifecycle

- [Account](./account.md) — the account/DAO vocabulary, execution capability, metadata, and optional account-specific ENS subname.
- [Safe](./safe.md) — a smart contract account with multisignature governance built into its core.
- [Account creation](./account-creation.md) — team-assisted and self-serve deployment, before governance is configured.
- [Contract upgrades](./contract-upgrades.md) — the governed, opt-in route for updating an account's OSx and compatible installed-plugin contracts.

Creation starts with [temporary Admin governance](../governance/admin-flow.md). Its [management and removal controls](../governance/admin-flow.md#admin-controls) support the handover to the account's chosen governance.

## Account views and relationships

- [Dashboard](./dashboard.md) — the selected account's overview, visibility gates, header, and previews.
- [Settings](./settings.md) — the selected account's information, governance configuration, and contract versions.
- [Linked account](./linked-account.md) — presentation, onchain acknowledgement, and the independent permissions needed for control.
- [Executing on a linked account](./executing-on-a-linked-account.md) — pairing the two account views and preparing nested execution through WalletConnect.

Use [Explore](../application/explore-page.md) to find accounts. [Wallet connection](../application/wallet-connection.md) and [connecting a Safe](../application/connecting-a-safe.md) establish the actor in the app; [Aragon Profiles](../application/aragon-profiles.md) and [Aragon Names](../application/aragon-names.md) describe that participant's identity. These are distinct from the governed account and its metadata.
