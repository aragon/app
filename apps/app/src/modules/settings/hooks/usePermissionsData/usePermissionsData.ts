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
import type { IPermissionRow } from '../../types';
import type { IPermissionAccountRef } from '../../utils/permissionEntityUtils';

export interface IPermissionsDataAccount {
    id: string;
    name: string;
    network: Network;
    daoAddress: string;
    avatarSrc?: string;
}

export interface IUsePermissionsDataParams {
    daoId: string;
}

export interface IUsePermissionsDataResult {
    dao?: IDao;
    accounts: IPermissionsDataAccount[];
    activeAccountId?: string;
    setSelectedAccountId: (id: string) => void;
    activeAccount?: IPermissionsDataAccount;
    accountRefs: IPermissionAccountRef[];
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
    rows: IPermissionRow[];
    chainId?: number;
    isLoading: boolean;
    error?: unknown;
}

export const usePermissionsData = (
    params: IUsePermissionsDataParams,
): IUsePermissionsDataResult => {
    const { daoId } = params;

    const { isEnabled } = useFeatureFlags();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const realDaoPlugins = useDaoPlugins({
        daoId,
        includeSubPlugins: true,
        includeLinkedAccounts: true,
    });

    const accounts = useMemo<IPermissionsDataAccount[]>(() => {
        if (dao == null) {
            return [];
        }

        const mainAccount: IPermissionsDataAccount = {
            id: dao.id,
            name: dao.name,
            network: dao.network,
            daoAddress: dao.address,
            avatarSrc: ipfsUtils.cidToSrc(dao.avatar),
        };

        const linkedAccounts = dao.linkedAccounts ?? [];
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
    }, [dao, isEnabled]);

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

    const { data, isLoading, error } = useAllDaoPermissions(
        {
            urlParams: {
                network: activeAccount?.network as Network,
                daoAddress: activeAccount?.daoAddress ?? '',
            },
        },
        { enabled: activeAccount != null },
    );

    const rows = useMemo<IPermissionRow[]>(
        () => (data ?? []) as IPermissionRow[],
        [data],
    );

    const chainId = activeAccount
        ? networkDefinitions[activeAccount.network].id
        : undefined;
    const daoPlugins = useMemo(() => {
        if (realDaoPlugins == null || dao == null || activeAccount == null) {
            return realDaoPlugins;
        }

        const rootDaoAddress = dao.address.toLowerCase();
        const activeDaoAddress = activeAccount.daoAddress.toLowerCase();

        return realDaoPlugins.filter((plugin) => {
            const pluginDaoAddress = plugin.meta.daoAddress?.toLowerCase();

            if (pluginDaoAddress == null) {
                return activeDaoAddress === rootDaoAddress;
            }

            return pluginDaoAddress === activeDaoAddress;
        });
    }, [activeAccount, dao, realDaoPlugins]);

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
        error,
    };
};
