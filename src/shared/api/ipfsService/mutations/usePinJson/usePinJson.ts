import { useMutation, type MutationOptions } from '@tanstack/react-query';
import { pinJsonAction } from '../../actions';
import type { IPinJsonParams } from '../../ipfsService.api';

export const usePinJson = (options?: MutationOptions<string, unknown, IPinJsonParams>) => {
    return useMutation({
        mutationFn: (params) => pinJsonAction(params),
        ...options,
    });
};
