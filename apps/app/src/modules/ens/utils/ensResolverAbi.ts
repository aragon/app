/**
 * Minimal ABI for the ENSv1 Public Resolver, keyed by namehash.
 *
 * - addr: EIP-137 address record getter.
 * - contenthash: EIP-1577 content hash record getter.
 * - setText: EIP-634 text record setter.
 * - multicall: ENS IMulticallable — batches multiple write calls to the resolver
 *   itself via delegatecall. This is NOT Multicall3 (which is view-only); the
 *   resolver's own multicall supports state-mutating calls.
 *
 * The getters are used to encode Universal Resolver `resolve` calls, which
 * answer them for ENSv1 and ENSv2 names alike.
 *
 * Source: https://github.com/ensdomains/ens-contracts/blob/master/contracts/resolvers/PublicResolver.sol
 */
export const ensPublicResolverAbi = [
    {
        type: 'function',
        name: 'addr',
        inputs: [{ name: 'node', type: 'bytes32' }],
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'contenthash',
        inputs: [{ name: 'node', type: 'bytes32' }],
        outputs: [{ name: '', type: 'bytes' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'setText',
        inputs: [
            { name: 'node', type: 'bytes32' },
            { name: 'key', type: 'string' },
            { name: 'value', type: 'string' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'multicall',
        inputs: [{ name: 'data', type: 'bytes[]' }],
        outputs: [{ name: 'results', type: 'bytes[]' }],
        stateMutability: 'nonpayable',
    },
] as const;

/**
 * Minimal ABI for ENSv2 resolvers (`PermissionedResolver`, one per account).
 *
 * - setText: text record setter keyed by the DNS-encoded name instead of the
 *   namehash.
 * - supportsInterface: ERC-165, used to detect the setter above.
 *
 * `multicall(bytes[])` matches the Public Resolver one. Legacy getters are not
 * supported: reads go through ENSIP-10 `resolve(bytes,bytes)`.
 */
export const ensPermissionedResolverAbi = [
    {
        type: 'function',
        name: 'setText',
        inputs: [
            { name: 'name', type: 'bytes' },
            { name: 'key', type: 'string' },
            { name: 'value', type: 'string' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'supportsInterface',
        inputs: [{ name: 'interfaceId', type: 'bytes4' }],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
    },
] as const;
