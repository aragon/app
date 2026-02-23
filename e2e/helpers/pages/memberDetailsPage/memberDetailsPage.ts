import type { Page as PlaywrightPage } from '@playwright/test';

export class MemberDetailsPage {
    constructor(private readonly page: PlaywrightPage) {}

    readonly votingActivity = () =>
        this.page.getByRole('heading', { name: 'Voting activity' });

    readonly proposalCreation = () =>
        this.page.getByRole('heading', { name: 'Proposal creation' });

    readonly otherMemberships = () =>
        this.page.getByRole('heading', { name: 'Other DAO memberships' });

    readonly detailsCard = () => this.page.getByText('Details');
}
