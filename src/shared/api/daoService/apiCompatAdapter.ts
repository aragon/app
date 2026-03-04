/**
 * Bidirectional API compatibility adapter for the SubDAO -> LinkedAccount rename.
 *
 * Handles the transition period where the frontend uses "linkedAccount" terminology
 * but the backend may still return "subDao" fields and expect "includeSubDaos" params.
 *
 * Response normalizer: maps backend `subDaos` -> frontend `linkedAccounts`
 * Request normalizer: maps frontend `includeLinkedAccounts` -> backend `includeSubDaos`
 *
 * TODO: APP-538 Remove this module once the backend is fully deployed with linkedAccount naming
 * and Phase 3 cleanup is complete.
 */

import type { ILinkedAccountSummary } from './domain';

interface ILegacyLinkedAccountsShape {
    linkedAccounts?: ILinkedAccountSummary[];
    subDaos?: ILinkedAccountSummary[];
}

interface ILegacyIncludeLinkedAccountsShape {
    includeLinkedAccounts?: boolean;
    includeSubDaos?: boolean;
}

export interface ICompatDaoResponse {
    linkedAccounts?: ILinkedAccountSummary[];
    subDaos?: ILinkedAccountSummary[];
}

export type TNormalizedDaoResponse<TBase extends object> = Omit<
    TBase,
    'subDaos'
> & {
    linkedAccounts?: ILinkedAccountSummary[];
};

export function normalizeDaoResponse<TBase extends object>(
    raw: TBase & ICompatDaoResponse,
): TNormalizedDaoResponse<TBase>;

export function normalizeDaoResponse(raw: ILegacyLinkedAccountsShape) {
    const linkedAccounts = raw.linkedAccounts ?? raw.subDaos;
    const { subDaos: _subDaos, ...rest } = raw;

    return { ...rest, linkedAccounts };
}

export interface ICompatRequestParams {
    includeLinkedAccounts?: boolean;
    includeSubDaos?: boolean;
}

export type TNormalizedRequestParams<TBase extends object> = Omit<
    TBase,
    'includeLinkedAccounts'
> & {
    includeSubDaos?: boolean;
};

export function normalizeRequestParams<TBase extends object>(
    params: TBase & ICompatRequestParams,
): TNormalizedRequestParams<TBase>;

export function normalizeRequestParams(
    params: ILegacyIncludeLinkedAccountsShape,
) {
    const { includeLinkedAccounts, ...rest } = params;

    return {
        ...rest,
        includeSubDaos: includeLinkedAccounts ?? params.includeSubDaos,
    };
}
