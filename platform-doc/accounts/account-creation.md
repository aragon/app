---
type: capability
title: Account creation
tags: [accounts, onboarding]
status: draft
source: aragon-knowledge-base/product/capabilities/dao-creation.md (first-slice brain dump, 2026-07-06) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + product-owner briefing and app source verification (2026-08-04, app@122f1bd1; see log.md)
---

# Account creation

Creating a new [account](./account.md) through the Aragon app. **User promise:** get an on-chain account deployed on your chosen network, ready to have governance installed afterwards (via the [governance designer](../governance/governance-designer.md)).

## Entry points

1. **Reach out to the Aragon team** — the preferred route. Setting up an on-chain governance system is hard in general, and the team has the context to help when the supported abstraction cannot stay honest ([reach-out pattern](../design/reach-out-to-the-team.md)).
2. **Self-serve from the [Explore page](./explore-page.md)** — the app's landing page, which shows other accounts that have launched.

Self-serve deployment needs a connected wallet. Before the connection completes, the wallet-connection modal presents the Terms of Service and Privacy Policy and requires explicit acceptance. This is the app's general connection precondition; it is distinct from using **WalletConnect** inside the [action builder](../governance/action-builder.md#adding-actions) to compose an account action through another dApp.

## Business logic (self-serve flow)

The flow is a two-step, no-code [full-screen wizard](../design/full-screen-wizard.md), deliberately decoupled from governance design: the account publishes on-chain before any governance detail is decided.

1. **Select chain.** The picker is the first step because the chain is the parent deployment context: the account, and contracts later created for it such as a new governance token, do not exist outside that chain. The picker defaults to **Ethereum Sepolia** and recommends launching a test account there before a first production launch. Its live options — backed by the [`app` repository](../repositories.md) configuration — are the source of truth for a list that changes with deployments and support, so this page deliberately leaves the network list to the picker.
2. **Define the account.** Provide its name, logo, description, and resources. This metadata is posted to IPFS and later drives how the account is named and presented in the app ([account presentation](./account.md#how-the-app-names-and-presents-an-account)). On Ethereum mainnet this step also offers an optional `<label>.dao.eth` subname; when chosen, the factory assigns it during registration ([the account's optional `dao.eth` subname](./account.md#the-accounts-optional-daoeth-subname)).

Continuing from metadata opens the shared [transaction submission dialog](../design/transaction-submission.md). It prepares and submits one deployment transaction through the OSx [DAO factory](../protocol-doc/framework/dao-factory.md). The resulting account has the [admin plugin](../protocol-doc/plugins/admin-plugin.md) installed by default ([decision](./admin-plugin-by-default.md)), which puts it into the [admin flow](./admin-flow.md).
