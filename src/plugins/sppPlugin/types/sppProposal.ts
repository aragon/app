import type { IProposal } from '@/modules/governance/api/governanceService';
import type { ISppSubProposal } from './sppSubProposal';
import type { ISppPluginSettings } from './sppPluginSettings';

export interface ISppProposal extends Omit<IProposal<ISppPluginSettings>, 'endDate'> {
    /**
     * Index of the current active stage.
     */
    currentStageIndex: number;
    /**
     * Stage sub proposals.
     */
    subProposals: ISppSubProposal[];
}
