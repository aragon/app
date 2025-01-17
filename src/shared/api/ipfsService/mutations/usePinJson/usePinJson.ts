import { useMutation, type MutationOptions } from '@tanstack/react-query';
import { pinJsonAction } from '../../actions';
import type { IPinResult } from '../../domain';
import type { IPinJsonParams } from '../../ipfsService.api';

export const usePinJson = (options?: MutationOptions<IPinResult, unknown, IPinJsonParams>) => {
    return useMutation({
        mutationFn: (params) => pinJsonAction(params),
        ...options,
    });
};
