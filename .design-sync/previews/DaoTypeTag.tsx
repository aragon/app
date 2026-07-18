import {
    DaoTypeTag,
    DebugContextProvider,
    enTranslations,
    TranslationsProvider,
} from '@aragon/gov-ui-kit';

const AppProviders = (props: { children?: React.ReactNode }) => (
    <DebugContextProvider>
        <TranslationsProvider translations={enTranslations as never}>
            {props.children}
        </TranslationsProvider>
    </DebugContextProvider>
);

export const Main = () => (
    <AppProviders>
        <div className="flex">
            <DaoTypeTag type="main" />
        </div>
    </AppProviders>
);

export const Sub = () => (
    <AppProviders>
        <div className="flex">
            <DaoTypeTag type="sub" />
        </div>
    </AppProviders>
);

export const BothTypes = () => (
    <AppProviders>
        <div className="flex items-center gap-2">
            <DaoTypeTag type="main" />
            <DaoTypeTag type="sub" />
        </div>
    </AppProviders>
);
