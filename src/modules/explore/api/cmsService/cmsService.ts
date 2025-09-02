import { HttpService } from '@/shared/api/httpService';
import type { IFeaturedDao, IWhitelistedAddresses, ISanctionedAddressesResult } from './domain';

class CmsService extends HttpService {
    constructor() {
        super('https://raw.githubusercontent.com/aragon/app-cms');
    }

    private urls = {
        featuredDaos: '/main/featured-daos.json',
        whitelistedAddresses: '/main/whitelisted-addresses.json',
        sanctionedAddresses: '/main/sanctioned-addresses.json',
    };

    getFeaturedDaos = async (): Promise<IFeaturedDao[]> => {
        const result = await this.request<IFeaturedDao[]>(this.urls.featuredDaos);

        return result;
    };

    getWhitelistedAddresses = async (): Promise<IWhitelistedAddresses> => {
        const result = await this.request<IWhitelistedAddresses>(this.urls.whitelistedAddresses);

        return result;
    };

    getSanctionedAddresses = async (): Promise<ISanctionedAddressesResult> => {
        const result = await this.request<ISanctionedAddressesResult>(this.urls.sanctionedAddresses);

        return result;
    };
}

export const cmsService = new CmsService();
