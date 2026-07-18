import {
    DebugContextProvider,
    enTranslations,
    FormWrapper,
    ResourcesInput,
    TranslationsProvider,
} from '@aragon/gov-ui-kit';

const AppForm = (props: { children?: React.ReactNode; defaultValues?: Record<string, unknown> }) => (
    <DebugContextProvider>
        <TranslationsProvider translations={enTranslations as never}>
            <FormWrapper defaultValues={props.defaultValues}>{props.children}</FormWrapper>
        </TranslationsProvider>
    </DebugContextProvider>
);

export const Default = () => (
    <AppForm>
        <ResourcesInput
            helpText="Link the discussions, docs or forum posts that give this proposal context."
            name="resources"
        />
    </AppForm>
);

export const Filled = () => (
    <AppForm
        defaultValues={{
            resources: [
                { name: 'Forum discussion', url: 'https://forum.aragon.org/t/treasury-diversification/412' },
                { name: 'Governance docs', url: 'https://docs.aragon.org/governance' },
            ],
        }}
    >
        <ResourcesInput
            helpText="Add links so members can review the full context before voting."
            name="resources"
        />
    </AppForm>
);
