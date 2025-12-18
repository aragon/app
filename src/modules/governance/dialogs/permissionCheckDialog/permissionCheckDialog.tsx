import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { PermissionsDefinitionList } from '../../components/permissionsDefinitionList';
import { GovernanceDialogId } from '../../constants/governanceDialogId';

export interface IPermissionCheckDialogParams extends IPermissionCheckGuardParams {
    /**
     * Slot ID to use for checking the user permissions.
     */
    slotId: string;
    /**
     * Callback called when the user has the required permissions.
     */
    onSuccess?: () => void;
    /**
     * Callback called when the user does not have the required permissions.
     */
    onError?: () => void;
    /**
     * Namespace to be used for the dialog title and description.
     */
    permissionNamespace: string;
}

export interface IPermissionCheckDialogProps extends IDialogComponentProps<IPermissionCheckDialogParams> {}

export const PermissionCheckDialog: React.FC<IPermissionCheckDialogProps> = (props) => {
    const { params } = props.location;

    invariant(params != null, 'PermissionCheckDialog: plugin is required for permission check dialog');
    const { slotId, onSuccess, onError, permissionNamespace, plugin, ...otherParams } = params;

    const { t } = useTranslations();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const { close, updateOptions } = useDialogContext();

    const checkPermissions = useSlotSingleFunction<IPermissionCheckGuardParams, IPermissionCheckGuardResult>({
        slotId,
        pluginId: plugin.interfaceType,
        params: { plugin, ...otherParams },
    }) ?? { hasPermission: true, isLoading: false, settings: [] };

    const { hasPermission, isLoading, settings } = checkPermissions;

    const handleDialogClose = useCallback(() => {
        onError?.();
        close(GovernanceDialogId.PERMISSION_CHECK);
    }, [close, onError]);

    useEffect(() => {
        if (hasPermission) {
            onSuccess?.();
            close(GovernanceDialogId.PERMISSION_CHECK);
        }
    }, [hasPermission, onSuccess, close]);

    useEffect(() => {
        updateOptions({ onClose: handleDialogClose });

        return () => updateOptions({ onClose: undefined });
    }, [handleDialogClose, updateOptions]);

    const keyNamespace = `app.governance.permissionCheckDialog.${permissionNamespace}`;
    const title = isLoading ? t('app.governance.permissionCheckDialog.loading') : t(`${keyNamespace}.title`);
    const description = isLoading ? undefined : t(`${keyNamespace}.description`);

    const footerAction = isLoading ? undefined : { label: t('app.governance.permissionCheckDialog.action'), onClick: handleDialogClose };

    return (
        <>
            <Dialog.Header description={description} title={title} />
            <Dialog.Content className="pb-3">
                <PermissionsDefinitionList isLoading={isLoading} settings={settings} />
            </Dialog.Content>
            <Dialog.Footer primaryAction={footerAction} />
        </>
    );
};
