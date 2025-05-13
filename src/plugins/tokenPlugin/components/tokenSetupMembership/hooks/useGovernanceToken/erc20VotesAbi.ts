/**
 * ERC20Votes ABI with the methods we need to check governance compatibility.
 */
export const erc20VotesAbi = [
    {
        type: 'function',
        name: 'getPastTotalSupply',
        stateMutability: 'view',
        inputs: [
            {
                name: 'blockNumber',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'getVotes',
        stateMutability: 'view',
        inputs: [
            {
                name: 'account',
                type: 'address',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'getPastVotes',
        stateMutability: 'view',
        inputs: [
            {
                name: 'account',
                type: 'address',
            },
            {
                name: 'blockNumber',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'delegates',
        stateMutability: 'view',
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
    },
] as const;
