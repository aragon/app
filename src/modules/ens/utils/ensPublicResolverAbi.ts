/**
 * Minimal ABI for the ENS Public Resolver contract.
 *
 * - setText: EIP-634 text record setter.
 * - multicall: ENS IMulticallable — batches multiple write calls to the resolver
 *   itself via delegatecall. This is NOT Multicall3 (which is view-only); the
 *   resolver's own multicall supports state-mutating calls.
 *
 * Source: https://github.com/ensdomains/ens-contracts/blob/master/contracts/resolvers/PublicResolver.sol
 * Deployed at: 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63 (mainnet, verified on Etherscan)
 */
export const ensPublicResolverAbi = [
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
