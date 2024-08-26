'use server';

import 'server-only';
import { ipfsService } from '../../ipfsService';
import type { IPinJsonParams } from '../../ipfsService.api';

export const pinJsonAction = async ({ body: bodyParam }: IPinJsonParams): Promise<string> => {
    const headers = { Authorization: `Bearer ${ipfsService.jwt}`, 'Content-Type': 'application/json' };
    const body = JSON.stringify({ pinataContent: bodyParam });
    const options = { headers, method: 'POST' };
    const result = await ipfsService.request<string>(ipfsService.urls.pinJson, { body }, options);

    return result;
};
