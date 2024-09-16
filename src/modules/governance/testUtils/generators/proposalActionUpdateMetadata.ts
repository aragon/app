import { type IProposalActionUpdateMetadata, ProposalActionType } from '@/modules/governance/api/governanceService';
import { generateProposalAction } from './proposalAction';

export const generateProposalActionUpdateMetadata = (
    action?: Partial<IProposalActionUpdateMetadata>,
): IProposalActionUpdateMetadata => ({
    ...generateProposalAction(),
    type: ProposalActionType.METADATA_UPDATE,
    existingMetadata: {
        name: 'dao-name',
        description: 'dao-description',
        links: [],
    },
    proposedMetadata: {
        name: 'dao-name',
        description: 'dao-description',
        links: [],
    },
    ...action,
});
