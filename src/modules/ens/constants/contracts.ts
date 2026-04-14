/**
 * Address of the MemberRegistry contract.
 */
export const memberRegistryAddress =
    '0x2292A7275b73c5bFA4A8aB5aFbbd997de94Bea82';

/** Minimal ABI for IMemberRegistry.register. */
export const memberRegistryAbi = [
    {
        type: 'function',
        name: 'register',
        inputs: [{ name: 'subdomain', type: 'string' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;

/**
 * ENS Reverse Registrar contract address on mainnet.
 * Source: https://docs.ens.domains/contract-api-reference/reverseregistrar
 */
export const ensReverseRegistrarAddress =
    '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb' as const;

/** Minimal ABI for ENS ReverseRegistrar.setName. */
export const ensReverseRegistrarAbi = [
    {
        type: 'function',
        name: 'setName',
        inputs: [{ name: 'name', type: 'string' }],
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'nonpayable',
    },
] as const;
