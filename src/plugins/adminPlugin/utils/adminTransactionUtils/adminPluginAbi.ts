export const adminPluginAbi = [
    {
        type: 'function',
        inputs: [
            { name: '_metadata', internalType: 'bytes', type: 'bytes' },
            {
                name: '_actions',
                internalType: 'struct IDAO.Action[]',
                type: 'tuple[]',
                components: [
                    { name: 'to', internalType: 'address', type: 'address' },
                    { name: 'value', internalType: 'uint256', type: 'uint256' },
                    { name: 'data', internalType: 'bytes', type: 'bytes' },
                ],
            },
            { internalType: 'uint64', type: 'uint64' },
            { internalType: 'uint64', type: 'uint64' },
            { name: '_data', internalType: 'bytes', type: 'bytes' },
        ],
        name: 'createProposal',
        outputs: [{ name: 'proposalId', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'nonpayable',
    },
];
