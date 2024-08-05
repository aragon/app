import type { Network } from '@/shared/api/daoService';
import type { IProposalAction } from '@aragon/ods';
import type { IProposalResource } from './proposalResource';

// TODO: TSettings generic type should extends IDaoSettings interface after sync with backend (APP-3483)
export interface IProposal<TSettings = unknown> {
    /**
     * Id of the proposal in DaoAddress-PluginAddress-ProposalId format.
     */
    id: string;
    /**
     * Incremental ID of the proposal.
     */
    proposalId: string;
    /**
     * Title of the proposal.
     */
    title: string;
    /**
     * Network of the proposal.
     */
    network: Network;
    /**
     * Creation date of the proposal.
     */
    blockTimestamp: number;
    /**
     * Short summary of the proposal.
     */
    summary: string;
    /**
     * Description of the proposal in HTML format.
     */
    description: string | null;
    /**
     * Timestamp of the start date of the proposal.
     */
    startDate: number;
    /**
     * Timestamp of the end date of the proposal.
     */
    endDate: number;
    /**
     * Address of the creator of the proposal.
     */
    creatorAddress: string;
    /**
     * Address of the DAO related to the proposal.
     */
    daoAddress: string;
    /**
     * Transaction hash of the proposal creation.
     */
    transactionHash: string;
    /**
     * Array of actions of the proposal.
     */
    actions: IProposalAction[];
    /**
     * Array of resources of the proposal.
     */
    resources: IProposalResource[];
    /**
     * DAO settings when the proposal was created.
     */
    settings: TSettings;
}
