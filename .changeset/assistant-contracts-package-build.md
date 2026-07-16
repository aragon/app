---
"@aragon/assistant-contracts": patch
---

Build the package to `dist/` (tsup CJS/ESM/types) so Node runtimes such as Vercel can require it; TypeScript source under `src/` is no longer the package entrypoint
