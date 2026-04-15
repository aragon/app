import type { Page as PlaywrightPage } from '@playwright/test';
import { DaoPage } from '../../shared';

export class DaoGaugesPage extends DaoPage {
    constructor(params: {
        page: PlaywrightPage;
        network: string;
        address: string;
    }) {
        super({ ...params, path: 'gauges' });
    }

    readonly mainContent = () => this.page.getByRole('main');

    readonly asideCards = () => this.page.getByRole('complementary');
}
