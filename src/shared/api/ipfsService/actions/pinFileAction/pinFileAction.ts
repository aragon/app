'use server';

import 'server-only';
import type { IPinFileResult } from '../../domain';
import { ipfsService } from '../../ipfsService';
import type { IPinFileParams } from '../../ipfsService.api';

export const pinFileAction = async ({ body: File }: IPinFileParams): Promise<IPinFileResult> => {
    const formData = new FormData();
    formData.append('file', File, File.name);
    const headers = { Authorization: `Bearer ${ipfsService.jwt}`, 'Content-Type': 'multipart/form-data' };
    const options = { headers, method: 'POST' };
    const result = await ipfsService.request<IPinFileResult>(ipfsService.urls.pinFile, { body: formData }, options);

    return result;
};
