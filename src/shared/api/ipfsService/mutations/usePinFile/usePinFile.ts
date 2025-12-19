import { type MutationOptions, useMutation } from '@tanstack/react-query';
import { pinFileAction } from '../../actions';
import type { IPinResult } from '../../domain';
import type { IPinFileParams } from '../../ipfsService.api';

export const usePinFile = (
    options?: MutationOptions<IPinResult, unknown, IPinFileParams>,
) =>
    useMutation({
        mutationFn: (params) => pinFileAction(params),
        ...options,
    });
