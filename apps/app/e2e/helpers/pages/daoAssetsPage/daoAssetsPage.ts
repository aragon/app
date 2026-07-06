import type { Page as PlaywrightPage } from '@playwright/test';
import { DaoPage } from '../../shared';

export class DaoAssetsPage extends DaoPage {
    constructor(params: {
        page: PlaywrightPage;
        network: string;
        address: string;
    }) {
        super({ ...params, path: 'assets' });
    }

    readonly pageTitle = () =>
        this.page.getByRole('heading', { name: 'Assets', exact: true });

    readonly mainContent = () => this.page.getByRole('main');

    readonly asideCard = () => this.page.getByRole('complementary');
}
