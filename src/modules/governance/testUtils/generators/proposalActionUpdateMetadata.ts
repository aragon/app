import {
    ProposalActionType,
    type IProposalActionUpdateMetadata,
    type IProposalActionUpdatePluginMetadata,
} from '@/modules/governance/api/governanceService';
import { generateProposalAction } from './proposalAction';

const existingMetadata = {
    name: 'dao-name',
    description: 'dao-description',
    links: [],
};

const proposedMetadata = {
    name: 'dao-name',
    description: 'dao-description',
    links: [],
};

export const generateProposalActionUpdateMetadata = (
    action?: Partial<IProposalActionUpdateMetadata>,
): IProposalActionUpdateMetadata => ({
    ...generateProposalAction(),
    type: ProposalActionType.METADATA_UPDATE,
    existingMetadata,
    proposedMetadata,
    ...action,
});

export const generateProposalActionUpdatePluginMetadata = (
    action?: Partial<IProposalActionUpdatePluginMetadata>,
): IProposalActionUpdatePluginMetadata => ({
    ...generateProposalAction(),
    type: ProposalActionType.METADATA_PLUGIN_UPDATE,
    existingMetadata,
    proposedMetadata,
    ...action,
});
