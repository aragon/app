'use server';

import 'server-only';
import type { IPinResult } from '../../domain';
import { ipfsService } from '../../ipfsService';
import type { IPinFileParams } from '../../ipfsService.api';

export const pinFileAction = async ({ body: file }: IPinFileParams): Promise<IPinResult> => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const headers = { Authorization: `Bearer ${ipfsService.jwt}` };
    const options = { headers, method: 'POST' };
    const result = await ipfsService.request<IPinResult>(ipfsService.urls.pinFile, { body: formData }, options);

    return result;
};
