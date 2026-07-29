import type { Page as PlaywrightPage } from '@playwright/test';
import { DaoPage } from '../../shared';

export class DaoDashboardPage extends DaoPage {
    constructor(params: {
        page: PlaywrightPage;
        network: string;
        address: string;
    }) {
        super({ ...params, path: 'dashboard' });
    }

    readonly mainContent = () => this.page.getByRole('main');

    readonly assetsHeading = () =>
        this.page.getByRole('heading', { name: 'Assets', exact: true });

    readonly asideCard = () => this.page.getByRole('complementary');

    readonly contractCard = () =>
        this.page
            .getByRole('complementary')
            .getByRole('heading', { name: 'Contract' });
}
