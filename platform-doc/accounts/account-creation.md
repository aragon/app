---
type: capability
title: Account creation
tags: [accounts, onboarding]
status: draft
source: aragon-knowledge-base/product/capabilities/dao-creation.md (first-slice brain dump, 2026-07-06) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + product-owner briefing and app source verification (2026-08-04, app@122f1bd1; see log.md) + supported-chain reconciliation (2026-09-10, app@d1fa9970; see log.md) + OSx orientation contextual edits (2026-09-13, see log.md) + Safe connection verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and locked connector packages (2026-09-13, see log.md) + live application-page coverage at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) + product-owner services and OSx answer-routing briefing (2026-09-14, see log.md)
---

# Account creation

Account creation deploys a new onchain [account](./account.md) through the Aragon app on the chosen network, ready for governance to be installed afterwards through the [governance designer](../governance/governance-designer.md).

## Entry points

1. **Reach out to the Aragon team** — the preferred route for help planning deployment and governance. Aragon offers [paid governance advisory and workshops](../application/getting-help.md#governance-advisory), as well as deployment services for configurations that require the team.
2. **Self-serve from the [Explore page](../application/explore-page.md)** — the app's landing page, which shows other accounts that have launched.

Self-serve deployment needs a connected wallet. Connecting through the [wallet-connection modal](../application/wallet-connection.md) requires accepting the Terms of Service and Privacy Policy.

## Create account page

### Self-serve creation

The flow is a two-step, no-code [full-screen wizard](../application/wizard.md#full-screen-wizard), deliberately decoupled from governance design: the account publishes onchain before any governance detail is decided.

1. **Select chain.** Choose a [supported chain](../application/supported-chains.md) with account creation available. The chain is the parent deployment context: the account, and contracts later created for it such as a new governance token, belong to that chain. The picker defaults to **Ethereum Sepolia** and recommends launching a test account there before a first production launch.
2. **Define the account.** Provide its name, logo, description, and resources. This metadata is posted to IPFS and later drives how the account is named and presented in the app ([account presentation](./account.md#identifying-an-account)). On Ethereum mainnet this step also offers an optional `<label>.dao.eth` subname; when chosen, the factory assigns it during registration ([the account's optional `dao.eth` subname](./account.md#identifying-an-account)).

Continuing from metadata opens the shared [transaction dialog](../application/submitting-a-transaction.md). It prepares and submits one deployment transaction through the OSx [DAO factory](../protocol-doc/framework/dao-factory.md). The resulting account has the [admin plugin](../protocol-doc/plugins/admin-plugin.md) installed by default ([decision](../governance/admin-flow.md#starting-with-admin)), which puts it into the [admin flow](../governance/admin-flow.md).

The new account is an OSx `DAO` whose [factory bootstrap leaves ROOT with the account itself](../protocol-doc/core/dao.md#deployment-and-bootstrapping-root); its admin can execute actions immediately through the [Admin flow](../governance/admin-flow.md). Guided creation and audited contracts do not establish that later governance choices are sound. Review the [configuration choices that remain your responsibility](../osx-and-the-platform.md#which-configurations-remain-your-responsibility) before assigning authority or committing assets.
