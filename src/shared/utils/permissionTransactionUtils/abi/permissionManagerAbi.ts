export const permissionManagerAbi = [
    {
        type: 'function',
        inputs: [
            { name: '_where', internalType: 'address', type: 'address' },
            { name: '_who', internalType: 'address', type: 'address' },
            { name: '_permissionId', internalType: 'bytes32', type: 'bytes32' },
        ],
        name: 'grant',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: '_where', internalType: 'address', type: 'address' },
            { name: '_who', internalType: 'address', type: 'address' },
            { name: '_permissionId', internalType: 'bytes32', type: 'bytes32' },
            {
                name: '_condition',
                internalType: 'contract IPermissionCondition',
                type: 'address',
            },
        ],
        name: 'grantWithCondition',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: '_where', internalType: 'address', type: 'address' },
            { name: '_who', internalType: 'address', type: 'address' },
            { name: '_permissionId', internalType: 'bytes32', type: 'bytes32' },
        ],
        name: 'revoke',
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;
