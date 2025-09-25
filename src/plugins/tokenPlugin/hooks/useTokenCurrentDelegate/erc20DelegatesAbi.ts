export const erc20DelegatesAbi = [
    {
        type: 'function',
        name: 'delegates',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'address' }],
    },
] as const;
