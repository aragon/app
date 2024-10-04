import type { IDaoPlugin } from '@/shared/api/daoService';
import type { SppProposalType } from './enum/sppProposalType';

export interface ISppStagePlugin extends IDaoPlugin {
    /**
     * Type of the SPP stage plugin.
     */
    proposalType: SppProposalType;
}
