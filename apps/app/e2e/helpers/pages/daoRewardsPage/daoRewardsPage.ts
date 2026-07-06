import type { Page as PlaywrightPage } from '@playwright/test';
import { DaoPage } from '../../shared';

export class DaoRewardsPage extends DaoPage {
    constructor(params: {
        page: PlaywrightPage;
        network: string;
        address: string;
    }) {
        super({ ...params, path: 'rewards' });
    }

    readonly mainContent = () => this.page.getByRole('main');

    readonly asideCard = () => this.page.getByRole('complementary');
}
