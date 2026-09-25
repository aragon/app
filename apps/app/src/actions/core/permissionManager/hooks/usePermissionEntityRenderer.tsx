'use client';

import { ChainEntityType } from '@aragon/gov-ui-kit';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { networkUtils } from '@/shared/utils/networkUtils';
import { PermissionEntityItem } from '../components/permissionEntityItem';
import { usePermissionConditionResolver } from './usePermissionConditionResolver';
import { usePermissionEntityResolver } from './usePermissionEntityResolver';

export interface IUsePermissionEntityRendererParams {
    /**
     * ID of the DAO the action belongs to. Left out outside a DAO context (e.g. actions
     * forwarded to another chain); addresses then render as themselves.
     */
    daoId?: string;
    /**
     * Chain the explorer links point at.
     */
    chainId?: number;
    /**
     * Whether the action renders a condition, which needs the DAO permissions to resolve.
     */
    hasCondition?: boolean;
}

export type PermissionEntityRenderer = (
    term: string,
    address: string,
    isCondition?: boolean,
) => React.ReactNode;

/**
 * Renders one address of a permission action as a resolved entity item, with the
 * DAO / plugin lookups and explorer link set up once per action rather than per item.
 */
export const usePermissionEntityRenderer = (
    params: IUsePermissionEntityRendererParams,
): PermissionEntityRenderer => {
    const { daoId, chainId, hasCondition = false } = params;

    const { buildEntityUrl } = useDaoChain({ chainId });
    const resolveEntity = usePermissionEntityResolver({ daoId });
    const resolveCondition = usePermissionConditionResolver({
        daoId,
        enabled: hasCondition,
    });
    const network =
        chainId != null ? networkUtils.getNetworkByChainId(chainId) : undefined;

    return (term, address, isCondition = false) => (
        <PermissionEntityItem
            address={address}
            href={buildEntityUrl({
                type: ChainEntityType.ADDRESS,
                id: address,
            })}
            label={
                (isCondition ? resolveCondition(address) : undefined) ??
                resolveEntity(address).label
            }
            network={network}
            term={term}
        />
    );
};
