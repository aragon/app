---
name: core-action-decoded-input
description: Decoded core-action inputData is backend-guaranteed non-null; the `as unknown as` registry cast in *ActionDetails components is intentional, not a smell.
globs: src/actions/**
kind: rule
---

## The `as unknown as ICoreAction*` cast is intentional

```ts
const { inputData } = action as unknown as ICoreActionExecute;
```

This cast is the **established, correct** pattern (`gaugeVoter`, `gaugeRegistrar` details do the same) — not a type-safety smell to refactor away.

- **Do NOT "fix" it by narrowing the props generic** to `IProposalActionData<ICoreActionExecute>`. The registry slot is `componentDetails?: ProposalActionComponent<IProposalActionData>` over the **base** `IProposalAction`; React props are contravariant under `strictFunctionTypes`, so a narrowed component is not assignable and `actionViewRegistry.register(...)` fails to compile (`Type 'string' is not assignable to 'CoreActionType.X'`).
- Removing the cast cleanly requires making `ActionViewRegistry.register` generic over the action type (a shared-infra change), not a per-component edit. Don't propose the per-component narrowing as a quick win — it doesn't build.
