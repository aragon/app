export const multisigPluginSetupAbi = [
    { name: 'members', type: 'address[]' },
    {
        name: 'multisigSettings',
        type: 'tuple',
        components: [
            { name: 'onlyListed', type: 'bool' },
            { name: 'minApprovals', type: 'uint16' },
        ],
    },
    {
        name: 'targetConfig',
        type: 'tuple',
        components: [
            { name: 'target', type: 'address' },
            { name: 'operation', type: 'uint8' },
        ],
    },
    { name: 'pluginMetadata', type: 'bytes' },
] as const;

export const multisigPluginAbi = [
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
            { name: '_allowFailureMap', internalType: 'uint256', type: 'uint256' },
            { name: '_approveProposal', internalType: 'bool', type: 'bool' },
            { name: '_tryExecution', internalType: 'bool', type: 'bool' },
            { name: '_startDate', internalType: 'uint64', type: 'uint64' },
            { name: '_endDate', internalType: 'uint64', type: 'uint64' },
        ],
        name: 'createProposal',
        outputs: [{ name: 'proposalId', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: '_proposalId', internalType: 'uint256', type: 'uint256' },
            { name: '_tryExecution', internalType: 'bool', type: 'bool' },
        ],
        name: 'approve',
        outputs: [],
        stateMutability: 'nonpayable',
    },
];
