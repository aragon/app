import * as useDialogContext from '@/shared/components/dialogProvider';
import { generateDao, generateDialogContext } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { IconType, type ICompositeAddress } from '@aragon/gov-ui-kit';
import type * as GovUiKit from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as NextNavigation from 'next/navigation';
import * as wagmi from 'wagmi';
import { ApplicationDialogId } from '../../../constants/applicationDialogId';
import type { INavigationContainerProps } from '../navigation/navigationContainer';
import type { INavigationLink, INavigationLinksProps } from '../navigation/navigationLinks';
import type { INavigationTriggerProps } from '../navigation/navigationTrigger';
import { NavigationDao, type INavigationDaoProps } from './navigationDao';

jest.mock('@aragon/gov-ui-kit', () => ({
    ...jest.requireActual<typeof GovUiKit>('@aragon/gov-ui-kit'),
    DaoAvatar: (props: { src: string }) => <div data-testid="dao-avatar-mock" data-src={props.src} />,
    Wallet: (props: { user?: ICompositeAddress; onClick: () => void }) => (
        <button onClick={props.onClick}>{props.user ? props.user.address : 'connect-mock'}</button>
    ),
}));

jest.mock('../navigation', () => ({
    Navigation: {
        Container: ({ children, containerClasses }: INavigationContainerProps) => (
            <div data-testid="nav-container-mock" className={containerClasses}>
                {children}
            </div>
        ),
        AppLinks: () => <div data-testid="nav-app-links-mock" />,
        Trigger: ({ onClick, className }: INavigationTriggerProps) => (
            <button data-testid="nav-trigger-mock" onClick={onClick} className={className}>
                trigger
            </button>
        ),
        Dialog: () => (
            <div role="dialog" data-testid="nav-dialog-mock">
                Dialog Content
            </div>
        ),
        Links: ({ links, className }: INavigationLinksProps<string>) => (
            <nav className={className}>
                {links.map((link: INavigationLink<string>) => (
                    <a key={link.label} href={`/dao/${link.label}`} data-testid={`nav-link-${link.label}`}>
                        {link.label}
                        {link.icon === IconType.APP_EXPLORE && <span data-testid={IconType.APP_EXPLORE} />}
                    </a>
                ))}
            </nav>
        ),
    },
}));

describe('<NavigationDao /> component', () => {
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const hasSupportedPluginsSpy = jest.spyOn(daoUtils, 'hasSupportedPlugins');
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');
    const useAccountSpy = jest.spyOn(wagmi, 'useAccount');

    beforeEach(() => {
        usePathnameSpy.mockReturnValue('');
        useAccountSpy.mockReturnValue({} as wagmi.UseAccountReturnType);
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        cidToSrcSpy.mockReset();
        hasSupportedPluginsSpy.mockReset();
        useDialogContextSpy.mockReset();
        useAccountSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<INavigationDaoProps>) => {
        const completeProps: INavigationDaoProps = {
            dao: generateDao(),
            ...props,
        };

        return <NavigationDao {...completeProps} />;
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

        const dao = generateDao({ id: 'test' });
        render(createTestComponent({ dao }));

        expect(screen.getByRole('link', { name: 'app.application.navigationDao.link.proposals' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'app.application.navigationDao.link.members' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'app.application.navigationDao.link.assets' })).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'app.application.navigationDao.link.transactions' }),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole('link', { name: 'app.application.navigationDao.link.dashboard' }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('link', { name: 'app.application.navigationDao.link.settings' }),
        ).not.toBeInTheDocument();
    });

    it('renders a button to open the navigation dialog on mobile devices', async () => {
        render(createTestComponent());
        const triggerButton = screen.getByTestId('nav-trigger-mock');
        expect(triggerButton).toBeInTheDocument();
        expect(triggerButton.className).toContain('md:hidden');
        await userEvent.click(triggerButton);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
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
        useAccountSpy.mockReturnValue({ address, isConnected: true } as unknown as wagmi.UseAccountReturnType);
        render(createTestComponent());
        const button = screen.getByText(address);
        expect(button).toBeInTheDocument();
        await userEvent.click(button);
        expect(open).toHaveBeenCalledWith(ApplicationDialogId.USER);
    });
});
