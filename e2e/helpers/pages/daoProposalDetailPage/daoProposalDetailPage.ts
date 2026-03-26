import type { Page as PlaywrightPage } from '@playwright/test';

export class DaoProposalDetailPage {
    constructor(private readonly page: PlaywrightPage) {}

    readonly proposalTitle = () => this.page.getByRole('heading', { level: 1 });

    readonly mainContent = () => this.page.getByRole('main');

    readonly detailsAsideCard = () =>
        this.page
            .getByRole('complementary')
            .getByRole('heading', { name: 'Details' });
}
