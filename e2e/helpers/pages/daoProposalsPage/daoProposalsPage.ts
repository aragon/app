import type { Page as PlaywrightPage } from '@playwright/test';
import { DaoPage } from '../../shared';

export class DaoProposalsPage extends DaoPage {
    constructor(params: {
        page: PlaywrightPage;
        network: string;
        address: string;
    }) {
        super({ ...params, path: 'proposals' });
    }

    readonly pageTitle = () =>
        this.page.getByRole('heading', { name: 'Proposals', exact: true });

    readonly proposalList = () => this.page.getByRole('main').getByRole('link');

    readonly firstProposal = () => this.proposalList().first();

    readonly asideCard = () => this.page.getByRole('complementary');
}
