'use server';

import 'server-only';
import type { IPinResult } from '../../domain';
import { ipfsService } from '../../ipfsService';
import type { IPinJsonParams } from '../../ipfsService.api';

export const pinJsonAction = async ({ body: bodyParam }: IPinJsonParams): Promise<IPinResult> => {
    const headers = { Authorization: `Bearer ${ipfsService.jwt}`, 'Content-Type': 'application/json' };
    const body = JSON.stringify({ pinataContent: bodyParam });
    const options = { headers, method: 'POST' };
    const result = await ipfsService.request<IPinResult>(ipfsService.urls.pinJson, { body }, options);

    return result;
};
