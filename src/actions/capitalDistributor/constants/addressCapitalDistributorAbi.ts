export const createCampaignAbi = {
    type: 'function',
    name: 'createCampaign',
    inputs: [
        { name: '_metadataURI', type: 'bytes', internalType: 'bytes' },
        { name: '_strategyId', type: 'bytes32', internalType: 'bytes32' },
        {
            name: '_strategyParams',
            type: 'tuple',
            internalType: 'struct AllocatorStrategyFactory.DeploymentParams',
            components: [
                { name: 'factory', type: 'address', internalType: 'address' },
                { name: 'params', type: 'bytes', internalType: 'bytes' },
            ],
        },
        {
            name: '_allocationStrategyAuxData',
            type: 'bytes',
            internalType: 'bytes',
        },
        { name: '_token', type: 'address', internalType: 'contract IERC20' },
        { name: '_actionEncoder', type: 'bytes32', internalType: 'bytes32' },
        {
            name: '_actionEncoderInitializationAuxData',
            type: 'bytes',
            internalType: 'bytes',
        },
        { name: '_multipleClaimsAllowed', type: 'bool', internalType: 'bool' },
        { name: '_startTime', type: 'uint256', internalType: 'uint256' },
        { name: '_endTime', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: 'id', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'nonpayable',
} as const;
