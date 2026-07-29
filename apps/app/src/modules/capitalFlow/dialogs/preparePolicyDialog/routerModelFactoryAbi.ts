export const routerModelFactoryAbi = [
    {
        type: 'function',
        name: 'deployBracketsModel',
        inputs: [
            {
                name: '_brackets',
                type: 'tuple[]',
                internalType: 'struct Bracket[]',
                components: [
                    {
                        name: 'threshold',
                        type: 'uint256',
                        internalType: 'uint256',
                    },
                    {
                        name: 'routerModel',
                        type: 'address',
                        internalType: 'contract IRouterModel',
                    },
                    {
                        name: 'claimerModel',
                        type: 'address',
                        internalType: 'contract IClaimerModel',
                    },
                ],
            },
        ],
        outputs: [
            {
                name: 'result',
                type: 'address',
                internalType: 'contract BracketsModel',
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'deployEqualRatioModel',
        inputs: [
            {
                name: '_recipientList',
                type: 'address[]',
                internalType: 'address[]',
            },
        ],
        outputs: [
            {
                name: 'result',
                type: 'address',
                internalType: 'contract EqualRatioModel',
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'deployRatioModel',
        inputs: [
            {
                name: '_recipientList',
                type: 'address[]',
                internalType: 'address[]',
            },
            { name: '_ratioList', type: 'uint32[]', internalType: 'uint32[]' },
        ],
        outputs: [
            {
                name: 'result',
                type: 'address',
                internalType: 'contract RatioModel',
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        name: 'BracketsModelDeployed',
        inputs: [
            {
                name: 'newContract',
                type: 'address',
                indexed: false,
                internalType: 'contract BracketsModel',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'EqualRatioModelDeployed',
        inputs: [
            {
                name: 'newContract',
                type: 'address',
                indexed: false,
                internalType: 'contract EqualRatioModel',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'RatioModelDeployed',
        inputs: [
            {
                name: 'newContract',
                type: 'address',
                indexed: false,
                internalType: 'contract RatioModel',
            },
        ],
        anonymous: false,
    },
] as const;
