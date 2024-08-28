'use server';

import 'server-only';
import type { IPinJsonResult } from '../../domain';
import { ipfsService } from '../../ipfsService';
import type { IPinJsonParams } from '../../ipfsService.api';

export const pinJsonAction = async ({ body: bodyParam }: IPinJsonParams): Promise<IPinJsonResult> => {
    const headers = { Authorization: `Bearer ${ipfsService.jwt}`, 'Content-Type': 'application/json' };
    const body = JSON.stringify({ pinataContent: bodyParam });
    const options = { headers, method: 'POST' };
    const result = await ipfsService.request<IPinJsonResult>(ipfsService.urls.pinJson, { body }, options);

    return result;
};
