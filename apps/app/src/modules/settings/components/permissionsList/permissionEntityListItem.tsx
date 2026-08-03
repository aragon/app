import { DefinitionList } from '@aragon/gov-ui-kit';
import type { IPermissionEntity } from '../../utils/permissionEntityUtils';
import { PermissionAddressListItem } from './permissionAddressListItem';

/**
 * The subset of a resolved permission entity the detail rows actually render.
 * Kept narrow so callers without a full resolution (e.g. graph nodes) can map
 * into it.
 */
export type IPermissionDetailsEntity = Pick<
    IPermissionEntity,
    'address' | 'label' | 'isSentinel' | 'detailName'
>;

interface IPermissionEntityListItemProps {
    entity: IPermissionDetailsEntity;
    term: string;
    chainId?: number;
}

export const PermissionEntityListItem: React.FC<
    IPermissionEntityListItemProps
> = ({ entity, term, chainId }) => {
    if (entity.isSentinel) {
        // Sentinels resolve to a human label whose truncated address is the
        // same string, so a description line would duplicate the primary.
        return (
            <DefinitionList.Item copyValue={entity.address} term={term}>
                {entity.label}
            </DefinitionList.Item>
        );
    }

    return (
        <PermissionAddressListItem
            address={entity.address}
            chainId={chainId}
            name={entity.detailName}
            term={term}
        />
    );
};
