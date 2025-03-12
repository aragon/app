import { HttpService } from '@/shared/api/httpService';
import type { IFeaturedDao } from './domain';

class CmsService extends HttpService {
    constructor() {
        super('https://raw.githubusercontent.com/aragon/app-cms');
    }

    private urls = {
        featuredDaos: '/main/featured-daos.json',
    };

    getFeaturedDaos = async (): Promise<IFeaturedDao[]> => {
        const result = await this.request<IFeaturedDao[]>(this.urls.featuredDaos);

        return result;
    };
}

export const cmsService = new CmsService();
