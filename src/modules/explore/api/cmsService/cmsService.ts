import { HttpService } from '@/shared/api/httpService';
import type { IFeaturedDao, IWhitelistedAddresses } from './domain';

class CmsService extends HttpService {
    constructor() {
        super('https://raw.githubusercontent.com/aragon/app-cms');
    }

    private urls = {
        featuredDaos: '/main/featured-daos.json',
        // TODO Update to `main` pattern above when https://github.com/aragon/app-cms/pull/4 is merged
        whitelistedAddresses: '/feat/APP-4366/whitelisted-addresses.json',
    };

    getFeaturedDaos = async (): Promise<IFeaturedDao[]> => {
        const result = await this.request<IFeaturedDao[]>(this.urls.featuredDaos);

        return result;
    };

    getWhitelistedAddresses = async (): Promise<IWhitelistedAddresses> => {
        const result = await this.request<IWhitelistedAddresses>(this.urls.whitelistedAddresses);

        return result;
    };
}

export const cmsService = new CmsService();
