import {
    DebugContextProvider,
    enTranslations,
    NetworkSwitchAlert,
    TranslationsProvider,
} from '@aragon/gov-ui-kit';

const AppProviders = (props: { children?: React.ReactNode }) => (
    <DebugContextProvider>
        <TranslationsProvider translations={enTranslations as never}>
            {props.children}
        </TranslationsProvider>
    </DebugContextProvider>
);

export const EthereumMainnet = () => (
    <AppProviders>
        <div className="max-w-lg">
            <NetworkSwitchAlert isCrossNetworkTransaction={true} networkName="Ethereum Mainnet" />
        </div>
    </AppProviders>
);

export const Base = () => (
    <AppProviders>
        <div className="max-w-lg">
            <NetworkSwitchAlert isCrossNetworkTransaction={true} networkName="Base" />
        </div>
    </AppProviders>
);
