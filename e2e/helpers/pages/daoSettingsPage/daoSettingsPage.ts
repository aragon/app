import type { Page as PlaywrightPage } from '@playwright/test';
import { DaoPage } from '../../shared';

export class DaoSettingsPage extends DaoPage {
    constructor(params: {
        page: PlaywrightPage;
        network: string;
        address: string;
    }) {
        super({ ...params, path: 'settings' });
    }

    readonly pageTitle = () =>
        this.page.getByRole('heading', { name: 'Settings' });

    readonly daoInfoSection = () => this.page.getByRole('main');

    readonly governanceProcesses = () =>
        this.page.getByRole('main').locator('a[href*="/settings/"]');

    readonly firstProcess = () => this.governanceProcesses().first();

    readonly asideVersionCard = () => this.page.getByRole('complementary');
}
