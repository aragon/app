import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import { Dialog, Spinner } from '@aragon/ods';
import { useCallback, useEffect } from 'react';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { type ICanCreateProposalResult } from '../../types';

export interface IPermissionCheckDialogParams {
    /**
     *
     */
    daoId: string;
    /**
     *
     */
    onSuccess?: () => void;
    /**
     *
     */
    onError?: () => void;
}

export interface IPermissionCheckDialogProps extends IDialogComponentProps<IPermissionCheckDialogParams> {}

export const PermissionCheckDialog: React.FC<IPermissionCheckDialogProps> = (props) => {
    const { params } = props.location;
    const { daoId, onSuccess, onError } = params ?? {};

    const { close, updateOptions } = useDialogContext();
    const pluginIds = useDaoPluginIds(daoId!);

    const { canCreateProposal, isLoading, settings } = useSlotFunction<ICanCreateProposalResult, string>({
        slotId: GovernanceSlotId.GOVERNANCE_CAN_CREATE_PROPOSAL,
        pluginIds,
        params: daoId,
    })!;

    const handleDialogClose = useCallback(() => {
        close();
        onError?.();
    }, [close, onError]);

    useEffect(() => {
        if (canCreateProposal) {
            onSuccess?.();
            close();
        }
    }, [canCreateProposal, onSuccess, close]);

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
