FooterInfo from @aragon/app. Source: `apps/app/src/shared/components/footerInfo/footerInfo.tsx`. Use via `window.GovUiKit.FooterInfo` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface FooterInfoProps {
  /** The informational text to display. */
  text: string;
  /** Rendering mode: 'panel' (default) or 'dialog'. Controls text alignment — centered in panel, left-aligned in dialog. */
  mode?: "dialog" | "panel";
}
```

## Examples

### Panel

```jsx
() => (
    <div className="max-w-md rounded-xl border border-neutral-100 p-4">
        <FooterInfo text="Voting power is calculated from your token balance at the block the proposal was created." />
    </div>
)
```

### Dialog

```jsx
() => (
    <div className="max-w-md rounded-xl border border-neutral-100 p-4">
        <FooterInfo
            mode="dialog"
            text="By signing this transaction you confirm the delegation of your voting power. You can revoke it at any time."
        />
    </div>
)
```
