export const daoAbi = [
    {
        type: 'function',
        inputs: [
            { name: 'newImplementation', internalType: 'address', type: 'address' },
            { name: 'data', internalType: 'bytes', type: 'bytes' },
        ],
        name: 'upgradeToAndCall',
        outputs: [],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        inputs: [
            {
                name: '_previousProtocolVersion',
                internalType: 'uint8[3]',
                type: 'uint8[3]',
            },
            { name: '_initData', internalType: 'bytes', type: 'bytes' },
        ],
        name: 'initializeFrom',
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;
