export const daoAbi = {
    name: 'hasPermission',
    type: 'function',
    stateMutability: 'view',
    inputs: [
        {
            internalType: 'address',
            name: '_where',
            type: 'address',
        },
        {
            internalType: 'address',
            name: '_who',
            type: 'address',
        },
        {
            internalType: 'bytes32',
            name: '_permissionId',
            type: 'bytes32',
        },
        {
            internalType: 'bytes',
            name: '_data',
            type: 'bytes',
        },
    ],
    outputs: [
        {
            internalType: 'bool',
            name: '',
            type: 'bool',
        },
    ],
} as const;
