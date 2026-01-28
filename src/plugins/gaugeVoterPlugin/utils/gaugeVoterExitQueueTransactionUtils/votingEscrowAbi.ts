/**
 * ABI for VotingEscrow contract functions related to tokenId management.
 * VotingEscrow implements ERC-721 where each lock is represented as an NFT with a tokenId.
 */
export const votingEscrowAbi = [
    {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'owner', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'tokenOfOwnerByIndex',
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'index', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'locked',
        inputs: [{ name: '_tokenId', type: 'uint256' }],
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'amount', type: 'int128' },
                    { name: 'end', type: 'uint256' },
                ],
            },
        ],
        stateMutability: 'view',
    },
] as const;
