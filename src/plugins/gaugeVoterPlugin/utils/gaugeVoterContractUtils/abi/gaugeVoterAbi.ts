/**
 * ABI for GaugeVoter contract.
 * Contains functions needed to read user voting power and votes.
 */
export const gaugeVoterAbi = [
    {
        type: 'function',
        name: 'votingPower',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getUserVotes',
        inputs: [
            { name: 'account', type: 'address' },
            { name: 'gauge', type: 'address' },
        ],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'usedVotingPower',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;
