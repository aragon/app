import {
    type IProposalActionUpdateMetadata,
    type IProposalActionUpdatePluginMetadata,
    type ProposalActionType,
} from '@/modules/governance/api/governanceService';
import { generateProposalAction } from './proposalAction';

export const generateProposalActionUpdateMetadataBase = <
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
