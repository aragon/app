---
"@aragon/docs-corpus": minor
"@aragon/assistant": patch
---

Move the knowledge-base loader (the fetch of aragon/platform-doc, the published-page filter and the link rules) into `@aragon/docs-corpus`, a source-only workspace package the docs site will share with the assistant, so both publish the same pages. The assistant's documentation index is built from it unchanged; the per-environment corpus modes of both consumers now sit in one table there.
