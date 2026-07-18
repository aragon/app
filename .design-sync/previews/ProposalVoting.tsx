import {
    Button,
    DataList,
    GukModulesProvider,
    Progress,
    ProposalStatus,
    ProposalVoting,
    ProposalVotingTab,
    Tabs,
    VoteDataListItem,
} from '@aragon/gov-ui-kit';

// Harness clock is frozen around mid-2024: past for completed things, future for deadlines.
const PAST_START = 1698000000000; // Oct 2023 -> "x months ago"
const FUTURE_END = 1752345600000; // Jul 2025 -> "1 year left"

const safeBrand = {
    label: 'Safe{Wallet}',
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2312FF80'/%3E%3Cpath d='M32 16a16 16 0 1 0 0 32 16 16 0 0 0 0-32zm0 22a6 6 0 1 1 0-12 6 6 0 0 1 0 12z' fill='%23121312'/%3E%3C/svg%3E",
};

const tokenVotes = [
    {
        voter: { address: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409', name: 'cgero.eth' },
        isDelegate: true,
        voteIndicator: 'yes' as const,
        votingPower: 47_289_374,
        tokenSymbol: 'ARA',
    },
    {
        voter: { address: '0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5', name: 'sio.eth' },
        voteIndicator: 'yes' as const,
        votingPower: 1_238_948,
        tokenSymbol: 'ARA',
    },
    {
        voter: { address: '0xF6ad40D5D477ade0C640eaD49944bdD0AA1fBF05' },
        voteIndicator: 'no' as const,
        votingPower: 849_500,
        tokenSymbol: 'ARA',
    },
];

const multisigVotes = [
    { voter: { address: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7', name: 'ens.eth' }, voteIndicator: 'approve' as const },
    { voter: { address: '0x650235a0889CAe912673AAD13Ff75d1F1A175487' }, voteIndicator: 'approve' as const },
    { voter: { address: '0xDCFfFFA68464A4AFC96EEf885844631A439cE625' }, voteIndicator: 'approve' as const },
];

const TokenVotingContent = () => (
    <>
        <ProposalVoting.BreakdownToken
            minParticipation={15}
            supportThreshold={50}
            tokenSymbol="ARA"
            tokenTotalSupply={9_451_231_259}
            totalAbstain={0}
            totalNo={849_500}
            totalYes={48_528_322}
        >
            <Button className="md:self-start" size="md" variant="primary">
                Vote on proposal
            </Button>
        </ProposalVoting.BreakdownToken>
        <ProposalVoting.Votes>
            <DataList.Root entityLabel="Votes" itemsCount={tokenVotes.length}>
                <DataList.Container>
                    {tokenVotes.map((vote) => (
                        <VoteDataListItem.Structure key={vote.voter.address} {...vote} />
                    ))}
                </DataList.Container>
                <DataList.Pagination />
            </DataList.Root>
        </ProposalVoting.Votes>
        <ProposalVoting.Details
            settings={[
                { term: 'Strategy', definition: '1 Token → 1 Vote' },
                { term: 'Voting options', definition: 'Yes, Abstain, or No' },
                { term: 'Minimum support', definition: '>50%' },
                { term: 'Minimum participation (Quorum)', definition: '≥1.42B of 9.45B ARA (≥15%)' },
                { term: 'Early execution', definition: 'Yes' },
                { term: 'Vote replacement', definition: 'No' },
                { term: 'Minimum duration', definition: '7 days' },
            ]}
        />
    </>
);

const MultisigContent = () => (
    <>
        <ProposalVoting.BreakdownMultisig approvalsAmount={multisigVotes.length} membersCount={10} minApprovals={4} />
        <ProposalVoting.Votes>
            <DataList.Root entityLabel="Votes" itemsCount={multisigVotes.length}>
                <DataList.Container>
                    {multisigVotes.map((vote) => (
                        <VoteDataListItem.Structure key={vote.voter.address} {...vote} />
                    ))}
                </DataList.Container>
                <DataList.Pagination />
            </DataList.Root>
        </ProposalVoting.Votes>
        <ProposalVoting.Details
            settings={[
                { term: 'Strategy', definition: '1 Address → 1 Vote' },
                { term: 'Voting options', definition: 'Approve' },
                { term: 'Minimum approval', definition: '4 of 10' },
            ]}
        />
    </>
);

const ExternalBodyContent = () => (
    <>
        <Tabs.Content value={ProposalVotingTab.BREAKDOWN}>External Body Breakdown</Tabs.Content>
        <ProposalVoting.Details settings={[{ term: 'Address', definition: '0xc273…74C7' }]} />
    </>
);

export const SimpleGovernance = () => (
    <GukModulesProvider>
        <div style={{ width: '100%', maxWidth: 560 }}>
            <ProposalVoting.Container endDate={FUTURE_END} status={ProposalStatus.ACTIVE}>
                <ProposalVoting.BodyContent name="0xc273…74C7" status={ProposalStatus.ACTIVE}>
                    <TokenVotingContent />
                </ProposalVoting.BodyContent>
            </ProposalVoting.Container>
        </div>
    </GukModulesProvider>
);

export const SingleStageMultisig = () => (
    <GukModulesProvider>
        <div style={{ width: '100%', maxWidth: 560 }}>
            <ProposalVoting.StageContainer activeStage="0" onStageClick={() => undefined}>
                <ProposalVoting.Stage name="Security Council Stage" status={ProposalStatus.EXPIRED}>
                    <ProposalVoting.BodyContent name="Security Council" status={ProposalStatus.EXPIRED}>
                        <MultisigContent />
                    </ProposalVoting.BodyContent>
                </ProposalVoting.Stage>
            </ProposalVoting.StageContainer>
        </div>
    </GukModulesProvider>
);

export const MultiStage = () => (
    <GukModulesProvider>
        <div style={{ width: '100%', maxWidth: 560 }}>
            <ProposalVoting.StageContainer activeStage="0" onStageClick={() => undefined}>
                <ProposalVoting.Stage
                    endDate={FUTURE_END}
                    name="Security Council Stage"
                    startDate={PAST_START}
                    status={ProposalStatus.ACTIVE}
                >
                    <ProposalVoting.BodyContent name="Security Council" status={ProposalStatus.ACTIVE}>
                        <MultisigContent />
                    </ProposalVoting.BodyContent>
                </ProposalVoting.Stage>
                <ProposalVoting.Stage name="Token Holders Stage" status={ProposalStatus.PENDING}>
                    <ProposalVoting.BodyContent name="Token Community" status={ProposalStatus.PENDING}>
                        <TokenVotingContent />
                    </ProposalVoting.BodyContent>
                </ProposalVoting.Stage>
                <ProposalVoting.Stage name="Safe Stage" status={ProposalStatus.PENDING}>
                    <ProposalVoting.BodyContent bodyBrand={safeBrand} name="0xd100…11E9" status={ProposalStatus.PENDING}>
                        <ExternalBodyContent />
                    </ProposalVoting.BodyContent>
                </ProposalVoting.Stage>
            </ProposalVoting.StageContainer>
        </div>
    </GukModulesProvider>
);

export const MultiBody = () => (
    <GukModulesProvider>
        <div style={{ width: '100%', maxWidth: 560 }}>
            <ProposalVoting.StageContainer activeStage="0" onStageClick={() => undefined}>
                <ProposalVoting.Stage
                    bodyList={['token', 'safe']}
                    endDate={FUTURE_END}
                    name="Community Stage"
                    startDate={PAST_START}
                    status={ProposalStatus.ACTIVE}
                >
                    <ProposalVoting.BodySummary>
                        <ProposalVoting.BodySummaryList>
                            <ProposalVoting.BodySummaryListItem id="token">
                                <div className="flex grow flex-col gap-3">
                                    <p className="text-neutral-800">Token Holders</p>
                                    <Progress thresholdIndicator={60} value={30} variant="neutral" />
                                    <p className="text-neutral-800">30 of 60 ARA</p>
                                </div>
                            </ProposalVoting.BodySummaryListItem>
                            <ProposalVoting.BodySummaryListItem bodyBrand={safeBrand} id="safe">
                                Founders Approval
                            </ProposalVoting.BodySummaryListItem>
                        </ProposalVoting.BodySummaryList>
                        <p className="text-center text-neutral-500 md:text-right">
                            <span className="text-neutral-800">1 body</span> required to approve
                        </p>
                    </ProposalVoting.BodySummary>
                    <ProposalVoting.BodyContent bodyId="token" name="Token Holders" status={ProposalStatus.ACTIVE}>
                        <TokenVotingContent />
                    </ProposalVoting.BodyContent>
                    <ProposalVoting.BodyContent
                        bodyBrand={safeBrand}
                        bodyId="safe"
                        hideTabs={[ProposalVotingTab.VOTES]}
                        name="founders.safe.eth"
                        status={ProposalStatus.ACTIVE}
                    >
                        <ExternalBodyContent />
                    </ProposalVoting.BodyContent>
                </ProposalVoting.Stage>
            </ProposalVoting.StageContainer>
        </div>
    </GukModulesProvider>
);
