import { type IUseNetworkGuardParams, useNetworkGuard } from '@/modules/application/hooks/useNetworkGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import { useCallback } from 'react';
import { GovernanceDialog } from '../../constants/moduleDialogs';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { ICanCreateProposalResult } from '../../types';

export interface IUseCanCreateProposalGuardParams extends IUseNetworkGuardParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const useCanCreateProposalGuard = (params: IUseCanCreateProposalGuardParams) => {
    const { daoId, network, onSuccess, onError } = params;

    const pluginIds = useDaoPluginIds(daoId);
    const { open } = useDialogContext();

    const { canCreateProposal } = useSlotFunction<ICanCreateProposalResult, string>({
        slotId: GovernanceSlotId.GOVERNANCE_CAN_CREATE_PROPOSAL,
        pluginIds,
        params: daoId,
    })!;

    const handleChangeNetworkSuccess = useCallback(() => {
        const dialogParams = { daoId, onSuccess, onError };
        open(GovernanceDialog.PERMISSION_CHECK, { params: dialogParams });
    }, [open, onSuccess, onError, daoId]);

    const { check: checkNetwork, result: isCorretNetwork } = useNetworkGuard({
        network,
        onError,
        onSuccess: handleChangeNetworkSuccess,
    });

    return { check: checkNetwork, result: isCorretNetwork && canCreateProposal };
};
