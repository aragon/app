WizardPage from @aragon/app. Source: `apps/app/src/shared/components/wizards/wizardPage/index.ts`. Use via `window.GovUiKit.WizardPage` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `WizardPage.Container`, `WizardPage.Step`. Compose only these listed members, following the examples below. `WizardPage` is a namespace, not a callable root; no unlisted `Item` or `Group` member is implied.

## Examples

### Default

```jsx
() => (
    <AppProviders>
        <WizardPage.Container
            finalStep="Deploy your DAO"
            initialSteps={createDaoSteps}
            onSubmit={() => undefined}
            submitLabel="Deploy your DAO"
        >
            <WizardPage.Step
                description="Select the blockchain your DAO will live on. This cannot be changed after deployment."
                id="network"
                meta={{ name: 'Network' }}
                order={0}
                title="Select your network"
            >
                <div className="flex w-full flex-col gap-4">
                    <InputText
                        defaultValue="Ethereum Mainnet"
                        helpText="The DAO contracts will be deployed on this network."
                        label="Network"
                    />
                    <InputText
                        helpText="Appears on the DAO explorer and in wallets."
                        label="DAO name"
                        placeholder="e.g. Builders Collective"
                    />
                </div>
            </WizardPage.Step>
        </WizardPage.Container>
    </AppProviders>
);

// Single-step wizard: no next step, so the footer renders the final submit
// label together with the submit help text.
```

### FinalStep

```jsx
() => (
    <AppProviders>
        <WizardPage.Container
            initialSteps={[
                { id: 'review', order: 0, meta: { name: 'Review' } },
            ]}
            onSubmit={() => undefined}
            submitHelpText="Deploying the DAO requires an on-chain transaction and gas fees."
            submitLabel="Deploy your DAO"
        >
            <WizardPage.Step
                description="Double-check the settings below. Governance settings can be changed later through a proposal."
                id="review"
                meta={{ name: 'Review' }}
                order={0}
                title="Review your DAO"
            >
                <Card className="flex flex-col gap-3 p-6">
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-sm">Name</span>
                        <span className="text-neutral-800 text-sm">
                            Builders Collective
                        </span>
                    </div>
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
                            Governance
                        </span>
                        <span className="text-neutral-800 text-sm">
                            Token voting (ERC-20)
                        </span>
                    </div>
                </Card>
            </WizardPage.Step>
        </WizardPage.Container>
    </AppProviders>
);

// Step with a dropdown instead of the plain "Next" button, used when a step
// can branch (e.g. save draft vs. continue editing the proposal).
```

### NextDropdown

```jsx
() => (
    <AppProviders>
        <WizardPage.Container
            finalStep="Publish proposal"
            initialSteps={[
                {
                    id: 'metadata',
                    order: 0,
                    meta: { name: 'Describe proposal' },
                },
                { id: 'actions', order: 1, meta: { name: 'Actions' } },
            ]}
            onSubmit={() => undefined}
            submitLabel="Publish proposal"
        >
            <WizardPage.Step
                description="Give voters the context they need to make a decision."
                id="metadata"
                meta={{ name: 'Describe proposal' }}
                nextDropdownItems={[
                    { label: 'Continue to actions' },
                    { label: 'Save as draft' },
                ]}
                order={0}
                title="Describe your proposal"
            >
                <div className="flex w-full flex-col gap-4">
                    <InputText
                        defaultValue="Fund the Q3 grants program"
                        label="Title"
                    />
                    <TextArea
                        label="Summary"
                        placeholder="What should the DAO decide on?"
                    />
                </div>
            </WizardPage.Step>
        </WizardPage.Container>
    </AppProviders>
)
```

## Related

`WizardPage.Container`, `WizardPage.Step`
