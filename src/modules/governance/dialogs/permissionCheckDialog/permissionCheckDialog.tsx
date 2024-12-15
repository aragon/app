import { GovernanceDialog } from '@/modules/governance/constants/moduleDialogs';
import type { IUseCheckPermissionGuardBaseParams } from '@/modules/governance/hooks/usePermissionCheckGuard/usePermissionCheckGuard';
import type { IPermissionCheckGuardResult } from '@/modules/governance/types';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { DefinitionList, Dialog, Heading, StateSkeletonBar } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';

export interface IPermissionCheckGuardSetting {
    /**
     * Term of the permission setting.
     */
    term: string;
    /**
     * Definition of the permission setting.
     */
    definition: string;
}

export interface IPermissionCheckDialogParams<TSlotParams extends IUseCheckPermissionGuardBaseParams> {
    /**
     * Parameters related to the proposal.
     */
    params: TSlotParams;
    /**
     * Id of the slot to be used for checking the user permissions.
     */
    slotId: string;
    /**
     * Callback called when user has permissions
     */
    onSuccess?: () => void;
    /**
     * Callback called when user does not have permissions.
     */
    onError?: () => void;
    /**
     * Callback to update the permissions.
     */
    updatePermissions: (permissions: boolean) => void;
    /**
     * Additional data to be passed to the dialog.
     */
    slotParams: TSlotParams;
}

export interface IPermissionCheckDialogProps<TSlotParams extends IUseCheckPermissionGuardBaseParams>
    extends IDialogComponentProps<IPermissionCheckDialogParams<TSlotParams>> {}

export const PermissionCheckDialog = <TSlotParams extends IUseCheckPermissionGuardBaseParams>(
    props: IPermissionCheckDialogProps<TSlotParams>,
) => {
    const { params } = props.location;
    const { slotParams, slotId, onSuccess, onError } = params ?? {};
    const { plugin } = slotParams ?? {};

    const { t } = useTranslations();

    const { close, updateOptions } = useDialogContext();

    const checkPermissions = useSlotSingleFunction<IUseCheckPermissionGuardBaseParams, IPermissionCheckGuardResult>({
        slotId: slotId!,
        pluginId: plugin!.subdomain,
        params: slotParams!,
    }) ?? { hasPermission: true, settings: [], isLoading: false };

    const { settings, isLoading, hasPermission } = checkPermissions;

    const handleDialogClose = useCallback(() => {
        close(GovernanceDialog.PERMISSION_CHECK);
        onError?.();
    }, [close, onError]);

    useEffect(() => {
        if (hasPermission) {
            onSuccess?.();
        }
    }, [hasPermission, onSuccess, close]);

    useEffect(() => {
        updateOptions({ onClose: handleDialogClose });
    }, [handleDialogClose, updateOptions]);

    if (isLoading) {
        return (
            <Dialog.Content className="flex w-full flex-col gap-y-4 py-4 md:py-6">
                <Heading size="h3">{t('app.governance.permissionCheckDialog.checkingPermissions')}</Heading>
                <div className="flex w-full flex-col gap-y-2">
                    <StateSkeletonBar width="40%" size="lg" />
                    <StateSkeletonBar width="65%" size="lg" />
                </div>
            </Dialog.Content>
        );
    }

    return (
        <>
            <Dialog.Content className="flex flex-col gap-y-4 py-4 md:py-6">
                <div>
                    <Heading size="h3">{t('app.governance.permissionCheckDialog.title')}</Heading>
                    <p className="text-sm text-neutral-500 md:text-base">
                        {t('app.governance.permissionCheckDialog.description')}
                    </p>
                </div>
                <DefinitionList.Container>
                    {settings?.map((setting, index) => (
                        <DefinitionList.Item key={index} term={setting.term}>
                            {setting.definition}
                        </DefinitionList.Item>
                    ))}
                </DefinitionList.Container>
            </Dialog.Content>
            <Dialog.Footer secondaryAction={{ label: 'Okay', onClick: handleDialogClose }} />
        </>
    );
};
