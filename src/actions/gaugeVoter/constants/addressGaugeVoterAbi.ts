export const createGaugeAbi = {
    type: 'function',
    name: 'createGauge',
    inputs: [
        { name: '_gauge', type: 'address', internalType: 'address' },
        { name: '_metadataURI', type: 'string', internalType: 'string' },
    ],
    outputs: [{ name: 'gauge', type: 'address', internalType: 'address' }],
    stateMutability: 'nonpayable',
} as const;

export const deactivateGaugeAbi = {
    type: 'function',
    name: 'deactivateGauge',
    inputs: [{ name: '_gauge', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
} as const;

export const activateGaugeAbi = {
    type: 'function',
    name: 'activateGauge',
    inputs: [{ name: '_gauge', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
} as const;

export const updateGaugeMetadataAbi = {
    type: 'function',
    name: 'updateGaugeMetadata',
    inputs: [
        { name: '_gauge', type: 'address', internalType: 'address' },
        { name: '_metadataURI', type: 'string', internalType: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
} as const;

export const gaugeVoterAbi = [createGaugeAbi, deactivateGaugeAbi, activateGaugeAbi, updateGaugeMetadataAbi] as const;
