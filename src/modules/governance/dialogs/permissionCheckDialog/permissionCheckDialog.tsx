import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { DefinitionList, Dialog, IconType, invariant, Link, StateSkeletonBar } from '@aragon/gov-ui-kit';
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
    const { slotId, onSuccess, onError, permissionNamespace, plugin, ...otherParams } = params;

    const { t } = useTranslations();
    const { close, updateOptions } = useDialogContext();

    const checkPermissions = useSlotSingleFunction<IPermissionCheckGuardParams, IPermissionCheckGuardResult>({
        slotId: slotId,
        pluginId: plugin.subdomain,
        params: { plugin, ...otherParams },
    }) ?? { hasPermission: true, isLoading: false, settings: [] };

    const { hasPermission, isLoading, settings } = checkPermissions;

    const handleDialogClose = useCallback(() => {
        onError?.();
        close();
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

    const keyNamespace = `app.governance.permissionCheckDialog.${permissionNamespace}`;
    const title = isLoading ? t('app.governance.permissionCheckDialog.loading') : t(`${keyNamespace}.title`);
    const description = isLoading ? undefined : t(`${keyNamespace}.description`);

    const footerAction = isLoading
        ? undefined
        : { label: t('app.governance.permissionCheckDialog.action'), onClick: handleDialogClose };

    const hasSettingsGroups = settings.length > 1;

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
                {!isLoading &&
                    settings.map((settingsGroup, groupIndex) => (
                        <div key={groupIndex} className="flex flex-col gap-y-1">
                            <DefinitionList.Container>
                                {settingsGroup.map(({ term, definition, href }, settingIndex) => (
                                    <DefinitionList.Item key={settingIndex} term={term}>
                                        {href == null && definition}
                                        {href != null && (
                                            <Link href={href} target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                                                {definition}
                                            </Link>
                                        )}
                                    </DefinitionList.Item>
                                ))}
                            </DefinitionList.Container>
                            {hasSettingsGroups && groupIndex < settings.length - 1 && (
                                <div className="my-2 flex items-center">
                                    <div className="grow border-t border-neutral-100" />
                                    <span className="mx-2 text-neutral-500">
                                        {t('app.governance.permissionCheckDialog.or')}
                                    </span>
                                    <div className="grow border-t border-neutral-100" />
                                </div>
                            )}
                        </div>
                    ))}
            </Dialog.Content>
            <Dialog.Footer secondaryAction={footerAction} />
        </>
    );
};
