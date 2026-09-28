import { GukModulesProvider, type ICompositeAddress } from '@aragon/gov-ui-kit';
import type * as GovUiKit from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as NextNavigation from 'next/navigation';
import useMeasure from 'react-use-measure';
import * as wagmi from 'wagmi';
import * as UseWalletConnected from '@/modules/application/hooks/useWalletConnected';
import { PluginInterfaceType } from '@/shared/api/daoService';
import * as useDialogContext from '@/shared/components/dialogProvider';
import type * as Navigation from '@/shared/components/navigation';
import {
    generateDao,
    generateDaoPlugin,
    generateDialogContext,
} from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { ApplicationDialogId } from '../../../constants/applicationDialogId';
import { type INavigationDaoProps, NavigationDao } from './navigationDao';

jest.mock('react-use-measure');

jest.mock('@aragon/gov-ui-kit', () => ({
    ...jest.requireActual<typeof GovUiKit>('@aragon/gov-ui-kit'),
    DaoAvatar: (props: { src: string }) => (
        <div data-src={props.src} data-testid="dao-avatar-mock" />
    ),
    Wallet: (props: { user?: ICompositeAddress; onClick: () => void }) => (
        <button onClick={props.onClick} type="button">
            {props.user ? props.user.address : 'connect-mock'}
        </button>
    ),
    Icon: (props: { icon: string }) => (
        <span data-testid={`icon-${props.icon}`} />
    ),
}));

jest.mock('../../supportChat', () => ({
    SupportChatTrigger: () => <div data-testid="support-chat-trigger-mock" />,
}));

jest.mock('@/shared/components/navigation', () => ({
    Navigation: {
        ...jest.requireActual<typeof Navigation>(
            '@/shared/components/navigation',
        ).Navigation,
        Trigger: (props: { onClick: () => void; className: string }) => (
            <button
                className={props.className}
                data-testid="nav-trigger-mock"
                onClick={props.onClick}
                type="button"
            />
        ),
    },
}));

