import {
    EXPLORE_SEARCH_API_TIMEOUT,
    EXPLORE_SEARCH_UI_TIMEOUT,
    ExplorePage,
} from '@e2e/helpers';
import { expect, test } from '@playwright/test';

test.describe('Explore page', () => {
    let explore: ExplorePage;

    test.beforeEach(async ({ page }) => {
        explore = await new ExplorePage(page).navigate();
    });

    test('renders hero, featured, and explore sections', async () => {
        await expect(explore.heroHeading()).toBeVisible();
        await expect(explore.featuredHeading()).toBeVisible();
        await expect(explore.exploreHeading()).toBeVisible();
        await expect(explore.ctaHeading()).toBeVisible();
    });

    test('shows filter controls and search', async () => {
        await expect(explore.filterAllDaos()).toBeVisible();
        await expect(explore.searchInput()).toBeVisible();
        await expect(explore.createDaoButton()).toBeVisible();
    });

    test('displays a non-empty DAO list from the API', async () => {
        await expect(explore.daoCards().first()).toBeVisible();
    });

    test('search filters the DAO list', async ({ page }) => {
        const cards = explore.daoCards();
        await expect(cards.first()).toBeVisible();
        const countBefore = await cards.count();

        // DaoList debounces search by 500ms — wait for the filtered API response.
        const searchResponse = page.waitForResponse(
            (res) =>
                res.url().includes('/v2/daos') &&
                res.url().includes('search=aragon') &&
                res.ok(),
            { timeout: EXPLORE_SEARCH_API_TIMEOUT },
        );
        await explore.searchInput().fill('aragon');
        await searchResponse;

        await expect(cards.first()).toBeVisible({
            timeout: EXPLORE_SEARCH_UI_TIMEOUT,
        });

        const countAfter = await cards.count();
        expect(countAfter).toBeGreaterThan(0);
        expect(countAfter).toBeLessThanOrEqual(countBefore);
    });
});
