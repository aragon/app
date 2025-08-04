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
