'use client';

import { ChainEntityType } from '@aragon/gov-ui-kit';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { PermissionEntityItem } from '../components/permissionEntityItem';
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
}

export type PermissionEntityRenderer = (
    term: string,
    address: string,
    helpText?: string,
) => React.ReactNode;

/**
 * Renders one address of a permission action as a resolved entity item, with the
 * DAO / plugin lookups and explorer link set up once per action rather than per item.
 */
export const usePermissionEntityRenderer = (
    params: IUsePermissionEntityRendererParams,
): PermissionEntityRenderer => {
    const { daoId, chainId } = params;

    const { buildEntityUrl } = useDaoChain({ chainId });
    const resolveEntity = usePermissionEntityResolver({ daoId });

    return (term, address, helpText) => (
        <PermissionEntityItem
            address={address}
            helpText={helpText}
            href={buildEntityUrl({
                type: ChainEntityType.ADDRESS,
                id: address,
            })}
            label={resolveEntity(address).label}
            term={term}
        />
    );
};
