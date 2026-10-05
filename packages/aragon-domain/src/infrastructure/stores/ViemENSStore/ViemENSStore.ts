import { createPublicClient, http, type PublicClient } from 'viem';
import { mainnet } from 'viem/chains';
import { ENSName } from '@/domain/ens/ENSName';
import type { ENSStore } from '@/domain/ens/ENSStore';
import type { Address, HexString } from '@/domain/primitives';
import type { RpcUrls } from '@/infrastructure/config/RpcUrls';

/**
 * Legacy Ethereum mainnet coin type (ENSIP-11). The `addr.reverse`
 * namespace, where the overwhelming majority of primary names live today.
 */
const LEGACY_MAINNET_COIN_TYPE = 60n;

/**
 * Resolves wallet addresses to their primary ENS names via viem's
 * `getEnsName`. ENS reverse resolution executes on Ethereum L1, even for L2
 * names (which arrive via CCIP-Read), so this store always resolves against
 * mainnet — `fromRpcUrls` reads the mainnet URL from the injected map.
 *
 * This class accounts for the safety considerations in the [SEAL security
 * framework](https://frameworks.securityalliance.org/ens/overview):
 *
 *   1. Forward-resolution verification — `getEnsName` calls the
 *      UniversalResolver's `reverseWithGateways`, whose `reverse()`
 *      forward-resolves the candidate name back to the address on-chain and
 *      reverts (`ReverseAddressMismatch`) on a mismatch. This guarantee
 *      holds ONLY while the client's `universalResolverAddress` is the
 *      ENSIP-23 UniversalResolver (viem's mainnet default). Do not point it
 *      at a legacy resolver.
 *   2. ENSIP-15 normalization — the resolved name is wrapped in `ENSName`,
 *      which normalizes on creation (viem `normalize`). viem does not
 *      auto-normalize the names it returns, so the value object owns this.
 *   3. Cross-chain (ENSIP-19) — `coinType` selects which chain's primary
 *      name to read. We default to `60` (legacy mainnet); a chain-specific
 *      coin type would extend this to L2 / multichain primary names.
 *
 * Performance: lookups fan out concurrently and `fromRpcUrls` builds the
 * client with `batch: { multicall: true }`, so a page's lookups collapse
 * into a single multicall request. The store owns that flag — it is set
 * here rather than trusting callers to configure the client correctly. A
 * per-address failure (RPC error, CCIP-Read timeout, or an un-normalizable
 * name) degrades to "no name" rather than failing the whole page; ENS is
 * enrichment, not core membership data.
 */
export class ViemENSStore implements ENSStore {
  constructor(private readonly client: PublicClient) {}

  /**
   * Builds a store backed by a mainnet viem client constructed from the
   * mainnet entry (chain id 1) of the RPC URL map, with multicall batching
   * enabled. Throws when the map has no mainnet entry: viem would otherwise
   * fall back to its public endpoint, and once that throttles every member
   * silently resolves to "no name" because per-address failures degrade by
   * design.
   */
  static fromRpcUrls(rpcUrls: RpcUrls): ViemENSStore {
    const mainnetRpcUrl = rpcUrls[mainnet.id];
    if (mainnetRpcUrl == null) {
      throw new Error(
        `ENS resolution requires an RPC URL for Ethereum mainnet (chain id ${mainnet.id})`,
      );
    }

    const client = createPublicClient({
      chain: mainnet,
      transport: http(mainnetRpcUrl),
      batch: { multicall: true },
    });
    return new ViemENSStore(client);
  }

  public async lookUpPrimaryNames(
    addresses: Address[],
  ): Promise<Map<HexString, ENSName>> {
    const names = new Map<HexString, ENSName>();
    if (addresses.length === 0) {
      return names;
    }

    const resolved = await Promise.all(
      addresses.map((address) =>
        this.resolvePrimaryName(address, LEGACY_MAINNET_COIN_TYPE),
      ),
    );

    for (const entry of resolved) {
      if (entry != null) {
        names.set(entry.key, entry.name);
      }
    }

    return names;
  }

  private async resolvePrimaryName(
    address: Address,
    coinType: bigint,
  ): Promise<{ key: HexString; name: ENSName } | null> {
    const key = address.toHexString();
    try {
      const name = await this.client.getEnsName({ address: key, coinType });
      if (name == null) {
        return null;
      }
      return { key, name: ENSName.fromString(name) };
    } catch {
      return null;
    }
  }
}
