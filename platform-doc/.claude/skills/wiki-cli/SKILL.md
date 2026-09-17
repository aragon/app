---
name: wiki-cli
description: Operate this knowledge base with the `wiki` CLI (v0.8) — the deterministic index over the bundle's Markdown. Load BEFORE the first `wiki` command of a session and before creating, editing, moving, renaming, or deleting any entry. Covers the composite-root rule (always `wiki --root .` from the repo root, never from inside `protocol-doc/`), the query palette (status/list/search/read/outline/links/backlinks/unresolved/orphans/checkboxes/property/table), safe reshaping (`move`, `tidy`), the `wiki check` gate that closes every batch of edits, PowerShell-vs-POSIX invocation on this machine, and the capture-only fallback when the CLI is missing. Triggers on: any `wiki` invocation; "the base", "the bundle", "the graph", "the wiki"; check/backlinks/orphans/unresolved/checkboxes/frontmatter/`type:`; writing or re-filing an entry; moving or renaming a page; reconciling the backlog board or the task queue; answering a question out of these docs.
---

# Operating the base with `wiki`

You are the librarian; `wiki` is the database engine. It answers structural questions
(`grep` cannot compute a link graph) and never writes content — drafting, filing, and
linking judgment stay yours. Product scope, structure, and review conventions live in
[WORKFLOW.md](../../../WORKFLOW.md); reader-facing prose follows
[voice.md](../../../voice.md); the format and the model live in
[AGENTS.md](../../../AGENTS.md). Read the voice policy in full after WORKFLOW.md when a
task creates or substantively rewrites reader-facing prose; skip it for read-only,
graph-only, path-only, and maintenance work. This skill is the *mechanics*: how to invoke
the tool correctly here, and what breaks when you don't.

## Preflight

```powershell
wiki --version            # expect 0.8.0; absent → capture-only mode (last section)
wiki --root . status      # entries, links, tags, checkboxes, broken, orphans
```

Run from the repo root (`c:\dev\platform-doc`). Check the version **before** mutating
anything, not after — without the CLI there is no gate, and structure waits.

## Rule 1 — one root, always the parent

`wiki` finds its config by walking up to the nearest `wiki.toml`, and `protocol-doc/`
carries one of its own. Version 0.8 does **not** merge nested configs, so a command run
from inside the submodule silently swaps in the upstream-only type vocabulary and drops
every platform→protocol link from the graph.

- Always `wiki --root .` from the repo root, whatever subtree the work is in.
- Scope into a subtree with `--prefix protocol-doc/`, never by changing directory.
- `wiki --root protocol-doc <cmd>` is a deliberate upstream-only diagnostic. It is never
  the gate.

Why the parent root is authoritative: WORKFLOW.md, *Protocol-doc: read-only upstream*.

## Rule 2 — translate the POSIX recipes

AGENTS.md and WORKFLOW.md write their recipes in POSIX; PowerShell is this machine's
primary shell. Either translate, or run the recipe verbatim through the Bash tool.

- `| head -n 40` → `| Select-Object -First 40`
- `| jq …` → `| ConvertFrom-Json`, then `Group-Object` / `Where-Object` / `Select-Object`
  (there is **no `jq`** on this box)
- `find -maxdepth 2 -type d` → the Glob tool, or `Get-ChildItem -Directory -Depth 1`

`--where`, `--prefix`, and `--sort=` parse identically in both shells.

## The palette, by need

Every command takes `--format text|json|csv|tsv`. Reach for these before `ls`, `find`,
`Get-ChildItem`, or `Grep` — those are the last resort, not the first.

**Orient on arrival**

```powershell
wiki --root . status
wiki --root . list --sort=timestamp | Select-Object -First 40   # --reverse for the stalest
wiki --root . property type --counts
wiki --root . tags --counts --sort=count
```

**Find and recall** — structured questions go to `list --where` (exact frontmatter match,
repeatable = AND, `key!=value` negates, `key=` tests empty); `search` matches query words
as substrings anywhere in frontmatter + body (AND by default; `--any` broadens, `--exact`
takes the verbatim phrase, `--lines` returns `file:line`).

```powershell
wiki --root . search "governance designer"
wiki --root . search "<topic>" --prefix protocol-doc/        # check upstream before writing
wiki --root . list --where type=capability --prefix treasury/
wiki --root . list --where status=draft                      # what the board must reconcile
wiki --root . list --where type=task --where status=ready --where next_actor=owner
wiki --root . list --where type=task --where status=ready --where next_actor=agent
wiki --root . list --where type=task --where status=blocked --where next_actor=none
wiki --root . read /governance/process.md                    # body, frontmatter stripped
wiki --root . outline /governance/process.md
wiki --root . table /some/dataset.md --format csv            # --n picks the Nth table
```

