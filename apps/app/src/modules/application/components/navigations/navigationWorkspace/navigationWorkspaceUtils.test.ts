import { navigationWorkspaceUtils } from './navigationWorkspaceUtils';

describe('navigationWorkspace utils', () => {
    const workspaceId = 'demo';
    const accountId =
        'ethereum-sepolia-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const visibleLinks = (
        links: ReturnType<typeof navigationWorkspaceUtils.buildLinks>,
    ) => links.filter((link) => !link.hidden).map((link) => link.link);

    describe('buildLinks', () => {
        it('scopes every section link to the given account', () => {
            const links = navigationWorkspaceUtils.buildLinks(
                workspaceId,
                accountId,
            );

            expect(visibleLinks(links)).toEqual([
                `/workspace/demo/${accountId}/overview`,
                `/workspace/demo/${accountId}/proposals`,
                `/workspace/demo/${accountId}/members`,
                `/workspace/demo/${accountId}/assets`,
                `/workspace/demo/${accountId}/transactions`,
            ]);
        });

        it('adds the permissions and settings of a DAO account', () => {
            const links = navigationWorkspaceUtils.buildLinks(
                workspaceId,
                accountId,
                true,
            );

            expect(visibleLinks(links).slice(-2)).toEqual([
                `/workspace/demo/${accountId}/permissions`,
                `/workspace/demo/${accountId}/settings`,
            ]);
        });

        it('falls back to the aggregated scope for a segment naming no account', () => {
            const links = navigationWorkspaceUtils.buildLinks(
                workspaceId,
                'overview',
            );

            expect(visibleLinks(links)).toEqual([
                '/workspace/demo/all/overview',
                '/workspace/demo/all/proposals',
                '/workspace/demo/all/members',
                '/workspace/demo/all/assets',
                '/workspace/demo/all/transactions',
            ]);
        });
    });

    describe('buildWorkspaceLinks', () => {
        it('links the settings of the workspace to its edit wizard', () => {
            const links =
                navigationWorkspaceUtils.buildWorkspaceLinks(workspaceId);

            expect(links.map((link) => link.link)).toEqual([
                '/workspace/demo/edit',
            ]);
        });
    });
});
