import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { IResource } from '../../../shared/api/daoService';
import type { CoreActionType } from './enum/coreActionType';

/**
 * Decoded `inputData` for a `createProposal` action. Extends the base proposal-action input data with an optional
 * `actions` field that carries the wrapper's decoded sub-actions when the backend resolved them.
 */
export interface ICoreActionCreateProposalInputData
    extends NonNullable<IProposalAction['inputData']> {
    /**
     * Decoded sub-actions of the wrapper `createProposal` call. Populated only when the backend successfully decoded
     * the inner `_actions` tuple.
     */
    actions?: IProposalAction[];
    /**
     * Resolved proposal metadata parsed from IPFS by the backend. Optional — IPFS resolution can fail.
     */
    proposalMetadata?: {
        /**
         * Proposal title.
         */
        title: string;
        /**
         * Short summary of the proposal.
         */
        summary: string;
        /**
         * Long-form proposal description. Stringified HTML format.
         */
        description?: string;
        /**
         * Related resources (links) attached to the proposal.
         */
        resources?: IResource[];
    };
}

/**
 * Proposal action representing a `createProposal` call on any governance plugin. Carries the decoded inner actions and
 * the resolved IPFS metadata so the details view can render them without re-decoding.
 */
export interface ICoreActionCreateProposal
    extends Omit<IProposalAction, 'type' | 'inputData'> {
    /**
     * Discriminator for the create-proposal action.
     */
    type: CoreActionType.CREATE_PROPOSAL;
    /**
     * Decoded input data; `actions` carries the nested sub-actions when the backend resolved them.
     */
    inputData: ICoreActionCreateProposalInputData;
}
