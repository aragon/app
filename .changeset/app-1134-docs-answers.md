---
"@aragon/assistant": minor
"@aragon/assistant-contracts": minor
---

Answer product questions in the support assistant from the platform knowledge base (`aragon/platform-doc`, fetched at build time and bundled as an in-process search index): the agent searches and reads the documentation silently, says so and offers to pass the question on when it does not cover it, and a question the user agrees to pass on becomes a ticket under the `docs-gap` label.
