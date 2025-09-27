export const erc20DelegatesAbi = [
    {
        type: 'function',
        name: 'delegates',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
    },
] as const;
