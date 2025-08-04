export const lockToVotePluginSetupAbi = [
    {
        name: 'params',
        type: 'tuple',
        components: [
            { name: 'token', type: 'address' },
            {
                name: 'votingSettings',
                type: 'tuple',
                components: [
                    { name: 'votingMode', type: 'uint8' },
                    { name: 'supportThresholdRatio', type: 'uint256' },
                    { name: 'minParticipationRatio', type: 'uint256' },
                    { name: 'minApprovalRatio', type: 'uint256' },
                    { name: 'proposalDuration', type: 'uint256' },
                    { name: 'minProposerVotingPower', type: 'uint256' },
                ],
            },
            { name: 'pluginMetadata', type: 'bytes' },
            { name: 'createProposalCaller', type: 'address' },
            { name: 'executeCaller', type: 'address' },
            { name: 'targetConfig', type: 'bytes' },
        ],
    },
];
