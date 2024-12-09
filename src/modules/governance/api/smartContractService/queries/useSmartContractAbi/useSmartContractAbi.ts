import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import type { ISmartContractAbi } from '../../domain';
import { smartContractService } from '../../smartContractService';
import type { IGetAbiParams } from '../../smartContractService.api';
import { smartContractServiceKeys } from '../../smartContractServiceKeys';

export const smartContractAbiOptions = (
    params: IGetAbiParams,
    options?: QueryOptions<ISmartContractAbi | undefined>,
): SharedQueryOptions<ISmartContractAbi | undefined> => ({
    queryKey: smartContractServiceKeys.abi(params),
    queryFn: () => smartContractService.getAbi(params),
    ...options,
});

export const useSmartContractAbi = (params: IGetAbiParams, options?: QueryOptions<ISmartContractAbi | undefined>) => {
    return useQuery(smartContractAbiOptions(params, options));
};
