import {
    AppTransactionStatus,
    BlockNavigationContextProvider,
    DebugContextProvider,
    enTranslations,
    IconType,
    TranslationsProvider,
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

const Wrapper = (props: { children?: React.ReactNode }) => (
    <div style={{ maxWidth: 480, width: '100%' }}>{props.children}</div>
);

// Publish-proposal transaction mid-flight: prepare done, wallet approval
// pending, confirmation not started. Multi-phase info header (Phase 2 of 3).
export const Default = () => (
    <AppProviders>
        <Wrapper>
            <AppTransactionStatus.Container
                steps={[]}
                transactionInfo={{
                    title: 'Publish proposal',
                    current: 2,
                    total: 3,
                }}
            >
                <AppTransactionStatus.Step
                    id="prepare"
                    meta={{ label: 'Prepare transaction', state: 'success' }}
                    order={0}
                />
                <AppTransactionStatus.Step
                    id="approve"
                    meta={{
                        label: 'Approve in wallet',
                        state: 'pending',
                        addon: {
                            label: 'Wallet',
                            icon: IconType.BLOCKCHAIN_WALLET,
                        },
                    }}
                    order={1}
                />
                <AppTransactionStatus.Step
                    id="confirm"
                    meta={{ label: 'Onchain confirmation', state: 'idle' }}
                    order={2}
                />
            </AppTransactionStatus.Container>
        </Wrapper>
    </AppProviders>
);

// Failed transaction: the error step swaps its label for the errorLabel and a
// warning step surfaces a network mismatch.
export const ErrorState = () => (
    <AppProviders>
        <Wrapper>
            <AppTransactionStatus.Container
                steps={[]}
                transactionInfo={{ title: 'Execute proposal actions' }}
            >
                <AppTransactionStatus.Step
                    id="network"
                    meta={{
                        label: 'Switch network',
                        warningLabel: 'Wrong network selected in wallet',
                        state: 'warning',
                    }}
                    order={0}
                />
                <AppTransactionStatus.Step
                    id="submit"
                    meta={{
                        label: 'Submit transaction',
                        errorLabel: 'Transaction rejected in wallet',
                        state: 'error',
                    }}
                    order={1}
                />
                <AppTransactionStatus.Step
                    id="confirm"
                    meta={{ label: 'Onchain confirmation', state: 'idle' }}
                    order={2}
                />
            </AppTransactionStatus.Container>
        </Wrapper>
    </AppProviders>
);

// Completed flow: every step succeeded and the confirmation step links out to
// the block explorer.
export const Success = () => (
    <AppProviders>
        <Wrapper>
            <AppTransactionStatus.Container steps={[]}>
                <AppTransactionStatus.Step
                    id="prepare"
                    meta={{ label: 'Prepare transaction', state: 'success' }}
                    order={0}
                />
                <AppTransactionStatus.Step
                    id="approve"
                    meta={{ label: 'Approve in wallet', state: 'success' }}
                    order={1}
                />
                <AppTransactionStatus.Step
                    id="confirm"
                    meta={{
                        label: 'Onchain confirmation',
                        state: 'success',
                        addon: {
                            label: 'View on explorer',
                            href: 'https://etherscan.io/tx/0x1234',
                        },
                    }}
                    order={2}
                />
            </AppTransactionStatus.Container>
        </Wrapper>
    </AppProviders>
);
