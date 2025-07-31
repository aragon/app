export const lockToVotePluginSetupAbi = [
    {
        name: 'token',
        type: 'address',
    },
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
    {
        name: 'pluginMetadata',
        type: 'bytes',
    },
    {
        name: 'createProposalCaller',
        type: 'address',
    },
    {
        name: 'executeCaller',
        type: 'address',
    },
    {
        name: 'targetConfig',
        type: 'tuple',
        components: [
            { name: 'target', type: 'address' },
            { name: 'operation', type: 'uint8' },
        ],
    },
] as const;

export const lockToVotePluginPrepareUpdateAbi = [
    { name: 'minApprovals', type: 'uint256' },
    {
        name: 'targetConfig',
        type: 'tuple',
        components: [
            { name: 'target', type: 'address' },
            { name: 'operation', type: 'uint8' },
        ],
    },
    { name: 'pluginMetadata', type: 'bytes' },
] as const;

export const lockToVotePluginAbi = [
    {
        type: 'function',
        inputs: [
            { name: '_metadata', internalType: 'bytes', type: 'bytes' },
            {
                name: '_actions',
                internalType: 'struct IDAO.Action[]',
                type: 'tuple[]',
                components: [
                    { name: 'to', internalType: 'address', type: 'address' },
                    { name: 'value', internalType: 'uint256', type: 'uint256' },
                    { name: 'data', internalType: 'bytes', type: 'bytes' },
                ],
            },
            { name: '_allowFailureMap', internalType: 'uint256', type: 'uint256' },
            { name: '_startDate', internalType: 'uint64', type: 'uint64' },
            { name: '_endDate', internalType: 'uint64', type: 'uint64' },
            {
                name: '_voteOption',
                internalType: 'enum IMajorityVoting.VoteOption',
                type: 'uint8',
            },
            { name: '_tryEarlyExecution', internalType: 'bool', type: 'bool' },
        ],
        name: 'createProposal',
        outputs: [{ name: 'proposalId', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: '_proposalId', internalType: 'uint256', type: 'uint256' },
            {
                name: '_voteOption',
                internalType: 'enum IMajorityVoting.VoteOption',
                type: 'uint8',
            },
            { name: '_tryEarlyExecution', internalType: 'bool', type: 'bool' },
        ],
        name: 'vote',
        outputs: [],
        stateMutability: 'nonpayable',
    },
];
