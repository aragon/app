import type { Page as PlaywrightPage } from '@playwright/test';

export class MemberDetailsPage {
    constructor(private readonly page: PlaywrightPage) {}

    readonly detailsCard = () =>
        this.page
            .getByRole('complementary')
            .getByRole('heading', { name: 'Details' });
}
