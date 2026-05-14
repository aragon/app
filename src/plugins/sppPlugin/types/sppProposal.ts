import type { IProposal } from '@/modules/governance/api/governanceService';
import type { ISppPluginSettings } from './sppPluginSettings';
import type { ISppProposalBodyResult } from './sppProposalBodyResult';
import type { ISppProposalExecution } from './sppProposalExecution';
import type { ISppSubProposal } from './sppSubProposal';

export interface ISppProposal extends IProposal<ISppPluginSettings> {
    /**
     * Index of the current active stage.
     */
    stageIndex: number;
    /**
     * Timestamp of the last stage transition to help calculate start and end times of the stages.
     */
    lastStageTransition: number;
    /**
     * Stage sub proposals.
     */
    subProposals: ISppSubProposal[];
    /**
     * Execution information for each stage.
     */
    stageExecutions: ISppProposalExecution[];
    /**
     * Results of the process bodies.
     */
    results?: ISppProposalBodyResult[];
    /**
     * Live ERC-20 totalSupply values for lock-to-vote bodies in this SPP's stages, keyed by
     * lowercased token address. Populated by the api service layer when the SPP contains lock-to-
     * vote bodies — consumers reading stage-body supplies before a sub-proposal exists look here.
     * Values are stringified bigints for SSR-safe React Query hydration.
     */
    tokensTotalSupply?: Record<string, string>;
}
