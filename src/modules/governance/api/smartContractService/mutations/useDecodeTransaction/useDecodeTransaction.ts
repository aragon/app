import { useMutation, type MutationOptions } from '@tanstack/react-query';
import type { IProposalAction } from '../../../governanceService';
import { smartContractService } from '../../smartContractService';
import type { IDecodeTransactionParams } from '../../smartContractService.api';

export const useDecodeTransaction = (options?: MutationOptions<IProposalAction, unknown, IDecodeTransactionParams>) => {
    return useMutation({
        mutationFn: (params) => smartContractService.decodeTransaction(params),
        ...options,
    });
};
