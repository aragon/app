import { useMutation, type MutationOptions } from '@tanstack/react-query';
import { pinJsonAction } from '../../actions';
import type { IPinJsonResult } from '../../domain';
import type { IPinJsonParams } from '../../ipfsService.api';

export const usePinJson = (options?: MutationOptions<IPinJsonResult, unknown, IPinJsonParams>) => {
    return useMutation({
        mutationFn: (params) => pinJsonAction(params),
        ...options,
    });
};
