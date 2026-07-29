import type { Page as PlaywrightPage } from '@playwright/test';

export class DaoProcessDetailPage {
    constructor(private readonly page: PlaywrightPage) {}

    readonly settingsBreadcrumb = () =>
        this.page.getByRole('link', { name: 'Settings' });

    readonly governanceProcessSection = () =>
        this.page.getByRole('heading', { name: 'Governance process' });

    readonly detailsAsideCard = () =>
        this.page
            .getByRole('complementary')
            .getByRole('heading', { name: 'Details' });
}
