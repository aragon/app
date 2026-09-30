Dialog from @aragon/gov-ui-kit. Use via `window.GovUiKit.Dialog` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `Dialog.Content`, `Dialog.Footer`, `Dialog.Header`, `Dialog.Root`. Compose only these listed members, following the examples below. `Dialog` is a namespace, not a callable root; no unlisted `Item` or `Group` member is implied.

## Examples

### Default

```jsx
() => (
    <>
        {forceOpenStyles}
        <Dialog.Root
            containerClassName="ds-force-open"
            modal={false}
            open={true}
            overlayClassName="ds-force-open"
            size="md"
            useFocusTrap={false}
        >
            <Dialog.Header
                description="Delegate your voting power to another member of the DAO. You can undelegate at any time."
                onClose={() => undefined}
                title="Delegate voting power"
            />
            <Dialog.Content>
                <div className="flex flex-col gap-3 pb-2">
                    <div className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3">
                        <span className="text-neutral-800">alice.eth</span>
                        <span className="text-neutral-500 text-sm">
                            120.5K ANT
                        </span>
                    </div>
                    <p className="text-neutral-500 text-sm">
                        Your 4,200 ANT voting power will count towards proposals
                        voted on by alice.eth once the delegation transaction is
                        confirmed on-chain.
                    </p>
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{ label: 'Delegate' }}
                secondaryAction={{ label: 'Cancel' }}
            />
        </Dialog.Root>
    </>
)
```

### WizardFooter

```jsx
() => (
    <>
        {forceOpenStyles}
        <Dialog.Root
            containerClassName="ds-force-open"
            modal={false}
            open={true}
            overlayClassName="ds-force-open"
            size="md"
            useFocusTrap={false}
        >
            <Dialog.Header onClose={() => undefined} title="Publish proposal" />
            <Dialog.Content description="Review the transaction details before publishing your proposal on-chain.">
                <div className="flex flex-col gap-2 pb-2">
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-sm">
                            Network
                        </span>
                        <span className="text-neutral-800 text-sm">
                            Ethereum Mainnet
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-sm">
                            Estimated gas fee
                        </span>
                        <span className="text-neutral-800 text-sm">
                            0.0042 ETH
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-sm">
                            Voting starts
                        </span>
                        <span className="text-neutral-800 text-sm">
                            Immediately after publishing
                        </span>
                    </div>
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{ label: 'Publish proposal' }}
                secondaryAction={{ label: 'Back' }}
                variant="wizard"
            />
        </Dialog.Root>
    </>
)
```

## Related

`DialogAlert`, `DialogProvider`, `Dialog.Content`, `Dialog.Footer`, `Dialog.Header`, `Dialog.Root`
