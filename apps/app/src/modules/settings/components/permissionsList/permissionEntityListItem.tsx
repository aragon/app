import { DefinitionList } from '@aragon/gov-ui-kit';
import type { IPermissionEntity } from '../../utils/permissionEntityUtils';
import { PermissionAddressListItem } from './permissionAddressListItem';

interface IPermissionEntityListItemProps {
    entity: IPermissionEntity;
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
