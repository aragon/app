import {
    type IWorkspace,
    WorkspaceAccountType,
} from '@/modules/workspace/api/workspaceService';
import { Network } from '@/shared/api/daoService';
import { navigationWorkspaceUtils } from './navigationWorkspaceUtils';

describe('navigationWorkspace utils', () => {
    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'demo',
        name: 'Demo Workspace',
        description: '',
        avatar: null,
        links: [],
        owner: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
        accounts: [
            {
                id: 'ethereum-sepolia-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
                type: WorkspaceAccountType.DAO,
                address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
                network: Network.ETHEREUM_SEPOLIA,
            },
        ],
        targets: [],
        ...workspace,
    });

    describe('getWorkspaceUrl', () => {
        it('builds the workspace base url', () => {
            expect(
                navigationWorkspaceUtils.getWorkspaceUrl(buildWorkspace()),
            ).toEqual('/workspace/demo');
        });

        it('appends the given path', () => {
            expect(
                navigationWorkspaceUtils.getWorkspaceUrl(
                    buildWorkspace(),
                    'assets',
                ),
            ).toEqual('/workspace/demo/assets');
        });
    });

    describe('buildLinks', () => {
        it('only links to the pages that exist', () => {
            const links = navigationWorkspaceUtils.buildLinks(
                buildWorkspace(),
                'page',
            );

            expect(links.map((link) => link.link)).toEqual([
                '/workspace/demo/overview',
                '/workspace/demo/proposals',
                '/workspace/demo/members',
                '/workspace/demo/assets',
                '/workspace/demo/transactions',
            ]);
        });

        it('only displays the overview in the navigation dialog', () => {
            const overviewUrl = '/workspace/demo/overview';

            const pageLink = navigationWorkspaceUtils
                .buildLinks(buildWorkspace(), 'page')
                .find((link) => link.link === overviewUrl);
            const dialogLink = navigationWorkspaceUtils
                .buildLinks(buildWorkspace(), 'dialog')
                .find((link) => link.link === overviewUrl);

            expect(pageLink?.hidden).toBeTruthy();
            expect(dialogLink?.hidden).toBeFalsy();
        });

        it('hides the page links on large screens when rendered in the navigation dialog', () => {
            const isPageLink = (link: { link: string }) =>
                link.link !== '/workspace/demo/overview';

            const pageLinks = navigationWorkspaceUtils
                .buildLinks(buildWorkspace(), 'page')
                .filter(isPageLink);
            const dialogLinks = navigationWorkspaceUtils
                .buildLinks(buildWorkspace(), 'dialog')
                .filter(isPageLink);

            expect(pageLinks.every((link) => link.lgHidden)).toBeFalsy();
            expect(dialogLinks.every((link) => link.lgHidden)).toBeTruthy();
        });
    });
});
