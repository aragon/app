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
}

export const usePermissionsData = (
    params: IUsePermissionsDataParams,
): IUsePermissionsDataResult => {
    const { daoId } = params;

    const { isEnabled } = useFeatureFlags();

    const { data: realDao } = useDao({ urlParams: { id: daoId } });
    const realDaoPlugins = useDaoPlugins({
        daoId,
        includeLinkedAccounts: true,
    });

    const dao = realDao;
    const daoPlugins = realDaoPlugins;

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

    const accounts = realAccounts;

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

    const rows = useMemo(() => {
        const rawRows = (data ?? []) as IPermissionRow[];
        return rawRows;
    }, [data]);

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
