import {
    GukModulesProvider,
    ProposalDataListItem,
    ProposalStatus,
} from '@aragon/gov-ui-kit';

export const Default = () => (
    <GukModulesProvider>
        <ProposalDataListItem.Structure
            date={1_752_345_600_000}
            publisher={{
                address: '0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD',
            }}
            status={ProposalStatus.ACCEPTED}
            summary="Allocate 50,000 USDC from the treasury to the community grants program for the third quarter."
            title="Fund the Q3 grants program"
        />
    </GukModulesProvider>
);

export const ActiveMultiBody = () => (
    <GukModulesProvider>
        <ProposalDataListItem.Structure
            date={1_752_950_400_000}
            id="PIP-1"
            publisher={[
                {
                    address: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409',
                    name: 'cgero.eth',
                },
                {
                    address: '0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786',
                    name: 'builder.eth',
                },
                { address: '0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5' },
            ]}
            status={ProposalStatus.ACTIVE}
            statusContext="Stage 1"
            summary="Round 1 of the community engagement strategy with the marketing team partnership."
            title="Partner with WalletConnect on social media"
        />
    </GukModulesProvider>
);

export const Statuses = () => (
    <GukModulesProvider>
        <div className="flex w-full flex-col gap-3">
            <ProposalDataListItem.Structure
                date={1_752_345_600_000}
                publisher={{
                    address: '0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD',
                }}
                status={ProposalStatus.PENDING}
                summary="Migrate the DAO to the latest token voting plugin release."
                title="Upgrade the governance plugin"
            />
            <ProposalDataListItem.Structure
                date={1_699_999_999_000}
                publisher={{
                    address: '0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786',
                    name: 'security.eth',
                }}
                status={ProposalStatus.EXECUTED}
                summary="Extend the audit agreement for another six months."
                title="Renew the security audit retainer"
            />
            <ProposalDataListItem.Structure
                date={1_698_000_000_000}
                publisher={{
                    address: '0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5',
                }}
                status={ProposalStatus.REJECTED}
                summary="Raise minimum participation for all future proposals."
                title="Increase quorum to 20%"
            />
        </div>
    </GukModulesProvider>
);
