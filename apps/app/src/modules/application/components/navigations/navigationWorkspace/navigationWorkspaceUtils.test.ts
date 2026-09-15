import { addressUtils } from '@aragon/gov-ui-kit';
import {
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
} from '@/modules/workspace/api/workspaceQueryService';
import {
    type IWorkspace,
    WorkspaceAccountType,
} from '@/modules/workspace/api/workspaceService';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
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

    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const buildSafeAccount = () => ({
        id: `ethereum-sepolia-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
        network: Network.ETHEREUM_SEPOLIA,
    });

    describe('getAccountUrl', () => {
        it('links a DAO account to its own page on the app', () => {
            const [account] = buildWorkspace().accounts;

            expect(navigationWorkspaceUtils.getAccountUrl(account)).toEqual(
                `/dao/${Network.ETHEREUM_SEPOLIA}/${daoAddress}`,
            );
        });

        it('links any other account to its address on the block explorer', () => {
            const explorerUrl =
                networkDefinitions[Network.ETHEREUM_SEPOLIA].blockExplorers
                    ?.default.url;

            expect(
                navigationWorkspaceUtils.getAccountUrl(buildSafeAccount()),
            ).toEqual(`${explorerUrl}/address/${safeAddress}`);
        });
    });

    describe('buildAccountLinks', () => {
        it('sends a DAO to its page on the app and anything else to the block explorer', () => {
            const workspace = buildWorkspace({
                accounts: [...buildWorkspace().accounts, buildSafeAccount()],
            });
            const explorerUrl =
                networkDefinitions[Network.ETHEREUM_SEPOLIA].blockExplorers
                    ?.default.url;

            const links = navigationWorkspaceUtils.buildAccountLinks(workspace);

            expect(links.map((link) => link.url)).toEqual([
                `/dao/${Network.ETHEREUM_SEPOLIA}/${daoAddress}`,
                `${explorerUrl}/address/${safeAddress}`,
            ]);
        });

        it('labels a link with the name resolved by the accounts API', () => {
            const links = navigationWorkspaceUtils.buildAccountLinks(
                buildWorkspace(),
                [
                    {
                        network: Network.ETHEREUM_SEPOLIA,
                        address: daoAddress,
                        type: WorkspaceAccountInfoType.DAO,
                        status: WorkspaceAccountInfoStatus.AVAILABLE,
                        indexed: true,
                        name: 'Demo DAO',
                    },
                ],
            );

            expect(links[0].label).toEqual('Demo DAO');
        });

        it('falls back to the truncated address when the account has no name', () => {
            const links = navigationWorkspaceUtils.buildAccountLinks(
                buildWorkspace(),
            );

            expect(links[0].label).toEqual(
                addressUtils.truncateAddress(daoAddress),
            );
        });
    });

    describe('buildLinks', () => {
        it('only links to the pages that exist', () => {
            const links = navigationWorkspaceUtils.buildLinks(
                buildWorkspace(),
                'page',
            );

            expect(links.map((link) => link.link)).toEqual([
                '/workspace/demo',
                '/workspace/demo/proposals',
                '/workspace/demo/assets',
                '/workspace/demo/transactions',
            ]);
        });

        it('hides the links on large screens when rendered in the navigation dialog', () => {
            const pageLinks = navigationWorkspaceUtils.buildLinks(
                buildWorkspace(),
                'page',
            );
            const dialogLinks = navigationWorkspaceUtils.buildLinks(
                buildWorkspace(),
                'dialog',
            );

            expect(pageLinks.every((link) => link.lgHidden)).toBeFalsy();
            expect(dialogLinks.every((link) => link.lgHidden)).toBeTruthy();
        });
    });
});
