/**
 * Minimal ABI of the Alchemix objection plugin used on the second stage of the staged proposal process.
 * (see https://github.com/aragon/alchemix-contracts)
 */
export const alchemixObjectionAbi = [
    {
        type: 'function',
        name: 'getVoteOption',
        inputs: [
            { name: '_proposalId', type: 'uint256' },
            { name: '_voter', type: 'address' },
        ],
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getPastVotesAtProposalSnapshot',
        inputs: [
            { name: '_proposalId', type: 'uint256' },
            { name: '_account', type: 'address' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'canVote',
        inputs: [
            { name: '_proposalId', type: 'uint256' },
            { name: '_account', type: 'address' },
            { name: '_voteOption', type: 'uint8' },
        ],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
    },
] as const;
