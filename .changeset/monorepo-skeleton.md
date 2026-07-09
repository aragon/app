---
'@aragon/app': patch
---

Restructure the repository into a pnpm monorepo: the app now lives in `apps/app`, shared tooling (turbo, biome, husky, changesets) stays at the workspace root. No runtime changes.
