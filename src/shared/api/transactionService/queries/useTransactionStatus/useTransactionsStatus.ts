import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { type ITransactionStatus } from '../../domain';
import { transactionService } from '../../transactionService';
import { type IGetTransactionStatusParams } from '../../transactionService.api';
import { transactionServiceKeys } from '../../transactionServiceKeys';

export const transactionStatusOptions = (
    params: IGetTransactionStatusParams,
    options?: QueryOptions<ITransactionStatus>,
): SharedQueryOptions<ITransactionStatus> => ({
    queryKey: transactionServiceKeys.status(params),
    queryFn: () => transactionService.getTransactionStatus(params),
    ...options,
});

export const useTransactionStatus = (
    params: IGetTransactionStatusParams,
    options?: QueryOptions<ITransactionStatus>,
) => {
    return useQuery(transactionStatusOptions(params, options));
};
