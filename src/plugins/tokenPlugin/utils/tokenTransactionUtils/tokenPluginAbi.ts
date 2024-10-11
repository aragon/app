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
