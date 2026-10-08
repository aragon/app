---
"@aragon/app": minor
---

Serve the knowledge-base site at `/help` behind the `helpCenter` feature flag (on in local, development and preview): the proxy rewrites `/help/*` to the site deployment named by `NEXT_PUBLIC_DOCS_URL`, and the support chat tells the assistant whether it may link to the site's pages.
