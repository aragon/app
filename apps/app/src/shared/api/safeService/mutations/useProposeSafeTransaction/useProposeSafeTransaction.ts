import { type MutationOptions, useMutation } from '@tanstack/react-query';
import { safeService } from '../../safeService';
import type { IProposeSafeTransactionParams } from '../../safeService.api';

export const useProposeSafeTransaction = (
    options?: MutationOptions<unknown, unknown, IProposeSafeTransactionParams>,
) =>
    useMutation({
        mutationFn: (params) => safeService.proposeSafeTransaction(params),
        ...options,
    });
