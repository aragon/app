import { GukModulesProvider, ProposalDataListItem, ProposalStatus } from '@aragon/gov-ui-kit';

export const Default = () => (
    <GukModulesProvider>
        <ProposalDataListItem.Structure
            date={1752345600000}
            status={ProposalStatus.ACCEPTED}
            title="Fund the Q3 grants program"
            summary="Allocate 50,000 USDC from the treasury to the community grants program for the third quarter."
            publisher={{ address: '0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD' }}
        />
    </GukModulesProvider>
);

export const ActiveMultiBody = () => (
    <GukModulesProvider>
        <ProposalDataListItem.Structure
            date={1752950400000}
            status={ProposalStatus.ACTIVE}
            statusContext="Stage 1"
            title="Partner with WalletConnect on social media"
            summary="Round 1 of the community engagement strategy with the marketing team partnership."
            id="PIP-1"
            publisher={[
                { address: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409', name: 'cgero.eth' },
                { address: '0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786', name: 'builder.eth' },
                { address: '0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5' },
            ]}
        />
    </GukModulesProvider>
);

export const Statuses = () => (
    <GukModulesProvider>
        <div className="flex w-full flex-col gap-3">
            <ProposalDataListItem.Structure
                date={1752345600000}
                status={ProposalStatus.PENDING}
                title="Upgrade the governance plugin"
                summary="Migrate the DAO to the latest token voting plugin release."
                publisher={{ address: '0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD' }}
            />
            <ProposalDataListItem.Structure
                date={1699999999000}
                status={ProposalStatus.EXECUTED}
                title="Renew the security audit retainer"
                summary="Extend the audit agreement for another six months."
                publisher={{ address: '0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786', name: 'security.eth' }}
            />
            <ProposalDataListItem.Structure
                date={1698000000000}
                status={ProposalStatus.REJECTED}
                title="Increase quorum to 20%"
                summary="Raise minimum participation for all future proposals."
                publisher={{ address: '0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5' }}
            />
        </div>
    </GukModulesProvider>
);
