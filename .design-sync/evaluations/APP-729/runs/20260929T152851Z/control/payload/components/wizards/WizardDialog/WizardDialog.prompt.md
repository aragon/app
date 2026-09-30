WizardDialog from @aragon/gov-ui-kit. Use via `window.GovUiKit.WizardDialog` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### Default

```jsx
() => (
    <AppProviders>
        <DialogProvider>
            {forceOpenStyles}
            <Dialog.Root
                containerClassName="ds-force-open"
                modal={false}
                open={true}
                overlayClassName="ds-force-open"
                size="lg"
                useFocusTrap={false}
            >
                <WizardDialog.Container
                    description="Define who can create and approve proposals in this governance process."
                    formId="setupBody"
                    initialSteps={[
                        { id: 'type', order: 0, meta: { name: 'Type' } },
                        { id: 'members', order: 1, meta: { name: 'Members' } },
                    ]}
                    onSubmit={() => undefined}
                    submitLabel="Add body"
                    title="Set up governance body"
                >
                    <WizardDialog.Step
                        id="type"
                        meta={{ name: 'Type' }}
                        order={0}
                    >
                        <RadioGroup
                            className="w-full"
                            defaultValue="multisig"
                            label="Body type"
                        >
                            <RadioCard
                                description="A fixed list of members approves proposals."
                                label="Multisig"
                                value="multisig"
                            />
                            <RadioCard
                                description="Token holders vote with their voting power."
                                label="Token voting"
                                value="token"
                            />
                        </RadioGroup>
                    </WizardDialog.Step>
                </WizardDialog.Container>
            </Dialog.Root>
        </DialogProvider>
    </AppProviders>
);

// Single-step dialog wizard: no next step, so the footer renders the final
// submit label directly.
```

### FinalStep

```jsx
() => (
    <AppProviders>
        <DialogProvider>
            {forceOpenStyles}
            <Dialog.Root
                containerClassName="ds-force-open"
                modal={false}
                open={true}
                overlayClassName="ds-force-open"
                size="lg"
                useFocusTrap={false}
            >
                <WizardDialog.Container
                    formId="renameDao"
                    initialSteps={[
                        {
                            id: 'metadata',
                            order: 0,
                            meta: { name: 'Metadata' },
                        },
                    ]}
                    onSubmit={() => undefined}
                    submitLabel="Save changes"
                    title="Update DAO metadata"
                >
                    <WizardDialog.Step
                        id="metadata"
                        meta={{ name: 'Metadata' }}
                        order={0}
                    >
                        <div className="flex w-full flex-col gap-4">
                            <InputText
                                defaultValue="Builders Collective"
                                helpText="Shown across the App and on the DAO explorer."
                                label="DAO name"
                            />
                            <InputText
                                defaultValue="builders.dao.eth"
                                disabled={true}
                                label="ENS subdomain"
                            />
                        </div>
                    </WizardDialog.Step>
                </WizardDialog.Container>
            </Dialog.Root>
        </DialogProvider>
    </AppProviders>
)
```
