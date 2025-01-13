import { useMutation, type MutationOptions } from '@tanstack/react-query';
import { pinFileAction } from '../../actions';
import type { IPinResult } from '../../domain';
import type { IPinFileParams } from '../../ipfsService.api';

export const usePinFile = (options?: MutationOptions<IPinResult, unknown, IPinFileParams>) => {
    return useMutation({
        mutationFn: (params: IPinFileParams) => pinFileAction(params),
        ...options,
    });
};
