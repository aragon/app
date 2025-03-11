import { HttpService } from '@/shared/api/httpService';
import type { IFeaturedDao } from './domain';

const FEATURED_DAOS_BASE_URL = 'https://raw.githubusercontent.com/aragon/app-featured-daos';

class CmsService extends HttpService {
    constructor() {
        super(FEATURED_DAOS_BASE_URL);
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
