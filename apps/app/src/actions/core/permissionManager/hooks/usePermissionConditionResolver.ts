'use client';

import { addressUtils } from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import { conditionTypeUtils } from '@/modules/settings/utils/conditionTypeUtils';
import {
    type Network,
    useAllDaoPermissions,
    useDao,
} from '@/shared/api/daoService';

export interface IUsePermissionConditionResolverParams {
    /**
     * ID of the DAO the permission action belongs to. Conditions do not resolve without it.
     */
    daoId?: string;
    /**
     * Whether the action has a condition to resolve, so the DAO permissions are only
     * fetched when needed.
     */
    enabled: boolean;
}

/**
 * Resolves a condition address to the same label the permissions page shows for it
 * (e.g. `VotingPower`), when the DAO already has a permission using that condition.
 */
export const usePermissionConditionResolver = (
    params: IUsePermissionConditionResolverParams,
): ((address: string) => string | undefined) => {
    const { daoId, enabled } = params;

    const { data: dao } = useDao(
        { urlParams: { id: daoId ?? '' } },
        { enabled: enabled && daoId != null },
    );
    const { data: permissions } = useAllDaoPermissions(
        {
            urlParams: {
                network: dao?.network as Network,
                daoAddress: dao?.address ?? '',
            },
        },
        { enabled: enabled && dao != null },
    );

    return useCallback(
        (address: string) => {
            const permission = permissions?.find(
                ({ conditionAddress }) =>
                    conditionAddress != null &&
                    addressUtils.isAddressEqual(conditionAddress, address),
            );

            if (permission == null) {
                return undefined;
            }

            const { label, isUnrecognized } =
                conditionTypeUtils.resolveConditionDisplay(permission);

            return isUnrecognized ? undefined : label;
        },
        [permissions],
    );
};
