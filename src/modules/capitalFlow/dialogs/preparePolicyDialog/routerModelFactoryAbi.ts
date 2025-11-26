export const routerModelFactoryAbi = [
    {
        type: 'function',
        name: 'deployRatioModel',
        inputs: [
            { name: '_recipientList', type: 'address[]' },
            { name: '_ratioList', type: 'uint32[]' },
        ],
        outputs: [{ name: 'result', type: 'address' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'deployEqualRatioModel',
        inputs: [{ name: '_recipientList', type: 'address[]' }],
        outputs: [{ name: 'result', type: 'address' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'deployBracketsModel',
        inputs: [
            {
                name: '_brackets',
                type: 'tuple[]',
                components: [
                    { name: 'recipient', type: 'address' },
                    { name: 'amount', type: 'uint256' },
                ],
            },
        ],
        outputs: [{ name: 'result', type: 'address' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        name: 'RatioModelDeployed',
        inputs: [{ indexed: false, name: 'newContract', type: 'address' }],
    },
    {
        type: 'event',
        name: 'EqualRatioModelDeployed',
        inputs: [{ indexed: false, name: 'newContract', type: 'address' }],
    },
    {
        type: 'event',
        name: 'BracketsModelDeployed',
        inputs: [{ indexed: false, name: 'newContract', type: 'address' }],
    },
] as const;
