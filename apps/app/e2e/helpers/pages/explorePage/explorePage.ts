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

    readonly daoCards = () =>
        this.page
            .getByRole('main')
            .getByRole('link')
            .filter({
                has: this.page.getByRole('heading'),
            });
}
