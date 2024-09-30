import type { IDaoPlugin } from '@/shared/api/daoService';
import type { SppProposalType } from './enum/sppProposalType';

export interface ISppStagePlugin extends IDaoPlugin {
    /**
     * is the type of proposal Approval or Veto.
     */
    proposalType: SppProposalType;
}
