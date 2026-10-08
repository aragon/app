import { navigationWorkspaceUtils } from './navigationWorkspaceUtils';

describe('navigationWorkspace utils', () => {
    const workspaceId = 'demo';

    describe('buildLinks', () => {
        it('scopes every link to the given account', () => {
            const accountId =
                'ethereum-sepolia-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
            const links = navigationWorkspaceUtils.buildLinks(
                workspaceId,
                'page',
                accountId,
            );

            expect(links.map((link) => link.link)).toEqual([
                `/workspace/demo/${accountId}/overview`,
                `/workspace/demo/${accountId}/proposals`,
                `/workspace/demo/${accountId}/members`,
                `/workspace/demo/${accountId}/assets`,
                `/workspace/demo/${accountId}/transactions`,
            ]);
        });

        it('falls back to the aggregated scope for a segment naming no account', () => {
            const links = navigationWorkspaceUtils.buildLinks(
                workspaceId,
                'page',
                'overview',
            );

            expect(links.map((link) => link.link)).toEqual([
                '/workspace/demo/all/overview',
                '/workspace/demo/all/proposals',
                '/workspace/demo/all/members',
                '/workspace/demo/all/assets',
                '/workspace/demo/all/transactions',
            ]);
        });

        it('only links to the pages that exist', () => {
            const links = navigationWorkspaceUtils.buildLinks(
                workspaceId,
                'page',
            );

            expect(links.map((link) => link.link)).toEqual([
                '/workspace/demo/all/overview',
                '/workspace/demo/all/proposals',
                '/workspace/demo/all/members',
                '/workspace/demo/all/assets',
                '/workspace/demo/all/transactions',
            ]);
        });

        it('only displays the overview in the navigation dialog', () => {
            const overviewUrl = '/workspace/demo/all/overview';

            const pageLink = navigationWorkspaceUtils
                .buildLinks(workspaceId, 'page')
                .find((link) => link.link === overviewUrl);
            const dialogLink = navigationWorkspaceUtils
                .buildLinks(workspaceId, 'dialog')
                .find((link) => link.link === overviewUrl);

            expect(pageLink?.hidden).toBeTruthy();
            expect(dialogLink?.hidden).toBeFalsy();
        });

        it('lists every page link in both the navigation bar and the navigation dialog', () => {
            const isPageLink = (link: { link: string }) =>
                link.link !== '/workspace/demo/all/overview';

            const pageLinks = navigationWorkspaceUtils
                .buildLinks(workspaceId, 'page')
                .filter(isPageLink);
            const dialogLinks = navigationWorkspaceUtils
                .buildLinks(workspaceId, 'dialog')
                .filter(isPageLink);

            expect(pageLinks.some((link) => link.hidden)).toBeFalsy();
            expect(dialogLinks.some((link) => link.hidden)).toBeFalsy();
        });
    });
});
