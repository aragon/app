import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IDeleteSafeTransactionParams } from '../../safeService.api';
import { safeTransactionService } from '../../safeTransactionService';

export const useDeleteSafeTransaction = (
    options?: MutationOptions<unknown, unknown, IDeleteSafeTransactionParams>,
) =>
    useMutation({
        mutationFn: (params) =>
            safeTransactionService.deleteSafeTransaction(params),
        ...options,
    });
