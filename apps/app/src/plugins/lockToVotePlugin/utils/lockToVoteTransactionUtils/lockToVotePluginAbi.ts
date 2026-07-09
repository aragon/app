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
                    { name: 'supportThresholdRatio', type: 'uint32' },
                    { name: 'minParticipationRatio', type: 'uint32' },
                    { name: 'minApprovalRatio', type: 'uint32' },
                    { name: 'proposalDuration', type: 'uint64' },
                    { name: 'minProposerVotingPower', type: 'uint256' },
                ],
            },
            { name: 'pluginMetadata', type: 'bytes' },
            { name: 'createProposalCaller', type: 'address' },
            { name: 'executeCaller', type: 'address' },
            {
                name: 'targetConfig',
                type: 'tuple',
                components: [
                    { name: 'target', type: 'address' },
                    { name: 'operation', type: 'uint8' },
                ],
            },
        ],
    },
] as const;
