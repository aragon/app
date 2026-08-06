import {
    BlockNavigationContextProvider,
    DebugContextProvider,
    Dialog,
    DialogProvider,
    enTranslations,
    TranslationsProvider,
    WizardDetailsDialog,
} from '@aragon/gov-ui-kit';

const AppProviders = (props: { children?: React.ReactNode }) => (
    <DebugContextProvider>
        <TranslationsProvider translations={enTranslations as never}>
            <BlockNavigationContextProvider>
                {props.children}
            </BlockNavigationContextProvider>
        </TranslationsProvider>
    </DebugContextProvider>
);

// The capture harness freezes the page clock, so framer-motion's dialog entry
// animation never progresses past its initial frame. Force the final "open"
// styles via the kit's className hooks.
const forceOpenStyles = (
    <style>
        {
            '.ds-force-open { opacity: 1 !important; transform: none !important; }'
        }
    </style>
);

// "What to expect" details shown before entering the create-DAO wizard.
export const Default = () => (
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
export const WithInfoLink = () => (
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
);
