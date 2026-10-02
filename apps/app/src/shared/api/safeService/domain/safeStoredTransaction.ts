import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IRawActionTuple } from '@/modules/governance/types';
import { isRecord } from './safeDomainUtils';
import {
    type ISafeMultisigTransaction,
    isSafeMultisigTransaction,
} from './safeMultisigTransaction';
import type { ISafePaginatedResponse } from './safePaginatedResponse';
import { isSafePaginatedResponse } from './safePaginatedResponse';

export enum SafeStoredTransactionState {
    LIVE = 'live',
    SUPERSEDED = 'superseded',
    EXECUTED = 'executed',
    REMOVED = 'removed',
}

export interface ISafeStoredMeta {
    source: 'store';
    fetchedAt: string | null;
    stale: boolean;
    partial: boolean;
}

export interface ISafeStoredTransaction extends ISafeMultisigTransaction {
    state: SafeStoredTransactionState;
}

export type { IRawActionTuple };

export interface ISafeTransactionActions {
    decoding: boolean;
    actions: IProposalAction[];
    rawActions: IRawActionTuple[];
}

export interface ISafeStoredTransactionsResponse
    extends ISafePaginatedResponse<ISafeStoredTransaction> {
    meta: ISafeStoredMeta;
}

export const isSafeStoredMeta = (value: unknown): value is ISafeStoredMeta =>
    isRecord(value) &&
    value.source === 'store' &&
    (typeof value.fetchedAt === 'string' || value.fetchedAt === null) &&
    typeof value.stale === 'boolean' &&
    typeof value.partial === 'boolean';

const isSafeStoredTransactionState = (
    value: unknown,
): value is SafeStoredTransactionState =>
    value === SafeStoredTransactionState.LIVE ||
    value === SafeStoredTransactionState.SUPERSEDED ||
    value === SafeStoredTransactionState.EXECUTED ||
    value === SafeStoredTransactionState.REMOVED;

export const isSafeStoredTransaction = (
    value: unknown,
): value is ISafeStoredTransaction => {
    if (!isSafeMultisigTransaction(value) || !isRecord(value)) {
        return false;
    }

    return isSafeStoredTransactionState(value.state);
};

export const isSafeStoredTransactionsResponse = (
    value: unknown,
): value is ISafeStoredTransactionsResponse => {
    if (
        !isSafePaginatedResponse(value, isSafeStoredTransaction) ||
        !isRecord(value)
    ) {
        return false;
    }

    return isSafeStoredMeta(value.meta);
};

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
