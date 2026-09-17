---
type: opportunity
title: Publish a process without touching the actions list
tags: [governance, access-control, validation]
status: candidate
source: app source verification (2026-08-04, app@122f1bd1; see log.md)
---

# Publish a process without touching the actions list

A candidate improvement, not current behavior or a roadmap commitment.

The [governance designer](./governance-designer.md)'s Permissions step is meant to be publishable in every one of its states: **Any action** grants unrestricted execution, and **Specific actions** may deliberately be published with nothing selected, producing a conditioned execute grant whose allowlist starts empty ([scoped authority](../access-control/scoped-authority.md)). Source verification found that the second state, and in fact both radio choices, currently depend on the author having interacted with the actions list at all.

The list is validated as a group, but its value is never initialised when the wizard opens, so an author who never adds an action leaves it unset rather than empty. The group validation then runs against that unset value and throws instead of returning a verdict, and because the submit handler's result is not awaited the failure surfaces as **Publish doing nothing** — no error on the step, no transaction, no explanation ([the validation wiring](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/components/createProcessForm/createProcessFormPermissions/createProcessFormPermissions.tsx#L62-L92)). Adding one action and removing it again initialises the list and publishing then works, which is why the empty-allowlist state is reachable at all.

Two consequences worth separating:

- **The documented empty-allowlist state is reachable only by a detour** — add an action, then remove it. The state itself is real and the app displays it correctly; it is the direct route to it that fails.
- **The failure is not confined to that state.** Because the list is validated regardless of which radio option is chosen, publishing a process with **Any action** selected is affected the same way whenever the author never opened the actions list — which is the expected path for an unrestricted process.

Value: this sits on the designer's terminal step, after all configuration work is done, and it fails silently — the worst place and the worst manner. Any of three fixes would close it: initialising the list as empty, making the group validation tolerate an unset value, or surfacing the rejected submit as an error on the step.

**Confidence note.** The mechanism was established by reading the form library's registration and validation path and reproducing the throw against the exact installed version, not by observing the app in a browser. The failure mode is near-certain; a run-through of the designer would confirm the user-visible symptom before this is ticketed.
