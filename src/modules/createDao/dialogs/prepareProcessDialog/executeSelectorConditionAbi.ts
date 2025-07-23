export const executeSelectorConditionAbi = [
    {
        type: 'event',
        name: 'SelectorAllowed',
        anonymous: false,
        inputs: [
            { indexed: false, name: 'selector', type: 'bytes4', internalType: 'bytes4' },
            { indexed: false, name: 'where', type: 'address', internalType: 'address' },
        ],
    },
] as const;
