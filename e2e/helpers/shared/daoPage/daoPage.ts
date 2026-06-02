import type { Page as PlaywrightPage } from '@playwright/test';
import { BasePage } from '../page';

export interface IDaoPageParams {
    page: PlaywrightPage;
    network: string;
    address: string;
    path?: string;
}

export class DaoPage extends BasePage {
    protected readonly network: string;
    protected readonly address: string;

    constructor(params: IDaoPageParams) {
        const { page, network, address, path = '' } = params;
        super({
            page,
            path: `/dao/${network}/${address}${path ? `/${path}` : ''}`,
        });
        this.network = network;
        this.address = address;
    }

    /** Backend DAO id segment used in API URLs (`{network}-{address}`). */
    protected get daoId(): string {
        return `${this.network}-${this.address}`;
    }
}
