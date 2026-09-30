WizardDetailsDialog from @aragon/app. Source: `apps/app/src/shared/components/wizardDetailsDialog/wizardDetailsDialog.tsx`. Use via `window.GovUiKit.WizardDetailsDialog` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface WizardDetailsDialogProps {
  /** Title of the dialog. */
  title: string;
  /** Description of the dialog. */
  description: string;
  /** Steps of the dialog. */
  steps: IWizardDetailsDialogStep[];
  /** Link for further information. */
  infoLink?: string;
  /** Label of the button. */
  actionLabel: string;
  /** Href of where the wizard should link to. */
  wizardLink?: string;
  /** Callback on button click. */
  onActionClick?: () => void;
  /** Dialog ID. Needed to determine the specific dialog to close onActionClick to avoid closing all dialogs. */
  dialogId: string;
}
```

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
                <WizardDetailsDialog
                    actionLabel="Create DAO"
                    description="Deploy your organization on-chain in a few guided steps. You can adjust everything later through governance."
                    dialogId="createDaoDetails"
                    steps={[
                        {
                            label: 'Select the network your DAO lives on',
                            icon: 'CHAIN',
                        },
                        {
                            label: 'Describe your DAO with a name and logo',
                            icon: 'DATABASE',
                        },
                        {
                            label: 'Define how proposals get approved',
                            icon: 'USERS',
                        },
                    ]}
                    title="Create your DAO"
                />
            </Dialog.Root>
        </DialogProvider>
    </AppProviders>
);

// Variant with the optional "more info" link above the steps list.
```

### WithInfoLink

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
                <WizardDetailsDialog
                    actionLabel="Create process"
                    description="Set up a governance process that defines how proposals are created, approved and executed."
                    dialogId="createProcessDetails"
                    infoLink="https://docs.aragon.org/processes"
                    steps={[
                        {
                            label: 'Name and describe the process',
                            icon: 'LABELS',
                        },
                        {
                            label: 'Add the governance bodies involved',
                            icon: 'USERS',
                        },
                        {
                            label: 'Configure voting settings and thresholds',
                            icon: 'SETTINGS',
                        },
                    ]}
                    title="Create governance process"
                />
            </Dialog.Root>
        </DialogProvider>
    </AppProviders>
)
```
