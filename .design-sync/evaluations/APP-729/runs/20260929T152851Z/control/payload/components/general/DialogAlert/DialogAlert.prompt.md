DialogAlert from @aragon/gov-ui-kit. Use via `window.GovUiKit.DialogAlert` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `DialogAlert.Content`, `DialogAlert.Footer`, `DialogAlert.Header`, `DialogAlert.Root`. See the DS docs for composition — e.g. items like `DialogAlert.Item` go inside `<DialogAlert>`; containers like `DialogAlert.Group` wrap multiple `<DialogAlert>`s.

## Examples

### Critical

```jsx
() => (
    <>
        {forceOpenStyles}
        <DialogAlert.Root
            containerClassName="ds-force-open"
            open={true}
            overlayClassName="ds-force-open"
            size="md"
            useFocusTrap={false}
            variant="critical"
        >
            <DialogAlert.Header title="Delete proposal draft" />
            <DialogAlert.Content>
                <p className="pb-2 text-neutral-500">
                    The draft "Fund Q3 grants program with 250K USDC" will be
                    permanently deleted. This action cannot be undone.
                </p>
            </DialogAlert.Content>
            <DialogAlert.Footer
                actionButton={{ label: 'Delete draft' }}
                cancelButton={{ label: 'Keep draft' }}
            />
        </DialogAlert.Root>
    </>
)
```

### Warning

```jsx
() => (
    <>
        {forceOpenStyles}
        <DialogAlert.Root
            containerClassName="ds-force-open"
            open={true}
            overlayClassName="ds-force-open"
            size="md"
            useFocusTrap={false}
            variant="warning"
        >
            <DialogAlert.Header title="Unsaved changes" />
            <DialogAlert.Content>
                <p className="pb-2 text-neutral-500">
                    You have unsaved changes to the voting settings. Leaving now
                    will discard the updated support threshold and voting
                    duration.
                </p>
            </DialogAlert.Content>
            <DialogAlert.Footer
                actionButton={{ label: 'Discard changes' }}
                cancelButton={{ label: 'Continue editing' }}
            />
        </DialogAlert.Root>
    </>
)
```

## Related

`DialogAlert.Content`, `DialogAlert.Footer`, `DialogAlert.Header`, `DialogAlert.Root`
