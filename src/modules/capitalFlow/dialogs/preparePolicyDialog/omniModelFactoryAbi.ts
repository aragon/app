export const omniModelFactoryAbi = [
    {
        type: 'function',
        name: 'deployAddressGaugeRatioModel',
        inputs: [
            {
                name: '_gaugeVoter',
                type: 'address',
                internalType: 'contract IAddressGaugeVoter',
            },
        ],
        outputs: [
            {
                name: 'result',
                type: 'address',
                internalType: 'contract AddressGaugeRatioModel',
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'deployTokenGaugeRatioModel',
        inputs: [
            {
                name: '_gaugeVoter',
                type: 'address',
                internalType: 'contract ITokenGaugeVoter',
            },
        ],
        outputs: [
            {
                name: 'result',
                type: 'address',
                internalType: 'contract TokenGaugeRatioModel',
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        name: 'AddressGaugeRatioModelDeployed',
        inputs: [
            {
                name: 'newContract',
                type: 'address',
                indexed: false,
                internalType: 'contract AddressGaugeRatioModel',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'TokenGaugeRatioModelDeployed',
        inputs: [
            {
                name: 'newContract',
                type: 'address',
                indexed: false,
                internalType: 'contract TokenGaugeRatioModel',
            },
        ],
        anonymous: false,
    },
] as const;
