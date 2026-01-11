/**
 * ABI definition for the setMetadata function.
 * Used to encode metadata updates for DAO and plugin contracts.
 */
export const setMetadataAbi = {
    type: 'function',
    inputs: [{ name: '_metadata', internalType: 'bytes', type: 'bytes' }],
    name: 'setMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
} as const;
