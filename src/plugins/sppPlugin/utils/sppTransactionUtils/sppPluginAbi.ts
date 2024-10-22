export const sppPluginAbi = [
    {
        type: 'function',
        name: 'createProposal',
        inputs: [
            {
                name: '_metadata',
                type: 'bytes',
                internalType: 'bytes',
            },
            {
                name: '_actions',
                type: 'tuple[]',
                internalType: 'struct Action[]',
                components: [
                    {
                        name: 'to',
                        type: 'address',
                        internalType: 'address',
                    },
                    {
                        name: 'value',
                        type: 'uint256',
                        internalType: 'uint256',
                    },
                    {
                        name: 'data',
                        type: 'bytes',
                        internalType: 'bytes',
                    },
                ],
            },
            {
                name: '_allowFailureMap',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: '_startDate',
                type: 'uint64',
                internalType: 'uint64',
            },
            {
                name: '_proposalParams',
                type: 'bytes[][]',
                internalType: 'bytes[][]',
            },
        ],
        outputs: [
            {
                name: 'proposalId',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
    },
];
