---
"@aragon/app": minor
---

Serve the knowledge-base site at `/help` behind the `helpCenter` feature flag (on in local, development and preview): the proxy rewrites `/help/*` to the site deployment named by `NEXT_PUBLIC_DOCS_URL`, `robots.txt` lists the site's sitemap, the documentation links of the admin onboarding, the process dialog and the token import go to the site's pages, and the support chat tells the assistant whether it may link to them (it will with the citations of APP-1229). Flag off, nothing changes: the links keep going to docs.aragon.org.
