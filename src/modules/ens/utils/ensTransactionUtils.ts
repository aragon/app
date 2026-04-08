import { encodeFunctionData, type Hex } from 'viem';
import { namehash, normalize } from 'viem/ens';
import { getEnsResolver } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { ENS_CHAIN_ID } from '../constants/ensConfig';
import { ensPublicResolverAbi } from './ensPublicResolverAbi';

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
     * Builds a transaction to update one or more ENS text records.
     *
     * Sends a single `setText` call for one update, or the resolver's own
     * `multicall` for multiple updates — keeping the change to one transaction.
     */
    buildUpdateRecordsTransaction = async (
        params: IBuildUpdateRecordsTransactionParams,
    ): Promise<ITransactionRequest> => {
        const { ensName, updates } = params;
        const entries = Object.entries(updates);

        // Always normalize before hashing: https://docs.ens.domains/resolution/names#namehash
        const normalizedName = normalize(ensName);
        const node = namehash(normalizedName) as Hex;

        const resolverAddress = await getEnsResolver(wagmiConfig, {
            name: normalizedName,
            chainId: ENS_CHAIN_ID,
        });

        const calls = entries.map(([key, value]) =>
            encodeFunctionData({
                abi: ensPublicResolverAbi,
                functionName: 'setText',
                args: [node, key, value],
            }),
        );

        if (calls.length === 1) {
            return {
                to: resolverAddress,
                data: calls[0],
                value: BigInt(0),
            };
        }

        return {
            to: resolverAddress,
            data: encodeFunctionData({
                abi: ensPublicResolverAbi,
                functionName: 'multicall',
                args: [calls],
            }),
            value: BigInt(0),
        };
    };
}

export const ensTransactionUtils = new EnsTransactionUtils();
