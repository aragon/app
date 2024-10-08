import type { IProposal } from '@/modules/governance/api/governanceService';
import type { ISppPluginSettings } from './sppPluginSettings';
import type { ISppSubProposal } from './sppSubProposal';
import type { SppProposalType } from './enum';

export interface ISppProposal extends Omit<IProposal<ISppPluginSettings>, 'endDate'> {
    /**
     * Index of the current active stage.
     */
    currentStageIndex: number;
    /**
     * Timestamp of the last stage transition to help calculate start and end times of the stages.
     */
    lastStageTransition: number;
    /**
     * Stage sub proposals.
     */
    subProposals: ISppSubProposal[];
    /**
     * plugin results from the smart contract
     */
    pluginResults: {
        [stageId: string]: {
            [pluginAddress: string]: {
                proposalType: SppProposalType;
                result: boolean;
            };
        };
    };
}
