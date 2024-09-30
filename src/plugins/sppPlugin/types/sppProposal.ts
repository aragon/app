import type { IProposal } from '@/modules/governance/api/governanceService';
import type { ISppSubProposal } from './sppSubProposal';

export interface ISppProposal extends Omit<IProposal, 'endDate'> {
    /**
     * Index of the current active stage.
     */
    currentStageIndex: number;
    /**
     * Stage sub proposals.
     */
    subProposals: ISppSubProposal[];
}
