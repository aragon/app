import { GukModulesProvider, VoteDataListItem } from '@aragon/gov-ui-kit';

export const Default = () => (
    <GukModulesProvider>
        <VoteDataListItem.Structure
            tokenSymbol="ANT"
            voteIndicator="yes"
            voter={{
                address: '0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD',
                name: 'cgero.eth',
            }}
            votingPower={480_000}
        />
    </GukModulesProvider>
);

export const VoteChoices = () => (
    <GukModulesProvider>
        <div className="flex w-full flex-col gap-3">
            <VoteDataListItem.Structure
                tokenSymbol="ANT"
                voteIndicator="yes"
                voter={{
                    address: '0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786',
                    name: 'builder.eth',
                }}
                votingPower={1_200_000}
            />
            <VoteDataListItem.Structure
                tokenSymbol="ANT"
                voteIndicator="no"
                voter={{
                    address: '0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5',
                }}
                votingPower={56_000}
            />
            <VoteDataListItem.Structure
                tokenSymbol="ANT"
                voteIndicator="abstain"
                voter={{
                    address: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409',
                }}
                votingPower={9800}
            />
        </div>
    </GukModulesProvider>
);

export const Veto = () => (
    <GukModulesProvider>
        <VoteDataListItem.Structure
            isVeto={true}
            voteIndicator="veto"
            voteIndicatorDescription="on Stage 2"
            voter={{
                address: '0x02782C0b47DcCd8b74a5f0Cc4dA6a68e00a4e0a8',
                name: 'guardian.eth',
            }}
        />
    </GukModulesProvider>
);

export const Loading = () => (
    <GukModulesProvider>
        <VoteDataListItem.Skeleton />
    </GukModulesProvider>
);
