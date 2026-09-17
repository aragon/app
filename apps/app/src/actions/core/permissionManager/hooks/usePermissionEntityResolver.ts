'use client';

import { useCallback, useMemo } from 'react';
import {
    type IPermissionEntity,
    permissionEntityUtils,
} from '@/modules/settings/utils/permissionEntityUtils';
import { useDao } from '@/shared/api/daoService';
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
 * entities, reusing the same resolver the permissions page uses so an address cannot
 * be labelled one way there and another way here.
 */
export const usePermissionEntityResolver = (
    params: IUsePermissionEntityResolverParams,
): ((address: string) => IPermissionEntity) => {
    const { daoId } = params;

    const hasDao = daoId != null;

    const { data: dao } = useDao(
        { urlParams: { id: daoId ?? '' } },
        { enabled: hasDao },
    );
    // A permission action describes what is installed on-chain, so plugins the app
    // cannot govern with must still resolve to their name.
    const daoPlugins = useDaoPlugins({
        daoId: daoId ?? '',
        includeUnsupported: true,
        enabled: hasDao,
    });

    const accounts = useMemo(
        () =>
            dao == null
                ? []
                : [
                      {
                          address: dao.address,
                          name: dao.name,
                          avatarSrc: ipfsUtils.cidToSrc(dao.avatar),
                      },
                  ],
        [dao],
    );

    return useCallback(
        (address: string) =>
            permissionEntityUtils.resolvePermissionEntity(address, {
                accounts,
                daoPlugins,
            }),
        [accounts, daoPlugins],
    );
};
