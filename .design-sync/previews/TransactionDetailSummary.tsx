import { GukModulesProvider, TransactionDetailSummary } from '@aragon/gov-ui-kit';

export const ActiveProcess = () => (
    <GukModulesProvider>
        <TransactionDetailSummary
            chainId={1}
            date={1698432100000}
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
    </GukModulesProvider>
);

export const InactiveProcess = () => (
    <GukModulesProvider>
        <TransactionDetailSummary
            chainId={1}
            date={1697040000000}
            executedBy={{ address: '0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786' }}
            totalActions={2}
            transactionHash="0x8f5b7c2f2ad5e304bd53a4a8bcbd11a4a58ab48b93c6e7f4e14a3d3c3b7f90aa"
        />
    </GukModulesProvider>
);

export const PluginExecutor = () => (
    <GukModulesProvider>
        <TransactionDetailSummary
            chainId={1}
            date={1698000000000}
            executedBy={{
                address: '0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5',
                label: 'Token Voting',
            }}
            totalActions={1}
            transactionHash="0x1c9a4d7b0f3e2a5c8b6d4f1e9a7c5b3d2f0e8a6c4b2d0f9e7a5c3b1d8f6e4a2c"
        />
    </GukModulesProvider>
);
