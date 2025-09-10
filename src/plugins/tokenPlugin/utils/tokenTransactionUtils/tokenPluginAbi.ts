export const tokenPluginSetupAbi = [
    {
        name: 'votingSettings',
        type: 'tuple',
        components: [
            { name: 'votingMode', type: 'uint8' },
            { name: 'supportThreshold', type: 'uint32' },
            { name: 'minParticipation', type: 'uint32' },
            { name: 'minDuration', type: 'uint64' },
            { name: 'minProposerVotingPower', type: 'uint256' },
        ],
    },
    {
        name: 'tokenSettings',
        type: 'tuple',
        components: [
            { name: 'addr', type: 'address' },
            { name: 'name', type: 'string' },
            { name: 'symbol', type: 'string' },
        ],
    },
    {
        name: 'mintSettings',
        type: 'tuple',
        components: [
            { name: 'receivers', type: 'address[]' },
            { name: 'amounts', type: 'uint256[]' },
        ],
    },
    {
        name: 'targetConfig',
        type: 'tuple',
        components: [
            { name: 'target', type: 'address' },
            { name: 'operation', type: 'uint8' },
        ],
    },
    { name: 'minApprovals', type: 'uint256' },
    { name: 'pluginMetadata', type: 'bytes' },
] as const;

export const tokenPluginPrepareUpdateAbi = [
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

export const tokenPluginAbi = [
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
