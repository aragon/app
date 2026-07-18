import {
    AutocompleteInput,
    DebugContextProvider,
    enTranslations,
    IconType,
    TranslationsProvider,
} from '@aragon/gov-ui-kit';

const AppProviders = (props: { children?: React.ReactNode }) => (
    <DebugContextProvider>
        <TranslationsProvider translations={enTranslations as never}>{props.children}</TranslationsProvider>
    </DebugContextProvider>
);

const actionItems = [
    { icon: IconType.WITHDRAW, id: 'transfer', name: 'Transfer assets', info: 'Treasury' },
    { icon: IconType.SETTINGS, id: 'metadata', name: 'Update DAO metadata', info: 'Settings' },
    { icon: IconType.APP_MEMBERS, id: 'members', name: 'Manage members', info: 'Governance' },
    { icon: IconType.BLOCKCHAIN_SMARTCONTRACT, id: 'custom', name: 'Custom contract call', info: 'Advanced' },
];

const actionGroups = [
    { id: 'treasury', info: 'Move funds out of the DAO treasury', name: 'Treasury' },
    { id: 'governance', info: 'Change how the DAO makes decisions', name: 'Governance' },
];

export const Default = () => (
    <AppProviders>
        <AutocompleteInput
            helpText="Search for an action to add to the proposal."
            items={actionItems}
            label="Add action"
            placeholder="Search actions, contracts or addresses…"
            selectItemLabel="Select action"
        />
    </AppProviders>
);

export const WithGroups = () => (
    <AppProviders>
        <AutocompleteInput
            groups={actionGroups}
            items={actionItems.map((item, index) => ({
                ...item,
                groupId: index < 2 ? 'treasury' : 'governance',
            }))}
            label="Proposal action"
            placeholder="What should this proposal do?"
            selectItemLabel="Select action"
        />
    </AppProviders>
);

export const Critical = () => (
    <AppProviders>
        <AutocompleteInput
            alert={{ message: 'No action matches this search.', variant: 'critical' }}
            items={actionItems}
            label="Add action"
            placeholder="Search actions…"
            selectItemLabel="Select action"
            variant="critical"
        />
    </AppProviders>
);
