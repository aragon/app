'use client';

import {
    AlertInline,
    addressUtils,
    DefinitionList,
    Tooltip,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';

export interface IPermissionIdItemProps {
    /**
     * Raw keccak256 permission id carried by the action.
     */
    permissionId: string;
}

/**
 * Renders the permission of an action. The hash stays the value — it is what executes —
 * and the resolved name sits underneath it. An id outside the known set is marked, never
 * hidden, because a reviewer cannot tell an unknown permission from a known one by
 * looking at the hash.
 */
export const PermissionIdItem: React.FC<IPermissionIdItemProps> = (props) => {
    const { permissionId } = props;

    const { t } = useTranslations();

    const permissionName =
        permissionNameUtils.getKnownPermissionName(permissionId);

    return (
        <>
            <DefinitionList.Item
                copyValue={permissionId}
                description={permissionName}
                term={t('app.actions.core.permissionManager.permissionTerm')}
            >
                <Tooltip content={permissionId} triggerAsChild={true}>
                    <span>{addressUtils.truncateHash(permissionId)}</span>
                </Tooltip>
            </DefinitionList.Item>
            {permissionName == null && (
                <AlertInline
                    message={t(
                        'app.actions.core.permissionActionDetails.unknownPermission',
                    )}
                    variant="warning"
                />
            )}
        </>
    );
};
