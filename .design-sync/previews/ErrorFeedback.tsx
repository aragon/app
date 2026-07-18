import {
    DebugContextProvider,
    enTranslations,
    ErrorFeedback,
    TranslationsProvider,
} from '@aragon/gov-ui-kit';

const AppProviders = (props: { children?: React.ReactNode }) => (
    <DebugContextProvider>
        <TranslationsProvider translations={enTranslations as never}>
            {props.children}
        </TranslationsProvider>
    </DebugContextProvider>
);

export const Default = () => (
    <AppProviders>
        <ErrorFeedback />
    </AppProviders>
);

export const CustomAction = () => (
    <AppProviders>
        <ErrorFeedback
            hideReportButton={true}
            illustration="NOT_FOUND"
            primaryButton={{ label: 'Back to proposals', href: '/' }}
        />
    </AppProviders>
);
