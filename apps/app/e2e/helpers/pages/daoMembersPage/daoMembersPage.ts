import type { Page as PlaywrightPage } from '@playwright/test';
import { DaoPage } from '../../shared';

export class DaoMembersPage extends DaoPage {
    constructor(params: {
        page: PlaywrightPage;
        network: string;
        address: string;
    }) {
        super({ ...params, path: 'members' });
    }

    readonly pageTitle = () =>
        this.page.getByRole('heading', { name: 'Members' });

    readonly memberLinks = () => this.page.getByRole('main').getByRole('link');

    readonly firstMember = () => this.memberLinks().first();

    readonly asideCard = () => this.page.getByRole('complementary');
}
