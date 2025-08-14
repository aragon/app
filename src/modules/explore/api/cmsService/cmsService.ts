import { HttpService } from '@/shared/api/httpService';
import type { IFeaturedDao, ISanctionedAddressesResult } from './domain';

class CmsService extends HttpService {
    constructor() {
        super('https://raw.githubusercontent.com/aragon/app-cms');
    }

    private urls = {
        featuredDaos: '/main/featured-daos.json',
        sanctionedAddresses: '/main/sanctioned-addresses.json',
    };

    getFeaturedDaos = async (): Promise<IFeaturedDao[]> => {
        const result = await this.request<IFeaturedDao[]>(this.urls.featuredDaos);

        return result;
    };

    getSanctionedAddresses = async (): Promise<ISanctionedAddressesResult> => {
        const result = await this.request<ISanctionedAddressesResult>(this.urls.sanctionedAddresses);

        return result;
    };
}

export const cmsService = new CmsService();
