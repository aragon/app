import { type IUseConnectedParticipantGuardBaseParams } from '@/modules/governance/hooks/useConnectedParticpantGuard';
import type { IPermissionCheckGuardResult } from '@/modules/governance/types';

export interface IUseSppProposalCreationRequirementsParams extends IUseConnectedParticipantGuardBaseParams {}

export const useSppProposalCreationRequirements = (): IPermissionCheckGuardResult => {
    return {
        hasPermission: true,
        settings: [],
        isLoading: false,
    };
};
