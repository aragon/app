---
type: concept
title: Partially supported plugins
tags: [cross-cutting, governance, plugins]
status: draft
source: product-owner release-notes briefing (2026-08-03; releases 1.7.0, 1.8.0, and 1.15, see log.md) + app and app-backend source verification (2026-08-04, see log.md)
---

# Partially supported plugins

A **partially supported plugin** has a user-facing experience the app supports, but no self-service deployment experience for an account creator or administrator. When Aragon works directly with a client, it can deploy the setup; the app then understands the installed instance and shows it in the appropriate place.

This is a delivery and availability category, not a statement that the contracts are technically impossible to deploy without Aragon. It also does not, by itself, promise eligibility, a price, a response time, or an ongoing service level. The concrete examples have different commercial evidence: veLocker deployment is generally charged for, Capital Distributor is not available for free for anyone to deploy, and the Gauge source states only that Aragon deploys it for clients. The owner's stated client call to action is to reach out to the Aragon team so Aragon can set up the specific feature.

## The support-state vocabulary

The product owner names three categories, but the source defines only the middle one:

| Category | What is established |
| --- | --- |
| Supported | A neighboring category in the vocabulary; its exact product boundary is not yet defined by this source. |
| **Partially supported** | The app supports the compatible installed instance's user experience, while deployment is arranged directly with Aragon rather than offered as a self-service product flow. |
| Unsupported | A neighboring category in the vocabulary; its exact product boundary is not yet defined by this source. Do not automatically treat it as a synonym for an unknown plugin. |

Use **partially supported** only for the middle condition above. Whether the app recognizes an installed contract and whether the product offers self-service deployment are separate questions.

## Recognition is separate from deployment

The app recognizes a plugin by its interface rather than a specific repository or contract; the [known-versus-unknown plugin model](./governance/plugin.md) is the technical axis. This interface abstraction lets a compatible alternate implementation used for testing or for a client-specific solution reuse an existing app surface without a bespoke frontend path. The Plugin page owns recognition and routing details, compatibility limits, and the repository-specific update boundary.

Do not map the backend field named `isSupported` onto this product category. It is a technical indexing/lifecycle flag, not a commercial-support, self-service-availability, repository, or compatibility-conformance signal.

## Current instances

- [veLocker](./governance/velocker.md) — a related vote-escrow component rather than a separately registered frontend plugin interface — is the original partially supported example: the app provides the vote-escrow experience, while setup is not self-service.
- [Gauge voting](./governance/gauge-voting.md) is described by the owner as a "premium Aragon services" category that Aragon deploys for clients.
- [Capital Distributor](./governance/capital-distributor.md) follows the same deploy-for-client posture and is not available for free for anyone to deploy.

Their pages own their mechanics and any instance-specific commercial facts. This page owns only the shared classification and the recognition-versus-deployment boundary.

## Open questions

- [ ] What is the approved product term for plugins or features whose UI is supported but whose deployment is handled by Aragon for a client: "partially supported plugins," "premium features," "premium Aragon services," or another term?
- [ ] What criteria distinguish fully supported from unsupported plugins, independently of the defined partially-supported deployment boundary and the known/unknown recognition axis?
