import { GukModulesProvider, ProposalVotingProgress } from '@aragon/gov-ui-kit';

export const TokenVotingProgress = () => (
    <GukModulesProvider>
        <div style={{ width: '100%', minWidth: 384, maxWidth: 560 }}>
            <ProposalVotingProgress.Container>
                <ProposalVotingProgress.Item
                    description={{ value: '7.1M', text: 'of 9.4M ARA' }}
                    name="Support"
                    showPercentage={true}
                    showStatus={true}
                    thresholdIndicator={50}
                    value={75}
                />
            </ProposalVotingProgress.Container>
        </div>
    </GukModulesProvider>
);

export const MultisigApprovalProgress = () => (
    <GukModulesProvider>
        <div style={{ width: '100%', minWidth: 384, maxWidth: 560 }}>
            <ProposalVotingProgress.Container>
                <ProposalVotingProgress.Item
                    description={{ value: '2', text: 'of 5 members' }}
                    name="Minimum Approval"
                    showPercentage={false}
                    showStatus={true}
                    thresholdIndicator={50}
                    value={40}
                />
            </ProposalVotingProgress.Container>
        </div>
    </GukModulesProvider>
);

export const MultipleCriteria = () => (
    <GukModulesProvider>
        <div style={{ width: '100%', minWidth: 384, maxWidth: 560 }}>
            <ProposalVotingProgress.Container>
                <ProposalVotingProgress.Item
                    description={{
                        value: '6.4M',
                        text: 'of 9.4M ARA in favour',
                    }}
                    name="Support"
                    showPercentage={true}
                    showStatus={true}
                    thresholdIndicator={50}
                    value={68}
                />
                <ProposalVotingProgress.Item
                    description={{ value: '1.2M', text: 'of 9.4M ARA' }}
                    name="Minimum participation"
                    showPercentage={true}
                    showStatus={true}
                    thresholdIndicator={15}
                    value={12}
                />
            </ProposalVotingProgress.Container>
        </div>
    </GukModulesProvider>
);
