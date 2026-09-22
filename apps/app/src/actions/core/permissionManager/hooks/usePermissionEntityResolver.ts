'use client';

import { useCallback, useMemo } from 'react';
import {
    type IPermissionEntity,
    permissionEntityUtils,
} from '@/modules/settings/utils/permissionEntityUtils';
import { useDao } from '@/shared/api/daoService';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

export interface IUsePermissionEntityResolverParams {
    /**
     * ID of the DAO the permission action belongs to. Left out for actions rendered
     * outside a DAO context, such as those forwarded to another chain, where the
     * addresses resolve to nothing but themselves.
     */
    daoId?: string;
}

/**
 * Resolves the `who` / `where` addresses of a permission action to display-ready
 * entities. It feeds the resolver the same accounts and plugins as the permissions page
 * (linked accounts, sub-plugins, unsupported plugins) so an address cannot be labelled
 * one way there and another way here.
 */
export const usePermissionEntityResolver = (
    params: IUsePermissionEntityResolverParams,
): ((address: string) => IPermissionEntity) => {
    const { daoId } = params;

    const hasDao = daoId != null;

    const { isEnabled } = useFeatureFlags();

    const { data: dao } = useDao(
        { urlParams: { id: daoId ?? '' } },
        { enabled: hasDao },
    );
    // A permission action describes what is installed on-chain, so plugins the app
    // cannot govern with must still resolve to their name.
    const daoPlugins = useDaoPlugins({
        daoId: daoId ?? '',
        includeSubPlugins: true,
        includeLinkedAccounts: true,
        includeUnsupported: true,
        enabled: hasDao,
    });

    const accounts = useMemo(() => {
        if (dao == null) {
            return [];
        }

        const mainAccount = {
            address: dao.address,
            name: dao.name,
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
                address: account.address,
                name: account.name,
                avatarSrc: ipfsUtils.cidToSrc(account.avatar),
            })),
        ];
    }, [dao, isEnabled]);

    return useCallback(
        (address: string) =>
            permissionEntityUtils.resolvePermissionEntity(address, {
                accounts,
                daoPlugins,
            }),
        [accounts, daoPlugins],
    );
};
