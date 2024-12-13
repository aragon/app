import {
    ProposalActionType,
    type IProposalActionUpdateMetadata,
    type IProposalActionUpdatePluginMetadata,
} from '@/modules/governance/api/governanceService';
import { generateProposalAction } from './proposalAction';

const generateProposalActionUpdateMetadataBase = <
    T extends IProposalActionUpdateMetadata | IProposalActionUpdatePluginMetadata,
>(
    type: ProposalActionType,
    action?: Partial<T>,
): T =>
    ({
        ...generateProposalAction(),
        type,
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
    }) as T;

export const generateProposalActionUpdateMetadata = (
    action?: Partial<IProposalActionUpdateMetadata>,
): IProposalActionUpdateMetadata =>
    generateProposalActionUpdateMetadataBase<IProposalActionUpdateMetadata>(ProposalActionType.METADATA_UPDATE, action);

export const generateProposalActionUpdatePluginMetadata = (
    action?: Partial<IProposalActionUpdatePluginMetadata>,
): IProposalActionUpdatePluginMetadata =>
    generateProposalActionUpdateMetadataBase<IProposalActionUpdatePluginMetadata>(
        ProposalActionType.METADATA_PLUGIN_UPDATE,
        action,
    );
