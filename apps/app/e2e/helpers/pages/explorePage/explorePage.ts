import type { Page as PlaywrightPage } from '@playwright/test';
import { BasePage } from '../../shared';

export class ExplorePage extends BasePage {
    constructor(page: PlaywrightPage) {
        super({ page, path: '/' });
    }

    readonly heroHeading = () =>
        this.page.getByRole('heading', {
            level: 1,
            name: /Governed on Aragon/i,
        });

    readonly featuredHeading = () =>
        this.page.getByRole('heading', { name: 'Featured' });

    readonly exploreHeading = () =>
        this.page.getByRole('heading', { name: 'Explore', exact: true });

    readonly filterAllDaos = () =>
        this.page.getByRole('radio', { name: 'All DAOs' });

    readonly searchInput = () =>
        this.page.getByPlaceholder('Search by name, address, or ENS');

    readonly createDaoButton = () =>
        this.page.getByRole('button', { name: 'Create a DAO' }).first();

    readonly ctaHeading = () =>
        this.page.getByRole('heading', { name: 'Getting started' });

    // Scoped to the explore DAOs section (`exploreDaosSectionId`) because the data-list card
    // renders its content next to the link instead of inside it, so the card link cannot be
    // told apart from the CTA card links by its own content.
    readonly daoCards = () =>
        this.page.locator('#explore-daos-section').getByRole('link');
}
