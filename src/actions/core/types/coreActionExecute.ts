import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { CoreActionType } from './enum/coreActionType';

/**
 * Decoded `inputData` for an `execute` action. Extends the base proposal-action input data with an optional `actions`
 * field that carries the wrapper's decoded sub-actions when the backend resolved them.
 */
export interface ICoreActionExecuteInputData
    extends NonNullable<IProposalAction['inputData']> {
    /**
     * Decoded sub-actions of the wrapper `execute` call. Populated only when the backend successfully decoded the
     * inner `_actions` tuple.
     */
    actions?: IProposalAction[];
}

/**
 * Proposal action representing an `execute` call on the global executor. Carries the decoded inner actions so the
 * details view can render them without re-decoding.
 */
export interface ICoreActionExecute
    extends Omit<IProposalAction, 'type' | 'inputData'> {
    /**
     * Discriminator for the executor action.
     */
    type: CoreActionType.EXECUTE;
    /**
     * Decoded input data; `actions` carries the nested sub-actions when the backend resolved them.
     */
    inputData: ICoreActionExecuteInputData;
}
