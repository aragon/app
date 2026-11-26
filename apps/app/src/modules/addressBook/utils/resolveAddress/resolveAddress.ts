import type { AddressResolver } from '@aragon/gov-ui-kit';
import { getAddress, isAddressEqual } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import type { Config } from 'wagmi';
import { getEnsAddress, getEnsName } from 'wagmi/actions';
import { logEnsError } from '@/modules/ens/utils/logEnsError';

const isNormalized = (name: string) => {
    try {
        return normalize(name) === name;
    } catch {
        return false;
    }
};

// A failing RPC fails every address of a page at once: report it once in this window, not once per address.
const errorLogWindowMs = 30_000;

/**
 * Builds the resolver the kit calls once for each address that has no saved name: the primary ENS name, on mainnet
 * only. A reverse name is only the claim of the address owner, so it is used only when it is in normalized form and
 * its forward record points back to the same address. The calls of a page start together; when the wagmi client has
 * `batch.multicall` (see `modules/application/constants/wagmi.ts`), viem groups them into a few multicalls. An address
 * with no name costs a single lookup. A failing RPC is logged at most once every 30 seconds.
 */
export const createAddressResolver = (config: Config): AddressResolver => {
    let lastErrorLoggedAt = Number.NEGATIVE_INFINITY;

    return async (address) => {
        const checksum = getAddress(address);

        try {
            const name = await getEnsName(config, {
                address: checksum,
                chainId: mainnet.id,
            });

            if (name == null || !isNormalized(name)) {
                return null;
            }

            const forward = await getEnsAddress(config, {
                name,
                chainId: mainnet.id,
            });

            return forward != null && isAddressEqual(forward, checksum)
                ? { label: name, source: 'ens' }
                : null;
        } catch (error) {
            const now = Date.now();

            if (now - lastErrorLoggedAt >= errorLogWindowMs) {
                lastErrorLoggedAt = now;
                logEnsError(error, {
                    hook: 'resolveAddress',
                    address: checksum,
                    chainId: mainnet.id,
                });
            }

            return null;
        }
    };
};
