export const registerGaugeAbi = {
    type: 'function',
    name: 'registerGauge',
    inputs: [
        { name: '_qiToken', type: 'address' },
        { name: '_incentive', type: 'uint8' },
        { name: '_rewardController', type: 'address' },
        { name: '_metadataURI', type: 'string' },
    ],
    outputs: [{ internalType: 'address', name: 'gaugeAddress', type: 'address' }],
    stateMutability: 'nonpayable',
} as const;

export const unregisterGaugeAbi = {
    type: 'function',
    name: 'unregisterGauge',
    inputs: [
        { internalType: 'address', name: '_qiToken', type: 'address' },
        { internalType: 'enum Incentive', name: '_incentive', type: 'uint8' },
        { internalType: 'address', name: '_rewardController', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
} as const;

export const getAllRegisteredGaugeDetailsAbi = {
    type: 'function',
    name: 'getAllRegisteredGaugeDetails',
    inputs: [],
    outputs: [
        {
            components: [
                { internalType: 'address', name: 'gaugeAddress', type: 'address' },
                { internalType: 'address', name: 'qiToken', type: 'address' },
                { internalType: 'enum IGaugeRegistrar.Incentive', name: 'incentive', type: 'uint8' },
                { internalType: 'address', name: 'rewardController', type: 'address' },
            ],
            internalType: 'struct IGaugeRegistrar.RegisteredGauge[]',
            name: '',
            type: 'tuple[]',
        },
    ],
    stateMutability: 'view',
} as const;

export const gaugeRegistrarAbi = [registerGaugeAbi, unregisterGaugeAbi, getAllRegisteredGaugeDetailsAbi];
