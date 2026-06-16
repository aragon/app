---
name: dialog-conventions
description: Dialog barrel + definitions wiring — dynamic-import the component, static-export the types, register by id through the dialogProvider.
globs: src/**/dialogs/*/index.ts, src/**/constants/*DialogsDefinitions.ts
kind: rule
---

# dialog-conventions

Dialogs are opened by id through the `dialogProvider`, never rendered inline. Each lives in its own folder and is wired in two places: a barrel `index.ts` and a `*DialogsDefinitions.ts` map. The load-bearing rule is that the dialog component must be **code-split** so it never lands in the initial bundle.

## Canon

- `src/shared/components/dialogProvider/dialogProvider.api.ts` — `IDialogComponentDefinitions`, `IDialogComponentProps`, `useDialogContext` (`open(id, { params })` / `close(id)`).
- `src/modules/capitalFlow/dialogs/dispatchDialog/index.ts` — multi-dialog barrel reference.
- `src/modules/finance/dialogs/assetSelectionDialog/index.ts` + `src/modules/finance/constants/financeDialogsDefinitions.ts` — single dialog wired end to end.
- `src/modules/application/components/providers/providersDialogs.ts` — every module's definitions are merged here.

## The barrel — `dialogs/{name}/index.ts`

The component export is **always** `next/dynamic`. Types are re-exported statically with `export type`:

```ts
import dynamic from 'next/dynamic';

export const DispatchDialog = dynamic(() =>
    import('./dispatchDialog').then((mod) => mod.DispatchDialog),
);

export type { IDispatchDialogParams, IDispatchDialogProps } from './dispatchDialog';
```

- **Never `export { DispatchDialog } from './dispatchDialog'`.** A static component re-export pulls the dialog (and its whole dependency tree) into the bundle of every consumer of the barrel — the exact regression this rule exists to prevent.
- **Types must stay `export type`, not dynamic.** `dynamic()` wraps runtime values only; types are erased at compile time, so `export type` lets definitions and callers reference `IXxxDialogParams` without forcing the chunk to load.
- One `dynamic(...)` const per dialog component in the folder; group all the `export type` lines after them.

## The definitions map — `*DialogsDefinitions.ts`

```ts
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AssetSelectionDialog } from '../dialogs/assetSelectionDialog';
import { FinanceDialogId } from './financeDialogId';

export const financeDialogsDefinitions: Record<FinanceDialogId, IDialogComponentDefinitions> = {
    [FinanceDialogId.ASSET_SELECTION]: { Component: AssetSelectionDialog, ... },
};
```

- **Import the component from the folder barrel (`../dialogs/assetSelectionDialog`), never the `.tsx` directly** (`.../assetSelectionDialog/assetSelectionDialog`). The direct import bypasses the `dynamic()` wrapper and statically bundles the dialog.
- Keys come from the module's `*DialogId` enum — no inline string ids.
- A new module's definitions must be merged into `providersDialogs.ts`, or the id won't resolve at runtime.

## Non-obvious

- **The dynamic const name must match the component it loads.** `dynamic(() => import('./assetSelectionDialog').then((mod) => mod.AssetSelectionDialog))` exported as `AssetSelectionDialog` — a renamed export silently ships the wrong/no component to its definition entry.
- The dialog `.tsx` reads its inputs from `location.params` (guarded with `invariant`) and uses `useDialogContext` for nested `open`/`close` — it does not take params as React props. Interfaces are `IXxxDialogParams` (the `open()` payload) and `IXxxDialogProps extends IDialogComponentProps<IXxxDialogParams>`.
- Sub-components nested under a dialog folder are plain static exports — only the top-level dialog registered in a definitions map needs `dynamic`.
