export const omniSourceFactoryAbi = [
    {
        type: 'function',
        name: 'deployStreamBalanceSource',
        inputs: [
            { name: '_vault', type: 'address', internalType: 'address' },
            { name: '_vaultToken', type: 'address', internalType: 'contract IERC20' },
            { name: '_amountPerEpoch', type: 'uint256', internalType: 'uint256' },
            { name: '_maxSourceBalance', type: 'uint256', internalType: 'uint256' },
            { name: '_epochInterval', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'result', type: 'address', internalType: 'contract StreamBalanceSource' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        name: 'StreamBalanceSourceDeployed',
        inputs: [{ name: 'newContract', type: 'address', indexed: false, internalType: 'contract StreamBalanceSource' }],
        anonymous: false,
    },
] as const;
