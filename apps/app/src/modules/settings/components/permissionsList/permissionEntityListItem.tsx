import { AddressOutput, DefinitionList } from '@aragon/gov-ui-kit';
import type { IPermissionEntity } from '../../utils/permissionEntityUtils';
import { PermissionAddressListItem } from './permissionAddressListItem';

/**
 * The subset of a resolved permission entity the detail rows actually render.
 * Kept narrow so callers without a full resolution (e.g. graph nodes) can map
 * into it. `label` is optional for those callers: without a resolved name the
 * row falls back to rendering the raw address itself.
 */
export type IPermissionDetailsEntity = Pick<
    IPermissionEntity,
    'address' | 'isSentinel' | 'detailName'
> & {
    label?: IPermissionEntity['label'];
};

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
        // Without that label the raw sentinel address is what shows, so it
        // renders as an address and owns its own copy control.
        return entity.label != null ? (
            <DefinitionList.Item copyValue={entity.address} term={term}>
                {entity.label}
            </DefinitionList.Item>
        ) : (
            <DefinitionList.Item term={term}>
                <AddressOutput address={entity.address} />
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
