/**
 * Minimal ABI of the Alchemix token-voting build (fork of TokenVoting) supporting delegate vote overrides.
 * (see https://github.com/aragon/alchemix-contracts)
 */
export const alchemixTokenVotingAbi = [
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
    {
        type: 'function',
        name: 'canOverrideVote',
        inputs: [
            { name: '_proposalId', type: 'uint256' },
            { name: '_account', type: 'address' },
            { name: '_voteOption', type: 'uint8' },
        ],
        outputs: [
            { name: '', type: 'bool' },
            { name: '', type: 'uint8' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getVoteRecord',
        inputs: [
            { name: '_proposalId', type: 'uint256' },
            { name: '_account', type: 'address' },
        ],
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'voteOption', type: 'uint8' },
                    { name: 'votingPower', type: 'uint256' },
                    { name: 'reduction', type: 'uint256' },
                    { name: 'hasOverridden', type: 'bool' },
                    { name: 'votedWithDelegatedVp', type: 'bool' },
                ],
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getAccountSnapshot',
        inputs: [
            { name: '_proposalId', type: 'uint256' },
            { name: '_account', type: 'address' },
            { name: '_override', type: 'bool' },
        ],
        outputs: [
            {
                name: 'params',
                type: 'tuple',
                components: [
                    { name: 'delegatee', type: 'address' },
                    { name: 'isOverride', type: 'bool' },
                    { name: 'votingPower', type: 'uint256' },
                    { name: 'delegatedVp', type: 'uint256' },
                    { name: 'reduction', type: 'uint256' },
                    { name: 'effectiveVp', type: 'uint256' },
                ],
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'overrideVote',
        inputs: [
            { name: '_proposalId', type: 'uint256' },
            { name: '_voteOption', type: 'uint8' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'voteAndOverride',
        inputs: [
            { name: '_proposalId', type: 'uint256' },
            { name: '_voteOption', type: 'uint8' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;
