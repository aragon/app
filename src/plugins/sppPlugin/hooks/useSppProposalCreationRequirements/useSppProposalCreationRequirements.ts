import { type IUseConnectedParticipantGuardBaseParams } from '@/modules/governance/hooks/useConnectedParticipantGuard';
import type { IPermissionCheckGuardResult } from '@/modules/governance/types';

export interface IUseSppProposalCreationRequirementsParams extends IUseConnectedParticipantGuardBaseParams {}

export const useSppProposalCreationRequirements = (): IPermissionCheckGuardResult => {
    return {
        hasPermission: true,
        settings: [],
        isLoading: false,
    };
};
