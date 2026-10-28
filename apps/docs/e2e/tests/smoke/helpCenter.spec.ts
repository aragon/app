import { type APIRequestContext, expect, test } from '@playwright/test';
import { draftNotice } from '../../../src/lib/site';

// Smoke suite of a site deployment, run after every staging and production deploy. The release
// workflows set E2E_DOCS_MODE=ready: staging and production publish the validated pages only.

const basePath = '/help';

// Routes of the published pages, from the sitemap (canonical URLs on the app's domain).
const readPageRoutes = async (
    request: APIRequestContext,
): Promise<string[]> => {
    const response = await request.get(`${basePath}/sitemap.xml`);
    expect(response.status()).toBe(200);

    const routes = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map((match) => new URL(match[1] ?? '').pathname)
        .filter((route) => route !== basePath);
    expect(routes.length).toBeGreaterThan(0);

    return routes;
};

test.describe('help center', () => {
    test('serves the home page with its styles', async ({ page, request }) => {
        const response = await page.goto(basePath);

        expect(response?.status()).toBe(200);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        // The export is nested under the base path after the build; a stylesheet answering 404
        // means the site renders unstyled.
        const stylesheet = await page
            .locator('link[rel="stylesheet"]')
            .first()
            .getAttribute('href');
        expect(stylesheet).toMatch(/^\/help\/_next\/static\//);
        expect((await request.get(stylesheet ?? '')).status()).toBe(200);
    });

    test('serves a published page and its markdown copy', async ({
        page,
        request,
    }) => {
        const [route] = await readPageRoutes(request);

        const response = await page.goto(route ?? '');
        expect(response?.status()).toBe(200);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        const copy = await request.get(`${route}.md`);
        expect(copy.status()).toBe(200);
        expect(copy.headers()['content-type']).toContain('text/markdown');
    });

    test('answers an unknown path with its not-found page', async ({
        page,
    }) => {
        const response = await page.goto(
            `${basePath}/this-page-does-not-exist`,
        );

        expect(response?.status()).toBe(404);
        await expect(
            page.getByRole('heading', { name: 'Page not found' }),
        ).toBeVisible();
    });

    test('publishes no draft', async ({ request }) => {
        test.skip(
            process.env.E2E_DOCS_MODE !== 'ready',
            'Development and previews publish the drafts.',
        );

        const routes = await readPageRoutes(request);
        const drafts: string[] = [];

        for (const route of routes) {
            const response = await request.get(route);
            expect(response.status()).toBe(200);

            if ((await response.text()).includes(draftNotice)) {
                drafts.push(route);
            }
        }

        expect(drafts).toEqual([]);
    });
});
