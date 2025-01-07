import { useMutation, type MutationOptions } from '@tanstack/react-query';
import { pinFileAction } from '../../actions';
import type { IPinFileResult } from '../../domain';
import type { IPinFileParams } from '../../ipfsService.api';

export const usePinFile = (options?: MutationOptions<IPinFileResult, unknown, IPinFileParams>) => {
    return useMutation({
        mutationFn: (params: IPinFileParams) => pinFileAction(params),
        ...options,
    });
};
