import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IRawActionTuple } from '@/modules/governance/types';
import { isRecord } from './safeDomainUtils';

/**
 * Decoded actions of a single Safe transaction, as served by the backend.
 */
export interface ISafeTransactionActions {
    /**
     * Whether the backend is still decoding the transaction, in which case `actions` may be incomplete.
     */
    decoding: boolean;
    /**
     * Decoded actions of the transaction.
     */
    actions: IProposalAction[];
    /**
     * Raw `(to, value, data)` tuples of the transaction actions.
     */
    rawActions: IRawActionTuple[];
}

const isRawActionTuple = (value: unknown): value is IRawActionTuple =>
    isRecord(value) &&
    typeof value.to === 'string' &&
    typeof value.value === 'string' &&
    typeof value.data === 'string';

const isProposalAction = (value: unknown): value is IProposalAction =>
    isRecord(value) &&
    typeof value.from === 'string' &&
    typeof value.to === 'string' &&
    typeof value.value === 'string' &&
    typeof value.data === 'string' &&
    typeof value.type === 'string' &&
    (value.inputData === null || isRecord(value.inputData));

export const isSafeTransactionActions = (
    value: unknown,
): value is ISafeTransactionActions =>
    isRecord(value) &&
    typeof value.decoding === 'boolean' &&
    Array.isArray(value.actions) &&
    value.actions.every(isProposalAction) &&
    Array.isArray(value.rawActions) &&
    value.rawActions.every(isRawActionTuple);
