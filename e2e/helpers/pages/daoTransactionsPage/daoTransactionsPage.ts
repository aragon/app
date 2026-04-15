import type { Page as PlaywrightPage } from '@playwright/test';
import { DaoPage } from '../../shared';

export class DaoTransactionsPage extends DaoPage {
    constructor(params: {
        page: PlaywrightPage;
        network: string;
        address: string;
    }) {
        super({ ...params, path: 'transactions' });
    }

    readonly pageTitle = () =>
        this.page.getByRole('heading', {
            name: 'Transactions',
            exact: true,
        });

    readonly mainContent = () => this.page.getByRole('main');

    readonly asideCard = () => this.page.getByRole('complementary');
}
