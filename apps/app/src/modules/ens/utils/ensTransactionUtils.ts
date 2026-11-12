import {
    type Address,
    encodeFunctionData,
    toFunctionSelector,
    toHex,
    zeroAddress,
} from 'viem';
import { namehash, normalize, packetToBytes } from 'viem/ens';
import { getEnsResolver, readContract } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { ensRegistryAbi, ensRegistryAddress } from '../constants/contracts';
import { ensChainId } from '../constants/ensConfig';
import {
    ensPermissionedResolverAbi,
    ensPublicResolverAbi,
} from './ensResolverAbi';

/** ERC-165 interface id of the ENSv2 `setText(bytes,string,string)` setter. */
const ensV2SetTextInterfaceId = toFunctionSelector(
    'setText(bytes,string,string)',
);

export interface IEnsWritableResolver {
    /** Resolver that stores the name's records. */
    address: Address;
    /** ENSv2 resolver: setters take the DNS-encoded name instead of the namehash. */
    isV2: boolean;
}

export interface IBuildUpdateRecordsTransactionParams {
    /** ENS name (e.g. "vitalik.eth"). */
    ensName: string;
    /**
     * ENS text-record key → new value. Empty string clears the record.
     * Supports all keys from ENS_RECORD_KEYS plus ENS_AVATAR_KEY.
     */
    updates: Record<string, string>;
}

/** Utilities for building ENS write transactions. */
class EnsTransactionUtils {
    /**
     * Finds the resolver that stores the records of an ENS name.
     *
     * Names still on ENSv1 (e.g. every `*.aragon.eth`) keep their resolver in
     * the v1 registry; the Universal Resolver returns a read-only mirror for
     * them, so the registry is checked first. Migrating to ENSv2 clears the
     * registry entry, and the Universal Resolver then returns the v2 resolver.
     *
     * Returns `null` when the name has no resolver that accepts writes, which
     * also covers names that do not exist.
     *
     * @param normalizedName - ENS name, already normalized.
     */
    getWritableResolver = async (
        normalizedName: string,
    ): Promise<IEnsWritableResolver | null> => {
        const v1Resolver = await readContract(wagmiConfig, {
            address: ensRegistryAddress,
            abi: ensRegistryAbi,
            functionName: 'resolver',
            args: [namehash(normalizedName)],
            chainId: ensChainId,
        });

        if (v1Resolver !== zeroAddress) {
            return { address: v1Resolver, isV2: false };
        }

        const resolver = await getEnsResolver(wagmiConfig, {
            name: normalizedName,
            chainId: ensChainId,
        });

        if (resolver === zeroAddress) {
            return null;
        }

        const isV2 = await readContract(wagmiConfig, {
            address: resolver,
            abi: ensPermissionedResolverAbi,
            functionName: 'supportsInterface',
            args: [ensV2SetTextInterfaceId],
            chainId: ensChainId,
        });

        return isV2 ? { address: resolver, isV2 } : null;
    };

    /**
     * Builds a transaction to update one or more ENS text records.
     *
     * Sends a single `setText` call for one update, or the resolver's own
     * `multicall` for multiple updates — keeping the change to one transaction.
     * Throws when the name has no writable resolver, so no reverting
     * transaction is sent.
     */
    buildUpdateRecordsTransaction = async (
        params: IBuildUpdateRecordsTransactionParams,
    ): Promise<ITransactionRequest> => {
        const { ensName, updates } = params;

        // Always normalize before hashing: https://docs.ens.domains/resolution/names#namehash
        const normalizedName = normalize(ensName);
        const resolver = await this.getWritableResolver(normalizedName);

        if (resolver == null) {
            throw new Error(
                `EnsTransactionUtils: ${normalizedName} has no writable resolver.`,
            );
        }

        const node = namehash(normalizedName);
        const dnsName = toHex(packetToBytes(normalizedName));

        const calls = Object.entries(updates).map(([key, value]) =>
            resolver.isV2
                ? encodeFunctionData({
                      abi: ensPermissionedResolverAbi,
                      functionName: 'setText',
                      args: [dnsName, key, value],
                  })
                : encodeFunctionData({
                      abi: ensPublicResolverAbi,
                      functionName: 'setText',
                      args: [node, key, value],
                  }),
        );

        // ENSv1 and ENSv2 resolvers share the `multicall(bytes[])` signature.
        const data =
            calls.length === 1
                ? calls[0]
                : encodeFunctionData({
                      abi: ensPublicResolverAbi,
                      functionName: 'multicall',
                      args: [calls],
                  });

        return { to: resolver.address, data, value: BigInt(0) };
    };
}

export const ensTransactionUtils = new EnsTransactionUtils();
