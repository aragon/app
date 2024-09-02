import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import { Dialog, Spinner } from '@aragon/ods';
import { useCallback, useEffect } from 'react';
import { type IUsePermissionCheckBaseParams } from '../../hooks/usePermissionCheckGuard';
import type { IPermissionCheckGuardResult } from '../../types';

export interface IPermissionCheckDialogParams<TSlotParams extends IUsePermissionCheckBaseParams> {
    /**
     * Parameters to be forwarded to the slot-function to check for permissions.
     */
    params: TSlotParams;
    /**
     * ID of the slot to be used to retrieve the related slot-function.
     */
    slotId: string;
    /**
     * Callback called on permission check success.
     */
    onSuccess?: () => void;
    /**
     * Callback called when closing the permission check dialog.
     */
    onError?: () => void;
}

export interface IPermissionCheckDialogProps<TSlotParams extends IUsePermissionCheckBaseParams>
    extends IDialogComponentProps<IPermissionCheckDialogParams<TSlotParams>> {}

export const PermissionCheckDialog = <TSlotParams extends IUsePermissionCheckBaseParams>(
    props: IPermissionCheckDialogProps<TSlotParams>,
) => {
    const { params } = props.location;
    const { params: slotParams, slotId, onSuccess, onError } = params ?? {};
    const { daoId } = slotParams ?? {};

    const { close, updateOptions } = useDialogContext();
    const pluginIds = useDaoPluginIds(daoId!);

    const { hasPermission, isLoading, settings } = useSlotFunction<IPermissionCheckGuardResult, TSlotParams>({
        slotId: slotId!,
        pluginIds,
        params: slotParams,
    })!;

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
            <Dialog.Content>
                <Spinner />
            </Dialog.Content>
        );
    }

    return (
        <>
            <Dialog.Content>
                <p>Required params: {JSON.stringify(settings)}</p>
            </Dialog.Content>
            <Dialog.Footer primaryAction={{ label: 'OK', onClick: handleDialogClose }} />
        </>
    );
};
