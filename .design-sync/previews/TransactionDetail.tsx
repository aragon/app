import {
    Dialog,
    GukModulesProvider,
    TransactionDetail,
    TransactionDetailSummary,
} from '@aragon/gov-ui-kit';

const noop = () => undefined;

// The capture harness freezes the clock (page.clock.setFixedTime), so framer-motion never advances
// past the dialog's initial "closed" frame (opacity 0, scale .88, y 100). Force the open-state
// styles: !important declarations win over framer-motion's inline styles.
const forceDialogOpenCss = `
    [data-state='open'] { opacity: 1 !important; transform: none !important; }
`;

const ForceDialogOpen = () => <style>{forceDialogOpenCss}</style>;

export const ExecutionDialog = () => (
    <GukModulesProvider>
        <ForceDialogOpen />
        <Dialog.Root open={true} useFocusTrap={false}>
            <TransactionDetail.Root onClose={noop}>
                <TransactionDetailSummary
                    chainId={1}
                    date={1_698_432_100_000}
                    executedBy={{
                        address: '0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD',
                        helptext: 'SPP v1.3',
                        href: '/processes/core',
                        label: 'Core',
                    }}
                    proposalHref="/proposals/CRE-54"
                    proposalId="CRE-54"
                    totalActions={5}
                    transactionHash="0x9aaa5c2e7f1d3b8a6c4e0f2d9b7a5c3e1f8d6b4a2c0e9f7d5b3a1c8e6f4d2b0c"
                />
            </TransactionDetail.Root>
        </Dialog.Root>
    </GukModulesProvider>
);

export const CustomTitle = () => (
    <GukModulesProvider>
        <ForceDialogOpen />
        <Dialog.Root open={true} useFocusTrap={false}>
            <TransactionDetail.Root onClose={noop} title="Treasury withdrawal">
                <TransactionDetailSummary
                    chainId={1}
                    date={1_697_040_000_000}
                    executedBy={{
                        address: '0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786',
                    }}
                    totalActions={2}
                    transactionHash="0x8f5b7c2f2ad5e304bd53a4a8bcbd11a4a58ab48b93c6e7f4e14a3d3c3b7f90aa"
                />
            </TransactionDetail.Root>
        </Dialog.Root>
    </GukModulesProvider>
);
