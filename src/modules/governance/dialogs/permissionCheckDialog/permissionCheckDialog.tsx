import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { type ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import { Dialog, Heading } from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import type { IUsePermissionCheckBaseParams } from '../../hooks/usePermissionCheckGuard';

export interface IPermissionCheckDialogParams<TSlotParams extends IUsePermissionCheckBaseParams> {
    /**
     * Parameters related to the proposal.
     */
    params: TSlotParams;
    /**
     * Slot ID to use for checking the user permissions.
     */
    slotId: string;
    /**
     * Callback called when closing the permission check dialog.
     */
    onError?: () => void;
    /**
     * Plugin ID to use for the plugin component.
     */
    plugin: ITabComponentPlugin<IDaoPlugin>;
}

export interface IPermissionCheckDialogProps<TSlotParams extends IUsePermissionCheckBaseParams>
    extends IDialogComponentProps<IPermissionCheckDialogParams<TSlotParams>> {}

export const PermissionCheckDialog = <TSlotParams extends IUsePermissionCheckBaseParams>(
    props: IPermissionCheckDialogProps<TSlotParams>,
) => {
    const { params } = props.location;
    const { slotId, plugin, onError } = params ?? {};

    const { close } = useDialogContext();

    const handleDialogClose = useCallback(() => {
        close();
        onError?.();
    }, [close, onError]);

    return (
        <>
            <Dialog.Content className="flex flex-col gap-y-4 py-4 md:py-6">
                <div>
                    <Heading size="h3">You can&apos;t create</Heading>
                    <p className="text-neutral-500">Not a member of this voting body</p>
                </div>
                <PluginSingleComponent slotId={slotId!} pluginId={plugin!.id} plugin={plugin} />
            </Dialog.Content>
            <Dialog.Footer secondaryAction={{ label: 'Okay', onClick: handleDialogClose }} />
        </>
    );
};
