import type { IAddressInfo, IPluginSettings, Network } from '@/shared/api/daoService';
import type { IResource } from '../../../../../shared/api/daoService/domain/resource';
import type { IProposalAction } from './proposalAction';
import type { IProposalExecution } from './proposalExecution';

export interface IProposal<TSettings extends IPluginSettings = IPluginSettings> {
    /**
     * Id of the proposal in DaoAddress-PluginAddress-ProposalId format.
     */
    id: string;
    /**
     * Incremental index of the proposal.
     */
    proposalIndex: string;
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
     * Creator of the proposal.
     */
    creator: IAddressInfo;
    /**
     * Address of the DAO related to the proposal.
     */
    daoAddress: string;
    /**
     * Transaction hash of the proposal creation.
     */
    transactionHash: string;
    /**
     * Array of resources of the proposal.
     */
    resources: IResource[];
    /**
     * Plugin settings when the proposal was created.
     */
    settings: TSettings;
    /**
     * Execution information of the proposal.
     */
    executed: IProposalExecution;
    /**
     * Actions to be executed on this proposal.
     */
    actions: IProposalAction[];
    /**
     * Address of the plugin where the proposal has been created.
     */
    pluginAddress: string;
    /**
     * Subdomain of the plugin where the proposal has been created.
     */
    pluginSubdomain: string;
}
