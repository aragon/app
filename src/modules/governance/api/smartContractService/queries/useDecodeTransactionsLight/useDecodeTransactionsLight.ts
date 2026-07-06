import { skipToken, useQuery } from '@tanstack/react-query';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { smartContractService } from '../../smartContractService';
import type { IDecodeTransactionsLightParams } from '../../smartContractService.api';
import { smartContractServiceKeys } from '../../smartContractServiceKeys';

export const decodeTransactionsLightOptions = (
    params: IDecodeTransactionsLightParams | undefined,
    options?: QueryOptions<IProposalAction[]>,
): SharedQueryOptions<IProposalAction[]> => ({
    queryKey: smartContractServiceKeys.decodeTransactionsLight(params),
    queryFn:
        params == null
            ? skipToken
            : () => smartContractService.decodeTransactionsLight(params),
    ...options,
});

export const useDecodeTransactionsLight = (
    params: IDecodeTransactionsLightParams | undefined,
    options?: QueryOptions<IProposalAction[]>,
) => useQuery(decodeTransactionsLightOptions(params, options));
