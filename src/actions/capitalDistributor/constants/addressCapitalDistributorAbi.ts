export const createCampaignAbi = {
    type: 'function',
    name: 'createCampaign',
    inputs: [
        { name: '_metadataURI', type: 'bytes', internalType: 'bytes' },
        {
            name: '_strategy',
            type: 'tuple',
            internalType: 'struct ICapitalDistributorPlugin.StrategyConfig',
            components: [
                {
                    name: 'strategyId',
                    type: 'bytes32',
                    internalType: 'bytes32',
                },
                {
                    name: 'strategyParams',
                    type: 'bytes',
                    internalType: 'bytes',
                },
                { name: 'initData', type: 'bytes', internalType: 'bytes' },
            ],
        },
        {
            name: '_payout',
            type: 'tuple',
            internalType: 'struct ICapitalDistributorPlugin.PayoutConfig',
            components: [
                {
                    name: 'token',
                    type: 'address',
                    internalType: 'contract IERC20',
                },
                {
                    name: 'actionEncoderId',
                    type: 'bytes32',
                    internalType: 'bytes32',
                },
                {
                    name: 'actionEncoderInitData',
                    type: 'bytes',
                    internalType: 'bytes',
                },
            ],
        },
        {
            name: '_settings',
            type: 'tuple',
            internalType: 'struct ICapitalDistributorPlugin.CampaignSettings',
            components: [
                { name: 'startTime', type: 'uint64', internalType: 'uint64' },
                { name: 'endTime', type: 'uint64', internalType: 'uint64' },
            ],
        },
    ],
    outputs: [{ name: 'id', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'nonpayable',
} as const;
