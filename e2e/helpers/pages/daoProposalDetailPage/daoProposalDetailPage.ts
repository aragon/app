import type { Page as PlaywrightPage } from '@playwright/test';

/**
 * Proposal detail page — does not extend DaoPage because it is always
 * reached via navigation from another page (proposals list, governance dialog),
 * never constructed with a known URL.
 */
export class DaoProposalDetailPage {
    constructor(private readonly page: PlaywrightPage) {}

    readonly proposalTitle = () => this.page.getByRole('heading', { level: 1 });

    readonly mainContent = () => this.page.getByRole('main');

    readonly detailsAsideCard = () =>
        this.page
            .getByRole('complementary')
            .getByRole('heading', { name: 'Details' });
}
