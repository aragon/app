import { addressUtils, DefinitionList } from '@aragon/gov-ui-kit';
import type { IDaoPermission } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { conditionTypeUtils } from '../../utils/conditionTypeUtils';
import { PermissionAddressListItem } from './permissionAddressListItem';
import {
    type IPermissionDetailsEntity,
    PermissionEntityListItem,
} from './permissionEntityListItem';

export interface IPermissionDetailsListProps {
    row: IDaoPermission;
    who: IPermissionDetailsEntity;
    where: IPermissionDetailsEntity;
    chainId?: number;
}

export const PermissionDetailsList: React.FC<IPermissionDetailsListProps> = (
    props,
) => {
    const { row, who, where, chainId } = props;
    const { t } = useTranslations();
    const permissionName = permissionNameUtils.getPermissionName(
        row.permissionId,
    );
    const {
        address: conditionAddress,
        label: conditionLabel,
        hasCondition,
    } = conditionTypeUtils.resolveConditionDisplay(row);

    return (
        <DefinitionList.Container>
            <PermissionEntityListItem
                chainId={chainId}
                entity={who}
                term={t('app.settings.permissionsList.details.who')}
            />
            <PermissionEntityListItem
                chainId={chainId}
                entity={where}
                term={t('app.settings.permissionsList.details.where')}
            />
            <DefinitionList.Item
                copyValue={row.permissionId}
                description={permissionName}
                term={t('app.settings.permissionsList.details.permission')}
            >
                {addressUtils.truncateHash(row.permissionId)}
            </DefinitionList.Item>
            {hasCondition ? (
                <PermissionAddressListItem
                    address={conditionAddress}
                    chainId={chainId}
                    name={conditionLabel}
                    term={t('app.settings.permissionsList.details.condition')}
                />
            ) : (
                <DefinitionList.Item
                    term={t('app.settings.permissionsList.details.condition')}
                >
                    {conditionLabel}
                </DefinitionList.Item>
            )}
        </DefinitionList.Container>
    );
};
