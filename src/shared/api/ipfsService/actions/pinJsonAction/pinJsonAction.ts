'use server';

import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import 'server-only';
import type { IPinResult } from '../../domain';
import { ipfsService } from '../../ipfsService';
import type { IPinJsonParams } from '../../ipfsService.api';

export const pinJsonAction = async ({ body: bodyParam }: IPinJsonParams): Promise<IPinResult> =>
    monitoringUtils.serverActionWrapper('pinFileAction', async () => {
        const headers = { Authorization: `Bearer ${ipfsService.jwt}` };
        const body = { pinataContent: bodyParam };
        const options = { headers, method: 'POST' };
        const result = await ipfsService.request<IPinResult>(ipfsService.urls.pinJson, { body }, options);

        return result;
    });
