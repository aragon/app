'use client';

import { useMemo, useState } from 'react';
import {
    type IDao,
    type IDaoPlugin,
    type Network,
    useAllDaoPermissions,
    useDao,
} from '@/shared/api/daoService';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    permissionsPreviewAccounts,
    permissionsPreviewDao,
    permissionsPreviewPlugins,
} from '../../constants/permissionsPreviewData';
import { PermissionsPreviewRef } from '../../constants/permissionsPreviewRefs';
import type { IPermissionRow } from '../../types';
import type { IPermissionAccountRef } from '../../utils/permissionEntityUtils';

/**
 * Account shown in the permissions account selector and used to scope the
 * fetched permissions.
 */
export interface IPermissionsDataAccount {
    id: string;
    name: string;
    network: Network;
    daoAddress: string;
    avatarSrc?: string;
}

export interface IUsePermissionsDataParams {
    /**
     * ID of the DAO to load permissions for.
     */
    daoId: string;
}

export interface IUsePermissionsDataResult {
    /**
     * The DAO the permissions belong to (Patito DAO under the preview flag),
     * consumed by the graph view.
     */
    dao?: IDao;
    /**
     * The DAO and its linked accounts, driving the account selector.
     */
    accounts: IPermissionsDataAccount[];
    /**
     * Currently selected account id.
     */
    activeAccountId?: string;
    /**
     * Selects an account by id.
     */
    setSelectedAccountId: (id: string) => void;
    /**
     * The resolved active account.
     */
    activeAccount?: IPermissionsDataAccount;
    /**
     * Account references (address + display data) used to resolve `who` / `where`
     * entities in the list view.
     */
    accountRefs: IPermissionAccountRef[];
    /**
     * Installed DAO plugins used to classify plugin entities.
     */
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
    /**
     * Permission rows for the active account (preview markers already resolved).
     */
    rows: IPermissionRow[];
    /**
     * Chain id of the active account, for block-explorer links.
     */
    chainId?: number;
    /**
     * Whether the permissions are still loading.
     */
    isLoading: boolean;
}

/**
 * Single source of truth for the permissions views: fetches the DAO, its
 * plugins and permissions, owns the account selection, and applies the preview
 * identity + marker swap when `useMocks` is on. Both the list and graph render
 * from this so a view toggle never changes the underlying data.
 */
export const usePermissionsData = (
    params: IUsePermissionsDataParams,
): IUsePermissionsDataResult => {
    const { daoId } = params;

    const { isEnabled } = useFeatureFlags();

    // The `useMocks` flag drives both the preview permission rows and the
    // self-contained "Patito DAO" identity they resolve against.
    const isPreview = isEnabled('useMocks');

    const { data: realDao } = useDao({ urlParams: { id: daoId } });
    const realDaoPlugins = useDaoPlugins({
        daoId,
        includeLinkedAccounts: true,
    });

    const dao = isPreview ? permissionsPreviewDao : realDao;
    const daoPlugins = isPreview ? permissionsPreviewPlugins : realDaoPlugins;

    const realAccounts = useMemo<IPermissionsDataAccount[]>(() => {
        if (realDao == null) {
            return [];
        }

        const mainAccount: IPermissionsDataAccount = {
            id: realDao.id,
            name: realDao.name,
            network: realDao.network,
            daoAddress: realDao.address,
            avatarSrc: ipfsUtils.cidToSrc(realDao.avatar),
        };

        const linkedAccounts = realDao.linkedAccounts ?? [];
        const showLinkedAccounts =
            isEnabled('linkedAccount') && linkedAccounts.length > 0;

        if (!showLinkedAccounts) {
            return [mainAccount];
        }

        return [
            mainAccount,
            ...linkedAccounts.map((account) => ({
                id: account.id,
                name: account.name,
                network: account.network,
                daoAddress: account.address,
                avatarSrc: ipfsUtils.cidToSrc(account.avatar),
            })),
        ];
    }, [realDao, isEnabled]);

    const accounts = isPreview ? permissionsPreviewAccounts : realAccounts;

    const [selectedAccountId, setSelectedAccountId] = useState<string>();
    const activeAccountId = selectedAccountId ?? accounts[0]?.id;
    const activeAccount =
        accounts.find((account) => account.id === activeAccountId) ??
        accounts[0];

    const accountRefs = useMemo<IPermissionAccountRef[]>(
        () =>
            accounts.map((account) => ({
                address: account.daoAddress,
                name: account.name,
                avatarSrc: account.avatarSrc,
            })),
        [accounts],
    );

    const { data, isLoading } = useAllDaoPermissions(
        {
            urlParams: {
                network: activeAccount?.network as Network,
                daoAddress: activeAccount?.daoAddress ?? '',
            },
        },
        { enabled: activeAccount != null },
    );

    // NOTE: the optional `condition` field is supplied by the preview mock until
    // APP-953 formalizes it on the permissions response; cast at this boundary.
    const rows = useMemo(() => {
        const rawRows = (data ?? []) as IPermissionRow[];
        const pluginAddresses = (daoPlugins ?? []).map(
            (plugin) => plugin.meta.address,
        );

        const linkedAddress = accounts.find(
            (account) => account.id !== activeAccount?.id,
        )?.daoAddress;

        // Swap preview markers for the viewed DAO's real addresses so the sample
        // rows resolve to names/tags/avatars. No-op for real backend data.
        const refMap = new Map<string, string | undefined>([
            [
                PermissionsPreviewRef.self.toLowerCase(),
                activeAccount?.daoAddress,
            ],
            [PermissionsPreviewRef.linked.toLowerCase(), linkedAddress],
            [PermissionsPreviewRef.plugin0.toLowerCase(), pluginAddresses[0]],
            [PermissionsPreviewRef.plugin1.toLowerCase(), pluginAddresses[1]],
        ]);
        const resolveRef = (address: string): string =>
            refMap.get(address.toLowerCase()) ?? address;

        return rawRows.map((row) => ({
            ...row,
            whoAddress: resolveRef(row.whoAddress),
            whereAddress: resolveRef(row.whereAddress),
        }));
    }, [data, daoPlugins, accounts, activeAccount]);

    const chainId = activeAccount
        ? networkDefinitions[activeAccount.network].id
        : undefined;

    return {
        dao,
        accounts,
        activeAccountId,
        setSelectedAccountId,
        activeAccount,
        accountRefs,
        daoPlugins,
        rows,
        chainId,
        isLoading,
    };
};