describe('<NavigationDao /> component', () => {
    const mockNavigationWidth = (width: number) =>
        jest.mocked(useMeasure).mockReturnValue([
            jest.fn(),
            {
                width,
                height: 48,
                top: 0,
                left: 0,
                right: width,
                bottom: 48,
                x: 0,
                y: 0,
            },
            jest.fn(),
        ]);
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const hasSupportedPluginsSpy = jest.spyOn(daoUtils, 'hasSupportedPlugins');
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');
    const useDialogContextSpy = jest.spyOn(
        useDialogContext,
        'useDialogContext',
    );
    const useConnectionSpy = jest.spyOn(wagmi, 'useConnection');
    const useWalletConnectedSpy = jest.spyOn(
        UseWalletConnected,
        'useWalletConnected',
    );

    beforeEach(() => {
        mockNavigationWidth(0);
        usePathnameSpy.mockReturnValue('');
        useConnectionSpy.mockReturnValue({} as wagmi.UseConnectionReturnType);
        useWalletConnectedSpy.mockReturnValue(false);
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        cidToSrcSpy.mockReset();
        hasSupportedPluginsSpy.mockReset();
        useDialogContextSpy.mockReset();
        useConnectionSpy.mockReset();
        useWalletConnectedSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<INavigationDaoProps>) => {
        const completeProps: INavigationDaoProps = {
            dao: generateDao(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <NavigationDao {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the dao avatar and name', () => {
        const dao = generateDao({ avatar: 'ipfs://avatar-cid', name: 'MyDao' });
        cidToSrcSpy.mockReturnValue(dao.avatar!);
        render(createTestComponent({ dao }));
        const daoAvatar = screen.getByTestId('dao-avatar-mock');
        expect(daoAvatar).toBeInTheDocument();
        expect(daoAvatar.dataset.src).toEqual(dao.avatar);
        expect(screen.getByText(dao.name)).toBeInTheDocument();
    });

    it('renders only allowed navigation links (excluding dashboard and settings for row variant usage on desktop)', () => {
        hasSupportedPluginsSpy.mockReturnValue(true);

        const plugin = generateDaoPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            isBody: true,
        });
        const dao = generateDao({ id: 'test', plugins: [plugin] });
        render(createTestComponent({ dao }));

        expect(
            screen.getByRole('link', { name: /navigationDao.link.proposals/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /navigationDao.link.members/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /navigationDao.link.assets/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', {
                name: /navigationDao.link.transactions/,
            }),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole('link', {
                name: /navigationDao.link.dashboard/,
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('link', { name: /navigationDao.link.settings/ }),
        ).not.toBeInTheDocument();
    });

    it('hides the members and proposals links when DAO has no supported plugin', () => {
        hasSupportedPluginsSpy.mockReturnValue(false);
        render(createTestComponent({ id: 'test' }));
        expect(
            screen.queryByRole('link', { name: /navigationDao.link.members/ }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('link', {
                name: /navigationDao.link.proposals/,
            }),
        ).not.toBeInTheDocument();
    });

    it('renders a button to open the navigation dialog on narrow application panes', async () => {
        render(createTestComponent());
        const triggerButton = screen.getByTestId('nav-trigger-mock');
        expect(triggerButton).toBeInTheDocument();
        expect(triggerButton.className).toContain('md:hidden');
        await userEvent.click(triggerButton);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows the permissions link in the dao dialog menu', async () => {
        render(createTestComponent());
        await userEvent.click(screen.getByTestId('nav-trigger-mock'));

        expect(
            screen.getByRole('link', {
                name: /navigationDao.link.permissions/,
            }),
        ).toHaveAttribute('href', '/dao/ethereum-mainnet/1234/permissions');
        expect(screen.getByTestId('icon-APP_PERMISSIONS')).toBeInTheDocument();
    });

    it.each([
        { mode: 'collapsed', width: 0, duplicates: 1 },
        { mode: 'expanded', width: 600, duplicates: 0 },
    ])(
        'shows the correct dialog links when the navbar is $mode',
        async ({ width, duplicates }) => {
            mockNavigationWidth(width);
            hasSupportedPluginsSpy.mockReturnValue(true);
            const dao = generateDao({
                name: 'Navigation test DAO',
                plugins: [
                    generateDaoPlugin({
                        interfaceType: PluginInterfaceType.MULTISIG,
                        isBody: true,
                    }),
                    generateDaoPlugin({
                        interfaceType: PluginInterfaceType.GAUGE_VOTER,
                    }),
                    generateDaoPlugin({
                        interfaceType: PluginInterfaceType.CAPITAL_DISTRIBUTOR,
                    }),
                ],
            });
            render(createTestComponent({ dao }));
            await userEvent.click(
                screen.getByRole('button', { name: 'Navigation test DAO' }),
            );

            const dialog = within(screen.getByRole('dialog'));
            for (const name of [
                /navigationDao.link.proposals/,
                /navigationDao.link.members/,
                /navigationDao.link.assets/,
                /navigationDao.link.transactions/,
                /gaugeVoter.meta.link.gauges/,
                /capitalDistributor.meta.link.rewards/,
            ]) {
                expect(dialog.queryAllByRole('link', { name })).toHaveLength(
                    duplicates,
                );
            }
            for (const link of ['dashboard', 'permissions', 'settings']) {
                expect(
                    dialog.getByRole('link', {
                        name: new RegExp(`navigationDao.link.${link}`),
                    }),
                ).toBeInTheDocument();
            }
        },
    );

    it('updates the open dialog when the navbar collapses and expands', async () => {
        mockNavigationWidth(600);
        const dao = generateDao({ name: 'Navigation test DAO' });
        const { rerender } = render(createTestComponent({ dao }));
        await userEvent.click(
            screen.getByRole('button', { name: 'Navigation test DAO' }),
        );

        const dialog = within(screen.getByRole('dialog'));
        const assets = { name: /navigationDao.link.assets/ };
        expect(dialog.queryByRole('link', assets)).not.toBeInTheDocument();

        mockNavigationWidth(0);
        rerender(createTestComponent({ dao }));
        expect(dialog.getByRole('link', assets)).toBeInTheDocument();

        mockNavigationWidth(600);
        rerender(createTestComponent({ dao }));
        expect(dialog.queryByRole('link', assets)).not.toBeInTheDocument();
    });

    it('renders a connect button opening the connect-wallet dialog', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        render(createTestComponent());
        const button = screen.getByRole('button', { name: 'connect-mock' });
        expect(button).toBeInTheDocument();
        await userEvent.click(button);
        expect(open).toHaveBeenCalledWith(ApplicationDialogId.CONNECT_WALLET);
    });

    it('renders the user avatar on a button opening the user dialog', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        const address = '0x097d5e2325C2a98d3Adb0FE771ef66584698c59e';
        useConnectionSpy.mockReturnValue({
            address,
        } as unknown as wagmi.UseConnectionReturnType);
        useWalletConnectedSpy.mockReturnValue(true);
        render(createTestComponent());
        const button = screen.getByText(address);
        expect(button).toBeInTheDocument();
        await userEvent.click(button);
        expect(open).toHaveBeenCalledWith(ApplicationDialogId.USER);
    });
});
