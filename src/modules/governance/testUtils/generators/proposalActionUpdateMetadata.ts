import {
    ProposalActionType,
    type IProposalActionUpdateMetadata,
    type IProposalActionUpdatePluginMetadata,
} from '@/modules/governance/api/governanceService';
import { generateProposalAction } from './proposalAction';

const generateProposalActionUpdateMetadataBase = (): Omit<IProposalActionUpdateMetadata, 'type'> => ({
    ...generateProposalAction(),
    existingMetadata: { name: 'dao-name', description: 'dao-description', links: [] },
    proposedMetadata: { name: 'dao-name', description: 'dao-description', links: [] },
});

export const generateProposalActionUpdateMetadata = (
    action?: Partial<IProposalActionUpdateMetadata>,
): IProposalActionUpdateMetadata => ({
    ...generateProposalActionUpdateMetadataBase(),
    type: ProposalActionType.METADATA_UPDATE,
    ...action,
});

export const generateProposalActionUpdatePluginMetadata = (
    action?: Partial<IProposalActionUpdatePluginMetadata>,
): IProposalActionUpdatePluginMetadata => ({
    ...generateProposalActionUpdateMetadataBase(),
    type: ProposalActionType.METADATA_PLUGIN_UPDATE,
    ...action,
});
