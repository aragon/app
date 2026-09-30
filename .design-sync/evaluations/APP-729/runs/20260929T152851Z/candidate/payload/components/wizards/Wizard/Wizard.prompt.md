Wizard from @aragon/app. Source: `apps/app/src/shared/components/wizards/wizard/index.ts`. Use via `window.GovUiKit.Wizard` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `Wizard.Form`, `Wizard.Root`, `Wizard.Step`. Compose only these listed members, following the examples below. `Wizard` is a namespace, not a callable root; no unlisted `Item` or `Group` member is implied.

## Examples

### Default

```jsx
() => (
    <AppProviders>
        <Wizard.Root initialSteps={steps} submitLabel="Create DAO">
            <Wizard.Form
                className="flex w-full flex-col gap-4"
                onSubmit={() => undefined}
            >
                <Wizard.Step id="network" meta={{ name: 'Network' }} order={0}>
                    <div className="flex w-full flex-col gap-4">
                        <InputText
                            helpText="Appears on the DAO explorer."
                            label="DAO name"
                            placeholder="e.g. Builders Collective"
                        />
                        <TextArea
                            label="Description"
                            placeholder="What does this DAO govern?"
                        />
                    </div>
                </Wizard.Step>
            </Wizard.Form>
        </Wizard.Root>
    </AppProviders>
)
```

## Related

`WizardDetailsDialog`, `WizardDialog`, `WizardPage`, `Wizard.Form`, `Wizard.Root`, `Wizard.Step`
