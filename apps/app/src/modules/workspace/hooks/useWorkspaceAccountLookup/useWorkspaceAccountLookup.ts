'use client';

import { addressUtils } from '@aragon/gov-ui-kit';
import { getAddress } from 'viem';
import { useEnsAddress } from 'wagmi';
import { ensChainId } from '@/modules/ens/constants/ensConfig';
import { networkUtils } from '@/shared/utils/networkUtils';
import {
    type IWorkspaceAccountInfo,
    useWorkspaceAccounts,
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
     * Whether the lookup ran and found no account on any network.
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
        isSuccess: isEnsResolved,
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
        isError: isAccountsError,
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
        { enabled: address != null },
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
    const hasLookedUp = address != null && accountInfos != null;
    const isUnresolvedEns = isEnsName && isEnsResolved && ensAddress == null;

    return {
        results,
        isLoading,
        isNotFound:
            isUnresolvedEns ||
            (hasLookedUp && !isLoading && results.length === 0),
        isError: isEnsError || isAccountsError,
    };
};
