---
"@aragon/app": patch
---

Follow up on the Sentry audit: serve the 404 page for every DAO route whose network or address segment is malformed (validated once in `resolveDaoId`, so bot-probed URLs no longer fail the member details, process details and other pages as server errors), stop the members page from crashing on governance tokens whose backend metadata is null, keep amount fields from throwing on empty or scientific-notation input, render a not-found state instead of crashing when the gauge voter or proposals page has no plugin to show, and classify malformed RSC router-state headers and `insertBefore` DOM mutations by browser extensions as environment noise.
