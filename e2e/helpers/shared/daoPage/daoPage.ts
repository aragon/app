import type { Page as PlaywrightPage } from '@playwright/test';
import { BasePage } from '../page';

export interface IDaoPageParams {
    page: PlaywrightPage;
    network: string;
    address: string;
    path?: string;
}

export class DaoPage extends BasePage {
    constructor(params: IDaoPageParams) {
        const { page, network, address, path = '' } = params;
        super({
            page,
            path: `/dao/${network}/${address}${path ? `/${path}` : ''}`,
        });
    }
}
