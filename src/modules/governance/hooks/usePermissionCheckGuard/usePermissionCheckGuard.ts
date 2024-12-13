import { type IUseConnectedParticipantGuardBaseParams } from '@/modules/governance/hooks/useConnectedParticipantGuard';
import type { IUseGuardBaseParams } from '@/modules/governance/types/useGuardBaseParams';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useCallback, useState } from 'react';
import { GovernanceDialog } from '../../constants/moduleDialogs';

export interface IUsePermissionCheckGuardParams<TSlotParams extends IUseConnectedParticipantGuardBaseParams>
    extends IUseGuardBaseParams {
    /**
     * Parameters to be forwarded to the plugin-specific slot function.
     */
    params: TSlotParams;
    /**
     * Slot ID to use for checking the user permissions.
     */
    slotId: string;
}

export const usePermissionCheckGuard = <TSlotParams extends IUseConnectedParticipantGuardBaseParams>(
    params: IUsePermissionCheckGuardParams<TSlotParams>,
) => {
    const { onSuccess, onError, params: slotParams, slotId } = params;

    const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);

    const { open } = useDialogContext();

    const updatePermissions = useCallback(
        (permissions: boolean) => {
            setHasPermissions(permissions);
            if (permissions && onSuccess) {
                onSuccess();
            } else if (!permissions && onError) {
                onError();
            }
        },
        [onSuccess, onError],
    );

    const checkPermission = useCallback(() => {
        const dialogParams = { slotParams, slotId, onError, onSuccess, updatePermissions };
        open(GovernanceDialog.PERMISSION_CHECK, {
            params: dialogParams,
        });
    }, [onError, onSuccess, open, slotParams, slotId, updatePermissions]);

    return { check: checkPermission, result: hasPermissions, updatePermissions };
};
