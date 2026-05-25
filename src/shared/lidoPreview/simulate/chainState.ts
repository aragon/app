// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import { type Address, type PublicClient, parseAbi, zeroAddress } from 'viem';
import type { TokenInfo } from '../types/primitives';
import type { AnyNode, TopologyGraph } from '../types/topology';

/**
 * Flat chain-state snapshot used by the simulator. Balances are keyed by
 * `${vault}:${token}` (both lowercased) so lookups are O(1). Epoch values
 * are keyed by lowercased epoch-provider address.
 *
 * The shape is intentionally mutable: predictors update it step-by-step as
 * they propagate deltas through the vault.
 */
export type ChainState = {
    balances: Map<string, bigint>;
    epochs: Map<string, bigint>;
};

const balanceKey = (vault: Address, token: Address): string =>
    `${vault.toLowerCase()}:${token.toLowerCase()}`;

export function getBalance(
    state: ChainState,
    vault: Address,
    token: Address,
): bigint {
    return state.balances.get(balanceKey(vault, token)) ?? 0n;
}

export function setBalance(
    state: ChainState,
    vault: Address,
    token: Address,
    amount: bigint,
): void {
    state.balances.set(balanceKey(vault, token), amount);
}

export function addBalance(
    state: ChainState,
    vault: Address,
    token: Address,
    delta: bigint,
): void {
    setBalance(state, vault, token, getBalance(state, vault, token) + delta);
}

export function getEpoch(
    state: ChainState,
    provider: Address,
): bigint | undefined {
    return state.epochs.get(provider.toLowerCase());
}

export function setEpoch(
    state: ChainState,
    provider: Address,
    epoch: bigint,
): void {
    state.epochs.set(provider.toLowerCase(), epoch);
}

/**
 * Collect every (vault, token) pair, every unique token, and every epoch
 * provider referenced anywhere in the topology. This is the minimum set of
 * reads the simulator needs.
 */
export function collectReadsFromTopology(topology: TopologyGraph): {
    vaultTokenPairs: { vault: Address; token: TokenInfo }[];
    tokens: TokenInfo[];
    epochProviders: Address[];
} {
    const pairs = new Map<string, { vault: Address; token: TokenInfo }>();
    const tokens = new Map<string, TokenInfo>();
    const providers = new Map<string, Address>();

    const visit = (node: AnyNode): void => {
        switch (node.kind) {
            case 'plugin.dispatch': {
                for (const strategy of node.strategies) {
                    visit(strategy);
                }
                return;
            }
            case 'plugin.unknown':
                return;
            // CR vanilla strategies.
            case 'strategy.dispatch.transfer':
            case 'strategy.dispatch.epoch-transfer':
                visit(node.budget);
                visit(node.splitter);
                if (node.kind === 'strategy.dispatch.epoch-transfer') {
                    visit(node.epochProvider);
                }
                return;
            case 'strategy.dispatch.burn':
                visit(node.budget);
                return;
            // Lido custom strategies.
            case 'strategy.dispatch.lido.wrap':
                visit(node.budget);
                return;
            case 'strategy.dispatch.lido.univ2-liquidity':
                visit(node.budget);
                visit(node.budgetB);
                visit(node.epochProvider);
                return;
            case 'strategy.dispatch.lido.gated-cowswap':
                visit(node.budget);
                visit(node.gate);
                visit(node.epochProvider);
                tokens.set(
                    node.targetToken.address.toLowerCase(),
                    node.targetToken,
                );
                return;
            case 'strategy.unknown':
                if (node.budget) {
                    visit(node.budget);
                }
                return;
            // Budgets — every kind with a `vault` adds itself to the balance map.
            case 'budget.full':
            case 'budget.required': {
                const key = balanceKey(node.vault, node.token.address);
                pairs.set(key, { vault: node.vault, token: node.token });
                tokens.set(node.token.address.toLowerCase(), node.token);
                return;
            }
            case 'budget.lido.stream-until': {
                const key = balanceKey(node.vault, node.token.address);
                pairs.set(key, { vault: node.vault, token: node.token });
                tokens.set(node.token.address.toLowerCase(), node.token);
                visit(node.epochProvider);
                return;
            }
            case 'budget.unknown':
                tokens.set(node.token.address.toLowerCase(), node.token);
                return;
            // Splitters carry no on-chain reads we need to pre-fetch here.
            case 'splitter.solo':
            case 'splitter.equal':
            case 'splitter.ratio':
            case 'splitter.unknown':
                return;
            // Lido gate: the price oracle isn't an epoch provider, so nothing to
            // pre-fetch via the balance/epoch maps.
            case 'lido.price-floor-gate':
                return;
            case 'epoch-provider':
                providers.set(node.address.toLowerCase(), node.address);
                return;
        }
    };

    visit(topology.root);

    return {
        vaultTokenPairs: [...pairs.values()],
        tokens: [...tokens.values()],
        epochProviders: [...providers.values()],
    };
}

const erc20BalanceAbi = parseAbi([
    'function balanceOf(address owner) view returns (uint256)',
]);

const epochProviderAbi = parseAbi([
    'function getEpoch() view returns (uint256)',
]);

/**
 * Read every balance and epoch referenced in the topology. For native ETH
 * (`address(0)`), uses the client's eth_getBalance; for ERC20s, calls
 * `balanceOf(vault)`.
 */
export async function fetchChainState(
    client: PublicClient,
    topology: TopologyGraph,
    options: { blockNumber?: bigint } = {},
): Promise<ChainState> {
    const { vaultTokenPairs, epochProviders } =
        collectReadsFromTopology(topology);
    const blockNumber = options.blockNumber;

    const balancePromises = vaultTokenPairs.map(async ({ vault, token }) => {
        const amount =
            token.address === zeroAddress
                ? await client.getBalance({
                      address: vault,
                      ...(blockNumber !== undefined ? { blockNumber } : {}),
                  })
                : await client.readContract({
                      address: token.address,
                      abi: erc20BalanceAbi,
                      functionName: 'balanceOf',
                      args: [vault],
                      ...(blockNumber !== undefined ? { blockNumber } : {}),
                  });
        return { vault, token, amount };
    });

    const epochPromises = epochProviders.map(async (address) => {
        const epoch = await client.readContract({
            address,
            abi: epochProviderAbi,
            functionName: 'getEpoch',
            ...(blockNumber !== undefined ? { blockNumber } : {}),
        });
        return { address, epoch };
    });

    const [balanceResults, epochResults] = await Promise.all([
        Promise.all(balancePromises),
        Promise.all(epochPromises),
    ]);

    const state: ChainState = { balances: new Map(), epochs: new Map() };
    for (const { vault, token, amount } of balanceResults) {
        setBalance(state, vault, token.address, amount);
    }
    for (const { address, epoch } of epochResults) {
        setEpoch(state, address, epoch);
    }
    return state;
}
