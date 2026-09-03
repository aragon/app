import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IConfirmSafeTransactionParams } from '../../safeService.api';
import { safeTransactionService } from '../../safeTransactionService';

export const useConfirmSafeTransaction = (
    options?: MutationOptions<unknown, unknown, IConfirmSafeTransactionParams>,
) =>
    useMutation({
        mutationFn: (params) =>
            safeTransactionService.confirmSafeTransaction(params),
        ...options,
    });
