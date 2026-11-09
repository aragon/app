import { notFound } from 'next/navigation-server';
import { cache } from 'react';
// biome-ignore lint/style/noRestrictedImports: server-only code cannot use the gov-ui-kit client shim; called with { strict: false } below.
import { isAddress } from 'viem';
import { daoUtils } from '@/shared/utils/daoUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import {
    type IWorkspaceAccountInfo,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import type { WorkspaceAccountType } from '../../api/workspaceService';
import { WorkspaceAccountState } from '../../constants/workspaceAccountState';
import { workspaceUtils } from '../workspaceUtils';

export interface IWorkspaceAccountLookup {
    /**
     * Entry of the workspace accounts API for the account, undefined when the lookup threw.
     */
    accountInfo?: IWorkspaceAccountInfo;
    /**
     * What the lookup says the account is (`workspaceUtils.resolveAccountState`), undefined when it could not tell.
     */
    accountState?: WorkspaceAccountState;
}

class WorkspaceAccountInfoUtils {
    /**
     * Whether an account ID is a supported network and an address, the check bot-probed URLs fail. Not strict about
     * the checksum: the backend accepts any casing.
     * @param accountId - ID of the account on the route, `{network}-{address}`.
     * @returns True when the ID can name an account.
     */
    isValidAccountId = (accountId: string): boolean => {
        const { network, address } = daoUtils.parseDaoId(accountId);

        return (
            networkUtils.isValidNetwork(network) &&
            isAddress(address, { strict: false })
        );
    };

    /**
     * Looks the account of an account-scoped route up in the workspace accounts API. Never throws: a malformed ID
     * resolves to `NOT_FOUND` without a request, a failed lookup to `NOT_FOUND` on a 404 and `UNAVAILABLE` otherwise.
     *
     * React `cache` makes it one POST per server request however many readers ask (Next.js does not memoize a POST);
     * outside a server render it does not memoize.
     * @param accountId - ID of the account on the route, `{network}-{address}`, used with its casing untouched.
     * @returns The account info and its state.
     */
    resolveAccount = cache(
        async (accountId: string): Promise<IWorkspaceAccountLookup> => {
            if (!this.isValidAccountId(accountId)) {
                return {
                    accountInfo: undefined,
                    accountState: WorkspaceAccountState.NOT_FOUND,
                };
            }

            const { network, address } = daoUtils.parseDaoId(accountId);

            try {
                const accountInfos = await workspaceQueryService.getAccounts({
                    body: { accounts: [{ network, address }] },
                });
                // The lookup names a single account, so its only entry is that account.
                const accountInfo = accountInfos[0];

                return {
                    accountInfo,
                    accountState:
                        workspaceUtils.resolveAccountState(accountInfo),
                };
            } catch (error: unknown) {
                return {
                    accountInfo: undefined,
                    accountState: workspaceUtils.resolveAccountState(
                        undefined,
                        error,
                    ),
                };
            }
        },
    );

    /**
     * Type of the account of an account-scoped route, read from the cached `resolveAccount`. Calls `notFound()` for an
     * address that is neither an indexed DAO nor a Safe and throws when the lookup cannot place the account, so callers
     * get a `WorkspaceAccountType` with no unknown case to switch over exhaustively.
     * @param accountId - ID of the account on the route, `{network}-{address}`.
     * @returns The type of the account.
     */
    resolveAccountType = async (
        accountId: string,
    ): Promise<WorkspaceAccountType> => {
        const { accountInfo, accountState } =
            await this.resolveAccount(accountId);

        if (accountState === WorkspaceAccountState.NOT_FOUND) {
            notFound();
        }

        const accountType = workspaceUtils.getAccountType(accountInfo);

        if (accountType == null) {
            throw new Error(
                `workspaceAccountInfoUtils: the account could not be verified (${accountState ?? 'no answer'}).`,
            );
        }

        return accountType;
    };
}

export const workspaceAccountInfoUtils = new WorkspaceAccountInfoUtils();
