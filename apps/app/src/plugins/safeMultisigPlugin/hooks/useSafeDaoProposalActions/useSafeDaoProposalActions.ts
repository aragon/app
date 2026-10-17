'use client';

import { useQuery } from '@tanstack/react-query';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';
import type {
    IGetSafeTransactionActionsParams,
    ISafeTransactionActions,
} from '@/shared/api/safeService';
import { safeService, safeServiceKeys } from '@/shared/api/safeService';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type {
    IUseSafeDaoProposalActionsParams,
    IUseSafeDaoProposalActionsReturn,
} from './useSafeDaoProposalActions.api';
import { safeDaoProposalActionsUtils } from './useSafeDaoProposalActionsUtils';

export const safeDaoProposalActionsOptions = (
    params: IUseSafeDaoProposalActionsParams,
    options?: QueryOptions<ISafeTransactionActions>,
): SharedQueryOptions<ISafeTransactionActions> => {
    const queryParams: IGetSafeTransactionActionsParams = {
        urlParams: {
            network: params.network,
            address: params.safeAddress,
            safeTxHash: params.safeTxHash,
        },
    };

    return {
        queryKey: safeServiceKeys.safeTransactionActions(queryParams),
        queryFn: () => safeService.getSafeTransactionActions(queryParams),
        enabled:
            params.enabled !== false &&
            params.safeAddress.length > 0 &&
            params.daoAddress.length > 0 &&
            params.safeTxHash.length > 0,
        refetchInterval: safeDaoProposalActionsUtils.getRefetchInterval,
        ...options,
    };
};

export const useSafeDaoProposalActions = (
    params: IUseSafeDaoProposalActionsParams,
): IUseSafeDaoProposalActionsReturn => {
    const query = useQuery(safeDaoProposalActionsOptions(params));
    const rawTuple = safeDaoProposalActionsUtils.localActionsToRawTuple(
        params.localActions,
    );
    const isDecoding = query.data?.decoding ?? false;
    const decodedActions =
        !isDecoding && !query.isError && query.data != null
            ? safeDaoProposalActionsUtils.flattenDaoExecuteActions(
                  query.data.actions,
                  params.daoAddress,
              )
            : undefined;
    const actions = proposalActionUtils.resolveNestedActions(
        decodedActions,
        rawTuple,
    );

    return {
        actions,
        isDecoding,
        usingDecoded: decodedActions != null && actions === decodedActions,
    };
};
