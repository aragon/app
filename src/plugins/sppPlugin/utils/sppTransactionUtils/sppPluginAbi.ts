export const sppPluginAbi = [
    {
        type: 'function',
        name: 'createProposal',
        inputs: [
            { name: '_metadata', type: 'bytes' },
            {
                name: '_actions',
                type: 'tuple[]',
                components: [
                    { name: 'to', type: 'address' },
                    { name: 'value', type: 'uint256' },
                    { name: 'data', type: 'bytes' },
                ],
            },
            { name: '_allowFailureMap', type: 'uint128' },
            { name: '_startDate', type: 'uint64' },
            { name: '_proposalParams', type: 'bytes[][]' },
        ],
    },
];
