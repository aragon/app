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
] as const;

export const lockToVoteAbi = [
    {
        type: 'function',
        inputs: [
            { name: '_proposalId', type: 'uint256' },
            { name: '_voter', type: 'address' },
            { name: '_voteOption', type: 'uint8' },
            { name: '_newVotingPower', type: 'uint256' },
        ],
        name: 'vote',
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;
