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
 * ENSv1 Registry address on mainnet. Holds the resolver of every name that has
 * not migrated to ENSv2; migrating a name clears its entry.
 * Source: https://docs.ens.domains/registry/ens
 */
export const ensRegistryAddress =
    '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' as const;

/** Minimal ABI for ENSv1 Registry.resolver. */
export const ensRegistryAbi = [
    {
        type: 'function',
        name: 'resolver',
        inputs: [{ name: 'node', type: 'bytes32' }],
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
    },
] as const;

/**
 * Minimal ABI for the Universal Resolver `resolve` (ENSIP-10 entry point that
 * reads ENSv1 and ENSv2 names alike). Its address comes from the viem chain
 * config (`mainnet.contracts.ensUniversalResolver`).
 */
export const ensUniversalResolverAbi = [
    {
        type: 'function',
        name: 'resolve',
        inputs: [
            { name: 'name', type: 'bytes' },
            { name: 'data', type: 'bytes' },
        ],
        outputs: [
            { name: 'result', type: 'bytes' },
            { name: 'resolver', type: 'address' },
        ],
        stateMutability: 'view',
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
