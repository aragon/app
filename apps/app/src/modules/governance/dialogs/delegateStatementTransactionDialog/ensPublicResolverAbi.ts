/**
 * Minimal ABI fragment for the ENS Public Resolver. Only `setText` is needed
 * for delegate-statement publishing. Full resolver ABI lives upstream in the
 * `@ensdomains/ens-contracts` package; we keep a local subset to avoid the
 * dependency for one function call.
 */
export const ensPublicResolverAbi = [
    {
        type: 'function',
        name: 'setText',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'node', type: 'bytes32' },
            { name: 'key', type: 'string' },
            { name: 'value', type: 'string' },
        ],
        outputs: [],
    },
] as const;
