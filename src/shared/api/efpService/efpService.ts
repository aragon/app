import { HttpService } from '../httpService';
import type { EfpStats, IGetEfpStatsParams } from './efpService.api';

export class EfpService extends HttpService {
    urls = {
        stats: '/api/v1/users/:address/stats',
    };

    constructor() {
        super('https://api.ethfollow.xyz');
    }

    getStats = async (params: IGetEfpStatsParams): Promise<EfpStats> => {
        const result = await this.request<EfpStats>(this.urls.stats, params);

        return result;
    };
}

export const efpService = new EfpService();
