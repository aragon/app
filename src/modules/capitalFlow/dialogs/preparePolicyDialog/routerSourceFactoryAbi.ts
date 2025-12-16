export const routerSourceFactoryAbi = [
    {
        type: 'function',
        name: 'deployDrainBalanceSource',
        inputs: [
            { name: '_vault', type: 'address', internalType: 'address' },
            { name: '_vaultToken', type: 'address', internalType: 'contract IERC20' },
        ],
        outputs: [{ name: 'result', type: 'address', internalType: 'contract DrainBalanceSource' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'deployRequiredBalanceSource',
        inputs: [
            { name: '_vault', type: 'address', internalType: 'address' },
            { name: '_vaultToken', type: 'address', internalType: 'contract IERC20' },
            { name: '_requiredBalance', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'result', type: 'address', internalType: 'contract RequiredBalanceSource' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        name: 'DrainBalanceSourceDeployed',
        inputs: [{ name: 'newContract', type: 'address', indexed: false, internalType: 'contract DrainBalanceSource' }],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'RequiredBalanceSourceDeployed',
        inputs: [
            { name: 'newContract', type: 'address', indexed: false, internalType: 'contract RequiredBalanceSource' },
        ],
        anonymous: false,
    },
] as const;
