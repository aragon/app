---
"@aragon/app": patch
---

Fix the Sentry-audit crash and noise findings: enrich SPP sub-proposals routed to lock-to-vote by their stage body so the proposals page no longer crashes on inconsistent backend data, render a not-found state on the create proposal/process routes for unknown plugin addresses, serve the 404 page (instead of a reported server error) for bot-probed DAO and proposal URLs, format dates after mount to stop SSR hydration mismatches on the members/proposals/proposal-details/dashboard pages, compare plugin daoAddress case-insensitively in useDaoPlugins, and classify environment noise (in-app browsers, wallet-extension conflicts, private-mode storage, deploy skew) as expected in the monitoring taxonomy.
