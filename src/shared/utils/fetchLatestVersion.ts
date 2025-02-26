import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IPluginInfo } from '@/shared/types';
import { type Hex, keccak256, toBytes, zeroAddress } from 'viem';

// Define public RPC fallback in case `networkDefinitions` is missing it
// const DEFAULT_PUBLIC_RPCS: Record<Network, string> = {
//     [Network.ETHEREUM_MAINNET]: 'https://rpc.ankr.com/eth',
//     [Network.POLYGON_MAINNET]: 'https://polygon-rpc.com',
//     [Network.BASE_MAINNET]: 'https://mainnet.base.org',
//     [Network.ARBITRUM_MAINNET]: 'https://arb1.arbitrum.io/rpc',
//     [Network.ZKSYNC_MAINNET]: 'https://mainnet.era.zksync.io',
//     [Network.PEAQ_MAINNET]: 'https://rpc.peaq.network',
//     [Network.ETHEREUM_SEPOLIA]: 'https://rpc.sepolia.org',
//     [Network.ZKSYNC_SEPOLIA]: 'https://sepolia.era.zksync.io',
// };

export async function fetchLatestVersion(network: Network, plugin: IPluginInfo) {
    const pluginAddress = plugin.repositoryAddresses[network];
    const pluginBaseAddress = networkDefinitions[network].addresses.pluginRepoBase;

    console.log('pluginAddress:', pluginAddress);
    console.log('pluginBaseAddress:', pluginBaseAddress);

    // Ensure we get a valid RPC URL
    const rpcUrl = 'https://endpoints.omniatech.io/v1/eth/sepolia/public';

    const requestPayload = {
        jsonrpc: '2.0',
        id: Date.now(), // Unique request ID
        method: 'eth_call',
        params: [
            {
                to: pluginBaseAddress,
                data:
                    pluginAddress !== zeroAddress
                        ? `0x${encodeFunctionSignature('getLatestVersion(address)')}${pluginAddress.slice(2).padStart(64, '0')}`
                        : `0x${encodeFunctionSignature('getLatestVersion(uint8)')}${plugin.installVersion.release.toString(16).padStart(64, '0')}`,
            },
            'latest',
        ],
    };

    try {
        console.log(`🔵 Sending RPC request to: ${rpcUrl}`);

        const response = await fetch(rpcUrl, {
            method: 'POST',
            body: JSON.stringify(requestPayload),
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            console.error(`❌ RPC request failed with status: ${response.status.toString()}`, await response.text());
            return null;
        }

        const result: { result?: Hex } = (await response.json()) as { result?: Hex };
        const hexData = result.result; // Example: "0x00010005" (release: 1, build: 5)

        if (hexData && hexData.length === 10) {
            const release = parseInt(hexData.slice(2, 4), 16);
            const build = parseInt(hexData.slice(4), 16);
            console.log(`✅ Latest Version - Release: ${release.toString()}, Build: ${build.toString()}`);
            return { release, build };
        } else {
            console.warn('⚠️ Invalid hex data returned:', hexData);
        }
    } catch (error) {
        console.error('❌ Error fetching latest version:', error);
    }

    return null;
}

function encodeFunctionSignature(fnSignature: string): string {
    return keccak256(toBytes(fnSignature)).slice(0, 10); // 4-byte function selector
}
