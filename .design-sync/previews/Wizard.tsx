import {
    BlockNavigationContextProvider,
    DebugContextProvider,
    enTranslations,
    InputText,
    TextArea,
    TranslationsProvider,
    Wizard,
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

const steps = [
    { id: 'network', order: 0, meta: { name: 'Network' } },
    { id: 'metadata', order: 1, meta: { name: 'Describe your DAO' } },
    { id: 'governance', order: 2, meta: { name: 'Governance' } },
];

export const Default = () => (
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
);
