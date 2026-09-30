FooterInfo from @aragon/gov-ui-kit. Use via `window.GovUiKit.FooterInfo` (bundle loaded from the root `_ds_bundle.js`).

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
