export const globalExecutorAbi = [
    {
        inputs: [
            { name: '_callId', internalType: 'bytes32', type: 'bytes32' },
            {
                components: [
                    { name: 'to', internalType: 'address', type: 'address' },
                    { name: 'value', internalType: 'uint256', type: 'uint256' },
                    { name: 'data', internalType: 'bytes', type: 'bytes' },
                ],
                internalType: 'struct Action[]',
                name: '_actions',
                type: 'tuple[]',
            },
            { name: 'allowFailureMap', internalType: 'uint256', type: 'uint256' },
        ],
        outputs: [],
        name: 'execute',
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;
