import type {
    IPermissionCheckGuardResult,
    IUsePermissionCheckGuardParams,
    IUsePermissionCheckGuardSlotParams,
} from '@/modules/governance/types';
import type { IPluginSettings } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { DefinitionList, Dialog, invariant, StateSkeletonBar } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';

export interface IPermissionCheckDialogParams {
    /**
     * Callback called when the user has the required permissions.
     */
    onSuccess?: () => void;
    /**
     * Callback called when the user does not have the required permissions.
     */
    onError?: () => void;
}

export interface IPermissionCheckDialogProps<IUseCheckPermissionGuardBaseParams>
    extends IDialogComponentProps<IUseCheckPermissionGuardBaseParams> {}

export const PermissionCheckDialog = (props: IPermissionCheckDialogProps<IUsePermissionCheckGuardParams>) => {
    const { params } = props.location;
    const { slotParams, slotId, onSuccess, onError } = params ?? {};
    const { plugin, title, description } = slotParams ?? {};

    invariant(plugin != null, 'PermissionCheckDialog: plugin is required for permission check dialog');
    invariant(slotId != null, 'PermissionCheckDialog: slotId is required for permission check dialog');
    invariant(
        title != null && description != null,
        'PermissionCheckDialog: title and description are required for permission check dialog',
    );

    const { t } = useTranslations();

    const { close, updateOptions } = useDialogContext();

    const checkPermissions = useSlotSingleFunction<
        IUsePermissionCheckGuardSlotParams<IPluginSettings>,
        IPermissionCheckGuardResult
    >({
        slotId: slotId,
        pluginId: plugin.subdomain,
        params: slotParams!,
    }) ?? { hasPermission: true };

    const { settings, isLoading, hasPermission } = checkPermissions;

    const handleDialogClose = useCallback(() => {
        close();
        onError?.();
    }, [close, onError]);

    useEffect(() => {
        if (hasPermission) {
            onSuccess?.();
            close();
        }
    }, [hasPermission, onSuccess, close]);

    useEffect(() => {
        updateOptions({ onClose: handleDialogClose });
    }, [handleDialogClose, updateOptions]);

    if (isLoading) {
        return (
            <>
                <Dialog.Header title={t('app.governance.permissionCheckBaseDialog.loading')} />
                <Dialog.Content className="pb-4 pt-1 md:pb-6 md:pt-2">
                    <div className="flex w-full flex-col gap-y-2">
                        <StateSkeletonBar width="40%" size="lg" />
                        <StateSkeletonBar width="65%" size="lg" />
                    </div>
                </Dialog.Content>
                <Dialog.Footer />
            </>
        );
    }

    return (
        <>
            <Dialog.Header title={title} description={description} />
            <Dialog.Content className="pb-4 pt-1 md:pb-6 md:pt-2">
                <DefinitionList.Container>
                    {settings?.map((setting, index) => (
                        <DefinitionList.Item key={index} term={setting.term}>
                            {setting.definition}
                        </DefinitionList.Item>
                    ))}
                </DefinitionList.Container>
            </Dialog.Content>
            <Dialog.Footer
                secondaryAction={{
                    label: t('app.governance.permissionCheckBaseDialog.action'),
                    onClick: handleDialogClose,
                }}
            />
        </>
    );
};
