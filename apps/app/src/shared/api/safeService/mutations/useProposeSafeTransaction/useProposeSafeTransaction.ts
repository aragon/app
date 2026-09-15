import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IProposeSafeTransactionParams } from '../../safeService.api';
import { safeTransactionService } from '../../safeTransactionService';

export const useProposeSafeTransaction = (
    options?: MutationOptions<unknown, unknown, IProposeSafeTransactionParams>,
) =>
    useMutation({
        mutationFn: (params) =>
            safeTransactionService.proposeSafeTransaction(params),
        ...options,
    });
