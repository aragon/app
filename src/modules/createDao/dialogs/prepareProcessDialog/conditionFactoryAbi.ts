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
] as const;
