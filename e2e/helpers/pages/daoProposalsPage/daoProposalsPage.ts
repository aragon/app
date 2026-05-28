import type { Page as PlaywrightPage } from '@playwright/test';
import { PROPOSALS_API_TIMEOUT } from '../../constants/timeouts';
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

    private isProposalsListResponse(url: string) {
        return (
            url.includes('/v2/proposals') &&
            url.includes(this.daoId) &&
            !url.includes('/v2/proposals/slug/')
        );
    }

    /** Waits until proposal links render (past loading skeletons). */
    async waitForProposalListLoaded() {
        await this.firstProposal().waitFor({
            state: 'visible',
            timeout: PROPOSALS_API_TIMEOUT,
        });
    }

    override async navigate() {
        const proposalsResponse = this.page.waitForResponse(
            (res) => this.isProposalsListResponse(res.url()) && res.ok(),
            { timeout: PROPOSALS_API_TIMEOUT },
        );

        await super.navigate();
        await proposalsResponse.catch(() => undefined);
        await this.waitForProposalListLoaded();

        return this;
    }
}