**Follow the graph** — the part `grep` can't do.

```powershell
wiki --root . links /index.md                    # what it points to (prerequisites)
wiki --root . backlinks /governance/process.md   # what depends on it — read this before
                                                 # changing any fact a page restates
wiki --root . unresolved                         # promised but unwritten: the to-write list
wiki --root . orphans                            # nothing links in: unreachable knowledge
```

**Track work** — `checkboxes` scans the `- [ ]` construct; it does **not** list
`type: task` entries.

```powershell
wiki --root . checkboxes                         # open owner questions, base-wide
wiki --root . checkboxes --prefix governance/     # one area (protocol-doc/ checklists are
                                                  # upstream procedure, not owner questions)
wiki --root . list --where type=task --where status=ready --where next_actor=owner
                                                  # actionable owner work, not a blocker
wiki --root . list --where type=task --where status=ready --where next_actor=agent
                                                  # agent work that can run now
wiki --root . list --where type=task --where status=blocked --where next_actor=none
                                                  # neither actor can move before a trigger
wiki --root . list --where type=task --format json | ConvertFrom-Json |
    Group-Object status | Select-Object Name,Count
```

**Rollups** — `list --format json` is the reporting surface: it carries each entry's full
frontmatter (text/csv/tsv show only `path` and `type`). The file's own path is the reserved
key `_path`; every other key is your frontmatter verbatim.

## The gate — close every batch with `check`

Not optional, and not "when convenient": run it before you report the work done.

```powershell
wiki --root . check
wiki --root . unresolved
wiki --root . orphans
git submodule status protocol-doc
```

- **Errors exit 1 and are yours to fix**: a missing `type`, or a `type` outside
  [wiki.toml](../../../wiki.toml)'s union vocabulary.
- **Warnings exit 0 and are triage.** A broken link to a page not yet written is a
  promise, and `unresolved` is its list. A broken link you just created by hand-editing a
  path or hand-moving a file is a bug — fix that one.
- **One advisory is expected and correct; do not chase it:**
  `warning /protocol-doc/index.md: reserved file should carry no frontmatter`. That file
  legitimately carries `okf_version` as the upstream bundle root.
- The submodule line must show the pinned SHA with a **leading space**. `+` (drifted),
  `-` (uninitialized), or `U` (conflicted) means stop and resolve before finishing.
- `check --fix` applies only safe repairs (`okf_version` sync). It does not fix links.
- Then **leave the batch uncommitted** — the product owner reviews diffs and commits.

## Reshaping — never by hand

```powershell
wiki --root . move --dry-run /a.md /governance/a.md   # preview the link rewrites
wiki --root . move /a.md /governance/a.md             # relocate + rewrite every inbound link
wiki --root . tidy                                    # preview; --links --slug --wikilinks --all apply
```

Hand-moving a file strands every backlink into it, and `check` will only tell you
afterwards. `move` rewrites body links; add `--include-frontmatter` to also rewrite
frontmatter values equal to the old path (opt-in — `source:` fields).

**Mutations stop at the submodule.** Never run `move`, or a bulk mutator like
`tidy --all`, against `/protocol-doc/**`; the upstream is read-only here, and manufacturing
backlinks into it is a defect, not an improvement. After any parent-root mutation, confirm
`git submodule status protocol-doc` is still clean.

Deleting an entry is safe only once nothing links to it — `backlinks` first.

## Capture-only mode (no CLI)

If `wiki --version` fails and the CLI cannot be installed in the session, **do not create,
edit, move, or merge entries, and do not touch the board.** There is no `check` gate, no
computed graph, and no safe `move`, so hand-maintained structure is unverifiable.

Instead: clean up the incoming material's wording only (no logic changed, no claim dropped,
no interpretation added), save it as a dated `inbox/<yyyy-mm-dd>-<topic>.md` with no
frontmatter and no links into the base, and tell the owner it is parked and why. Answering
questions from the base stays fine; it is mutation that waits. Full rules: WORKFLOW.md,
*Degraded mode* and *The inbox*.

## Antipatterns

- Grepping for something the graph knows (`backlinks`, `orphans`, `unresolved`, `links`).
- Running `wiki` from inside `protocol-doc/`, or omitting `--root .`.
- Hand-editing a link path, or moving a file with the Bash/PowerShell tool.
- `tidy --all` run blind — preview first; never across `protocol-doc/`.
- Reporting work finished without the composite `check` and the submodule-status line.
- Reading or processing `inbox/` unless the owner explicitly asked (WORKFLOW.md).
- Reading or processing owner-private `research/` unless the owner explicitly asked (WORKFLOW.md).
- Treating `search` as a filter: use `list --where` for exact frontmatter values.
