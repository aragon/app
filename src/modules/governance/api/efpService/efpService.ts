import { HttpService } from '@/shared/api/httpService';
import type { IEfpStats } from './domain';
import type { IGetEfpStatsParams } from './efpService.api';

export class EfpService extends HttpService {
    urls = {
        stats: '/api/v1/users/:address/stats',
    };

    constructor() {
        super('https://api.ethfollow.xyz');
    }

    getStats = async (params: IGetEfpStatsParams): Promise<IEfpStats> => {
        const result = await this.request<IEfpStats>(this.urls.stats, params);

        return result;
    };
}

export const efpService = new EfpService();
