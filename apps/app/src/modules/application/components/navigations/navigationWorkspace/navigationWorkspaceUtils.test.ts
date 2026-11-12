import { WorkspaceAccountType } from '@/modules/workspace/api/workspaceService';
import { navigationWorkspaceUtils } from './navigationWorkspaceUtils';

describe('navigationWorkspace utils', () => {
    const workspaceId = 'demo';
    const accountId =
        'ethereum-sepolia-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const visibleLinks = (
        links: ReturnType<typeof navigationWorkspaceUtils.buildLinks>,
    ) => links.filter((link) => !link.hidden).map((link) => link.link);

    describe('buildLinks', () => {
        it('scopes the section links to an account whose type is not known yet, holding back the ones restricted by type', () => {
            const links = navigationWorkspaceUtils.buildLinks(
                workspaceId,
                accountId,
            );

            expect(visibleLinks(links)).toEqual([
                `/workspace/demo/${accountId}/overview`,
                `/workspace/demo/${accountId}/transactions`,
                `/workspace/demo/${accountId}/assets`,
                `/workspace/demo/${accountId}/members`,
            ]);
        });

        it('lists every section of a DAO account', () => {
            const links = navigationWorkspaceUtils.buildLinks(
                workspaceId,
                accountId,
                WorkspaceAccountType.DAO,
            );

            expect(visibleLinks(links)).toEqual([
                `/workspace/demo/${accountId}/overview`,
                `/workspace/demo/${accountId}/proposals`,
                `/workspace/demo/${accountId}/transactions`,
                `/workspace/demo/${accountId}/assets`,
                `/workspace/demo/${accountId}/members`,
                `/workspace/demo/${accountId}/permissions`,
                `/workspace/demo/${accountId}/settings`,
            ]);
        });

        it('lists the settings of a Safe account, but not its proposals or permissions', () => {
            const links = navigationWorkspaceUtils.buildLinks(
                workspaceId,
                accountId,
                WorkspaceAccountType.SAFE,
            );

            expect(visibleLinks(links)).toEqual([
                `/workspace/demo/${accountId}/overview`,
                `/workspace/demo/${accountId}/transactions`,
                `/workspace/demo/${accountId}/assets`,
                `/workspace/demo/${accountId}/members`,
                `/workspace/demo/${accountId}/settings`,
            ]);
        });

        it('lists the proposals of the aggregated scope, but not permissions or settings', () => {
            const links = navigationWorkspaceUtils.buildLinks(
                workspaceId,
                'all',
            );

            expect(visibleLinks(links)).toEqual([
                '/workspace/demo/all/overview',
                '/workspace/demo/all/proposals',
                '/workspace/demo/all/transactions',
                '/workspace/demo/all/assets',
                '/workspace/demo/all/members',
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
                '/workspace/demo/all/transactions',
                '/workspace/demo/all/assets',
                '/workspace/demo/all/members',
            ]);
        });
    });

    describe('buildInboxLinks', () => {
        it('hides the to-dos link without a connected wallet', () => {
            const [link] = navigationWorkspaceUtils.buildInboxLinks(
                workspaceId,
                'all',
                { isConnected: false, count: 0 },
            );

            expect(link.hidden).toBeTruthy();
        });

        it('scopes the to-dos link to the account and badges it with the count waiting', () => {
            const [link] = navigationWorkspaceUtils.buildInboxLinks(
                workspaceId,
                accountId,
                { isConnected: true, count: 5 },
            );

            expect(link.link).toEqual(`/workspace/demo/${accountId}/todos`);
            expect(link.hidden).toBeFalsy();
            expect(link.badge).toEqual('5');
        });

        it('shows no badge when nothing is waiting', () => {
            const [link] = navigationWorkspaceUtils.buildInboxLinks(
                workspaceId,
                'all',
                { isConnected: true, count: 0 },
            );

            expect(link.link).toEqual('/workspace/demo/all/todos');
            expect(link.badge).toBeUndefined();
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
