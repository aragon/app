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

    readonly headerSection = () => this.page.getByRole('banner');

    readonly daoName = () =>
        this.headerSection().getByRole('heading', { level: 1 });

    readonly daoAvatar = () => this.headerSection().getByRole('img').first();

    readonly proposalsStat = () => this.page.getByText('Proposals').first();

    readonly membersStat = () => this.page.getByText('Members').first();

    readonly treasuryStat = () => this.page.getByText('Treasury').first();

    readonly latestProposalsHeading = () =>
        this.page.getByRole('heading', { name: 'Latest proposals' });

    readonly membersHeading = () =>
        this.page.getByRole('heading', { name: 'Members' });

    readonly assetsHeading = () =>
        this.page.getByRole('heading', { name: 'Assets' });

    readonly contractCard = () => this.page.getByText('Contract');

    readonly resourcesCard = () => this.page.getByText('Resources');
}
