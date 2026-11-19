'use client';

import { addressUtils } from '@aragon/gov-ui-kit';
import { getAddress } from 'viem';
import { useEnsAddress } from 'wagmi';
import { ensChainId } from '@/modules/ens/constants/ensConfig';
import { networkUtils } from '@/shared/utils/networkUtils';
import {
    type IWorkspaceAccountInfo,
    useWorkspaceAccounts,
    WorkspaceAccountInfoStatus,
    workspaceAccountsStaleTime,
} from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceAccountLookupResult {
    /**
     * The account found on one network.
     */
    account: IWorkspaceAccount;
    /**
     * The account as resolved by the accounts API, for its name.
     */
    accountInfo: IWorkspaceAccountInfo;
}

export interface IUseWorkspaceAccountLookupResult {
    /**
     * One result per network the address is a DAO or a Safe on.
     */
    results: IWorkspaceAccountLookupResult[];
    /**
     * Whether the ENS name or the accounts are being resolved.
     */
    isLoading: boolean;
    /**
     * Whether every network answered that the address is no account, or the ENS name resolves to none.
     */
    isNotFound: boolean;
    /**
     * Whether the ENS name or the accounts could not be resolved.
     */
    isError: boolean;
}

/**
 * Looks an address or an ENS name up on every supported network, without asking for a network first. An ENS name
 * is resolved on Ethereum, then its address is looked up like any other.
 */
const isUnavailable = ({ status }: IWorkspaceAccountInfo) =>
    status === WorkspaceAccountInfoStatus.UNAVAILABLE;

export const useWorkspaceAccountLookup = (
    value?: string,
): IUseWorkspaceAccountLookupResult => {
    const isAddress = value != null && addressUtils.isAddress(value);
    const ensName =
        value != null && !isAddress
            ? workspaceUtils.normalizeEnsName(value)
            : undefined;
    const isEnsName = ensName != null;

    const {
        data: ensAddress,
        isLoading: isEnsLoading,
        isError: isEnsError,
    } = useEnsAddress({
        name: ensName,
        chainId: ensChainId,
        query: { enabled: isEnsName },
    });

    // Checksummed, as the accounts API rejects a miscased address and every other path stores the checksummed form.
    const address = isAddress ? getAddress(value) : (ensAddress ?? undefined);

    const {
        data: accountInfos,
        isLoading: isAccountsLoading,
        error: accountsError,
    } = useWorkspaceAccounts(
        {
            body: {
                accounts: networkUtils
                    .getSupportedNetworks()
                    .map((network) => ({
                        network,
                        address: address ?? '',
                    })),
            },
        },
        {
            enabled: address != null,
            // An `unavailable` entry is transient, so that answer is stale at once.
            staleTime: ({ state }) =>
                state.data?.some(isUnavailable)
                    ? 0
                    : workspaceAccountsStaleTime,
        },
    );

    const results =
        address == null
            ? []
            : (accountInfos ?? []).flatMap((accountInfo) => {
                  const type = workspaceUtils.getAccountType(accountInfo);

                  if (type == null) {
                      return [];
                  }

                  const { network } = accountInfo;
                  const account: IWorkspaceAccount = {
                      id: workspaceUtils.buildAccountId({ network, address }),
                      type,
                      address,
                      network,
                  };

                  return [{ account, accountInfo }];
              });

    const isLoading = isEnsLoading || isAccountsLoading;
    // An earlier answer wins over the error of a later refetch, which the query keeps beside it.
    const isUnresolvedEns = isEnsName && ensAddress === null;
    const isEnsFailed = isEnsError && ensAddress === undefined;
    const hasFoundNothing =
        address != null && !isLoading && results.length === 0;

    // Only every network answering that the address is no account settles it: one that could not answer may hold it.
    const isConclusive =
        accountInfos != null &&
        accountInfos.length > 0 &&
        accountInfos.every(
            ({ status }) => status === WorkspaceAccountInfoStatus.UNSUPPORTED,
        );

    const isError =
        isEnsFailed ||
        (hasFoundNothing &&
            !isConclusive &&
            (accountInfos != null || accountsError != null));

    return {
        results,
        isLoading,
        isNotFound: isUnresolvedEns || (hasFoundNothing && isConclusive),
        isError,
    };
};
