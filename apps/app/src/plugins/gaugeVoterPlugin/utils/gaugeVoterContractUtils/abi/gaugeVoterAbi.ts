/**
 * ABI for AddressGaugeVoter contract.
 * Contains functions needed to read gauge voting data by address.
 */
export const gaugeVoterAbi = [
    // User voting data
    {
        type: 'function',
        name: 'usedVotingPower',
        inputs: [{ name: '_address', type: 'address' }],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'votes',
        inputs: [
            { name: '_address', type: 'address' },
            { name: '_gauge', type: 'address' },
        ],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'gaugesVotedFor',
        inputs: [{ name: '_address', type: 'address' }],
        outputs: [{ type: 'address[]' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'isVoting',
        inputs: [{ name: '_address', type: 'address' }],
        outputs: [{ type: 'bool' }],
        stateMutability: 'view',
    },

    // Gauge data
    {
        type: 'function',
        name: 'gaugeVotes',
        inputs: [{ name: '_address', type: 'address' }],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'gaugeExists',
        inputs: [{ name: '_gauge', type: 'address' }],
        outputs: [{ type: 'bool' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'isActive',
        inputs: [{ name: '_gauge', type: 'address' }],
        outputs: [{ type: 'bool' }],
        stateMutability: 'view',
    },

    // Global state
    {
        type: 'function',
        name: 'totalVotingPowerCast',
        inputs: [],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },

    // Contract references
    {
        type: 'function',
        name: 'escrow',
        inputs: [],
        outputs: [{ type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'ivotesAdapter',
        inputs: [],
        outputs: [{ type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'enableUpdateVotingPowerHook',
        inputs: [],
        outputs: [{ type: 'bool' }],
        stateMutability: 'view',
    },

    // Epoch & time functions
    {
        type: 'function',
        name: 'votingActive',
        inputs: [],
        outputs: [{ type: 'bool' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'epochId',
        inputs: [],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getWriteEpochId',
        inputs: [],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'currentEpochStart',
        inputs: [],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'epochStart',
        inputs: [],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'epochVoteStart',
        inputs: [],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'epochVoteEnd',
        inputs: [],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },

    // Write functions (for mutations)
    {
        type: 'function',
        name: 'vote',
        inputs: [
            {
                name: '_votes',
                type: 'tuple[]',
                components: [
                    { name: 'weight', type: 'uint256' },
                    { name: 'gauge', type: 'address' },
                ],
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'reset',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;
