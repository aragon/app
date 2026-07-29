export const lockToVoteAbi = [
    {
        type: 'function',
        inputs: [
            { name: '_metadata', type: 'bytes' },
            {
                name: '_actions',
                internalType: 'struct IDAO.Action[]',
                type: 'tuple[]',
                components: [
                    { name: 'to', type: 'address' },
                    { name: 'value', type: 'uint256' },
                    { name: 'data', type: 'bytes' },
                ],
            },
            { name: '_startDate', type: 'uint64' },
            { name: '_endDate', type: 'uint64' },
            { name: '_data', type: 'bytes' },
        ],
        name: 'createProposal',
        outputs: [{ name: 'proposalId', type: 'uint256' }],
        stateMutability: 'nonpayable',
    },
] as const;

export const lockManagerAbi = [
    {
        type: 'function',
        inputs: [
            { name: '_proposalId', type: 'uint256' },
            { name: '_voteOption', type: 'uint8' },
            { name: '_amount', type: 'uint256' },
        ],
        name: 'lockAndVote',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: '_proposalId', type: 'uint256' },
            { name: '_voteOption', type: 'uint8' },
        ],
        name: 'vote',
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;
