# Draft ticket — gate blocker (file under APP-1220)

Team Platform `76564c5d-7fcb-42d3-93b6-3bfbeaf3e50c`,
parent APP-1220 `2f7cff0b-18ac-45e5-be57-0984838cc9ca`,
labels `FE Tech`, `agents`, `docs`.

Filed as APP-1235: https://linear.app/aragon/issue/APP-1235
Retained as the drafting record.

---

**Title:** Design bundle emits two revision families and pre-monorepo kit URLs

The APP-1220 acceptance gate failed on this. Verdict and captured evidence:
`.design-sync/evaluations/APP-729/runs/20260927T232116Z/verdict.json` (branch `APP-729`).

The handoff produced in the gate run cited app `8a3ea8c8` + kit `e06fbb8d` and linked
`github.com/aragon/gov-ui-kit/blob/e06fbb8d/...`, which does not resolve. The model did
nothing wrong: it reported what the payload told it, and copied the URL verbatim from
`guidelines/context/source-index.md:997`.

## Two defects, one theme: the bundle predates the monorepo move

### 1. Stale kit repository constant

`.design-sync/overrides/docs.mjs:25-28`

```js
const REPOSITORIES = {
    app: 'https://github.com/aragon/app',
    kit: 'https://github.com/aragon/gov-ui-kit',
};
```

After APP-594 the kit lives in `aragon/app` at `packages/gov-ui-kit`. Commit `e06fbb8d` is
reachable only from `origin/app-594-migrate-ui-kit-to-monorepo`; the migration rewrote paths,
so that sha is not expected to exist in the standalone kit repo. Every emitted kit URL is
therefore unresolvable, including the one the gate caught. The same wrong coordinates appear
in `.payload-manifest.json`'s `kit.repository`.

Link construction goes through `immutableUrl(repository, path, line, commits, tracked)` at
`docs.mjs:37`, so the fix is one constant plus a subdirectory prefix for kit paths.

### 2. Generated context and hand-written docs disagree

Generated from live provenance:

- `guidelines/context/index.md` — app `8a3ea8c8`, kit `e06fbb8d`
- `guidelines/context/source-index.md` — same

Hand-maintained, frozen at older revisions and carried into the payload:

- `.design-sync/conventions.md:23,25,32` — app `3c9bb798`, kit source `8d70bdf0`, audited kit `64b517f5` (becomes `README.md` via `cfg.readmeHeader`)
- `.design-sync/component-registry/REPORT.md:7-8` — app `3c9bb798`, kit `64b517f5` (becomes `guidelines/context/registry-report.md`)
- `.design-sync/tokens/README.md:8` — kit `64b517f5`

So one payload ships two mutually inconsistent revision families. A consumer cannot tell which
revision the bundle describes — directly against APP-1208's criterion "records exact app/kit,
converter and guidance identity".

Also: `guidelines/context/selection-guide.json` carries no kit sha at all (`grep e06fbb8` = 0
matches), so it cannot be revision-matched by inspection.

## Acceptance criteria

* Emitted kit URLs resolve. Use the coordinates that exist: `aragon/app` at
  `packages/gov-ui-kit`, or whatever the post-APP-594 canonical location is.
* `.payload-manifest.json` `kit.repository` matches those coordinates.
* One revision family across `README.md`, `guidelines/context/*` and the tokens docs. Prefer
  deriving the prose revisions from live provenance over hand-maintaining them, so they cannot
  drift again.
* A check fails when an emitted upstream URL does not resolve, or when two emitted documents
  disagree on the app/kit revision. Related to APP-1224's staleness gate; decide there whether
  it lives in the same check.

## Not in scope

The gate also found `selection-guide.json` has no `AddressesInput` entry and
`registry-report.md` went unconsulted. That is APP-726 coverage, recorded separately in the
verdict, and is not gating.
