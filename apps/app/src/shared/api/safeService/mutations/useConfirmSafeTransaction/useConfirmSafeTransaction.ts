import { type MutationOptions, useMutation } from '@tanstack/react-query';
import { safeService } from '../../safeService';
import type { IConfirmSafeTransactionParams } from '../../safeService.api';

export const useConfirmSafeTransaction = (
    options?: MutationOptions<unknown, unknown, IConfirmSafeTransactionParams>,
) =>
    useMutation({
        mutationFn: (params) => safeService.confirmSafeTransaction(params),
        ...options,
    });
