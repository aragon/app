import { ProposalActionType, type IProposalActionChangeSettings } from '@/modules/governance/api/governanceService';
import { generateProposalAction } from './proposalAction';

export const generateProposalActionChangeSettings = (
    action?: Partial<IProposalActionChangeSettings>,
): IProposalActionChangeSettings => ({
    ...generateProposalAction(),
    type: ProposalActionType.UPDATE_MULTISIG_SETTINGS,
    proposedSettings: { minApprovals: 1 },
    ...action,
});
