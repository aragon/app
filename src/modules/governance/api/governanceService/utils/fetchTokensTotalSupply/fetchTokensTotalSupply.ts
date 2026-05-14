import { createPublicClient, erc20Abi, type Hex, http } from 'viem';
import { readContracts } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { resolveServerRpcUrl } from '@/modules/application/utils/proxyRpcUtils/resolveServerRpcUrl';
import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

/**
 * Fetches the live ERC-20 `totalSupply` for each given token address and returns a map keyed by
 * lowercased address. Empty input short-circuits with `{}` so callers don't fire a useless RPC.
 *
 * Runs on both the server and the client:
 * - Client: uses `@wagmi/core` `readContracts` (multicall-batched via `wagmiConfig`).
 * - Server: builds a viem public client against the upstream RPC URL via `proxyRpcUtils`.
 *
 * Throws on any RPC failure (`allowFailure: false`) so the caller can surface `Page.Error`.
 */
export const fetchTokensTotalSupply = async (
    network: Network,
    addresses: Hex[],
): Promise<Record<string, string>> => {
    if (addresses.length === 0) {
        return {};
    }

    const isServer = typeof window === 'undefined';

    const totals = isServer
        ? await fetchOnServer(network, addresses)
        : await fetchOnClient(network, addresses);

    return addresses.reduce<Record<string, string>>(
        (accumulator, address, index) => {
            accumulator[address.toLowerCase()] = totals[index].toString();
            return accumulator;
        },
        {},
    );
};

const fetchOnClient = (
    network: Network,
    addresses: Hex[],
): Promise<bigint[]> => {
    const chainId = networkDefinitions[network].id;

    const contracts = addresses.map((address) => ({
        chainId,
        address,
        abi: erc20Abi,
        functionName: 'totalSupply' as const,
    }));

    return readContracts(wagmiConfig, {
        contracts,
        allowFailure: false,
    });
};

const fetchOnServer = (
    network: Network,
    addresses: Hex[],
): Promise<bigint[]> => {
    const rpcUrl = resolveServerRpcUrl(network);

    if (rpcUrl == null) {
        throw new Error(
            `fetchTokensTotalSupply: no server-side RPC endpoint configured for network ${network}`,
        );
    }

    const client = createPublicClient({
        chain: networkDefinitions[network],
        transport: http(rpcUrl),
    });

    return client.multicall({
        allowFailure: false,
        contracts: addresses.map((address) => ({
            address,
            abi: erc20Abi,
            functionName: 'totalSupply' as const,
        })),
    });
};
