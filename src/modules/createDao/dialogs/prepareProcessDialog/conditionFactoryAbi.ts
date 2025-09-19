export const conditionFactoryAbi = [
    {
        type: 'function',
        name: 'deployExecuteSelectorCondition',
        stateMutability: 'nonpayable',
        inputs: [
            { name: '_dao', type: 'address', internalType: 'address' },
            {
                name: '_initialEntries',
                type: 'tuple[]',
                internalType: 'struct ExecuteSelectorCondition.SelectorTarget[]',
                components: [
                    { name: 'where', type: 'address', internalType: 'address' },
                    { name: 'selectors', type: 'bytes4[]', internalType: 'bytes4[]' },
                ],
            },
        ],
        outputs: [{ name: '', type: 'address', internalType: 'contract ExecuteSelectorCondition' }],
    },
    {
        type: 'function',
        name: 'deploySafeOwnerCondition',
        stateMutability: 'nonpayable',
        inputs: [{ name: '_safe', type: 'address', internalType: 'address' }],
        outputs: [
            {
                name: 'newContract',
                type: 'address',
                internalType: 'contract SafeOwnerCondition',
            },
        ],
    },
    {
        type: 'event',
        name: 'ExecuteSelectorConditionDeployed',
        anonymous: false,
        inputs: [{ indexed: false, name: 'newContract', type: 'address' }],
    },
    {
        type: 'event',
        name: 'SafeOwnerConditionDeployed',
        anonymous: false,
        inputs: [{ indexed: false, name: 'newContract', type: 'address' }],
    },
] as const;
