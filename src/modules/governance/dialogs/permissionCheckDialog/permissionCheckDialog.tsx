import { GovernanceDialog } from '@/modules/governance/constants/moduleDialogs';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { DefinitionList, Dialog, invariant, StateSkeletonBar } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';

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
    const { slotId, onSuccess, onError, permissionNamespace, plugin, daoId } = params;

    const { t } = useTranslations();
    const { close, updateOptions } = useDialogContext();

    const checkPermissions = useSlotSingleFunction<IPermissionCheckGuardParams, IPermissionCheckGuardResult>({
        slotId: slotId,
        pluginId: plugin.subdomain,
        params: { plugin, daoId },
    }) ?? { hasPermission: true };

    const { settings, isLoading, hasPermission } = checkPermissions;

    const handleDialogClose = useCallback(() => {
        close(GovernanceDialog.PERMISSION_CHECK);
        onError?.();
    }, [close, onError]);

    useEffect(() => {
        if (hasPermission) {
            onSuccess?.();
            handleDialogClose();
        }
    }, [hasPermission, onSuccess, close, handleDialogClose]);

    useEffect(() => {
        updateOptions({ onClose: handleDialogClose });
    }, [handleDialogClose, updateOptions]);

    const keyNamespace = `app.governance.permissionCheckDialog.${permissionNamespace}`;
    const title = isLoading ? t('app.governance.permissionCheckDialog.loading') : t(`${keyNamespace}.title`);
    const description = isLoading ? undefined : t(`${keyNamespace}.description`);

    const footerAction = isLoading
        ? undefined
        : { label: t('app.governance.permissionCheckDialog.action'), onClick: handleDialogClose };

    return (
        <>
            <Dialog.Header title={title} description={description} />
            <Dialog.Content className="pb-4 pt-1 md:pb-6 md:pt-2">
                {isLoading && (
                    <div className="flex w-full flex-col gap-y-2">
                        <StateSkeletonBar width="40%" size="lg" />
                        <StateSkeletonBar width="65%" size="lg" />
                    </div>
                )}
                {!isLoading && (
                    <DefinitionList.Container>
                        {settings?.map((setting, index) => (
                            <DefinitionList.Item key={index} term={setting.term}>
                                {setting.definition}
                            </DefinitionList.Item>
                        ))}
                    </DefinitionList.Container>
                )}
            </Dialog.Content>
            <Dialog.Footer secondaryAction={footerAction} />
        </>
    );
};
