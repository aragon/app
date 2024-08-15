import { type IProposalActionUpdateMetadata, ProposalActionType } from '@/modules/governance/api/governanceService';
import { generateProposalAction } from './proposalAction';

export const generateProposalActionUpdateMetadata = (
    action?: Partial<IProposalActionUpdateMetadata>,
): IProposalActionUpdateMetadata => ({
    ...generateProposalAction(),
    type: ProposalActionType.METADATA_UPDATE,
    existingMetadata: {
        logo: 'logo.png',
        name: 'dao-name',
        description: 'dao-description',
        links: [],
    },
    proposedMetadata: {
        logo: 'new-logo.png',
        name: 'dao-name',
        description: 'dao-description',
        links: [],
    },
    ...action,
});
