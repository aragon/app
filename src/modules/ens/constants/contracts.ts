/**
 * Address of the MemberRegistry contract.
 */
export const memberRegistryAddress =
    '0xC7Fcf977a072e991a62A7308d52E048E7692153e' as const;
/**
 * Subdomain suffix for member ENS names.
 */
export const memberRegistrySubdomainSuffix = '.aragon.eth';

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
