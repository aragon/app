import * as useDialogContext from '@/shared/components/dialogProvider';
import { generateDao, generateDialogContext } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { GukModulesProvider, type ICompositeAddress } from '@aragon/gov-ui-kit';
import type * as GovUiKit from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as NextNavigation from 'next/navigation';
import * as wagmi from 'wagmi';
import { ApplicationDialogId } from '../../../constants/applicationDialogId';
import { INavigationDialogProps } from '../navigation/navigationDialog';
import { NavigationDao, type INavigationDaoProps } from './navigationDao';

jest.mock('@aragon/gov-ui-kit', () => ({
    ...jest.requireActual<typeof GovUiKit>('@aragon/gov-ui-kit'),
    DaoAvatar: (props: { src: string }) => <div data-testid="dao-avatar-mock" data-src={props.src} />,
    Wallet: (props: { user?: ICompositeAddress; onClick: () => void }) => (
        <button onClick={props.onClick}>{props.user ? props.user.address : 'connect-mock'}</button>
    ),
}));

jest.mock('../navigation/navigationTrigger', () => ({
    NavigationTrigger: (props: { onClick: () => void; className: string }) => (
        <button data-testid="nav-trigger-mock" onClick={props.onClick} className={props.className} />
    ),
}));

jest.mock('../navigation/navigationDialog', () => ({
    NavigationDialog: (props: INavigationDialogProps<string>) => (
        <div data-testid="nav-dialog-mock" className={props.className} />
    ),
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

        const dao = generateDao({ id: 'test' });
        render(createTestComponent({ dao }));

        expect(screen.getByRole('link', { name: /navigationDao.link.proposals/ })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /navigationDao.link.members/ })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /navigationDao.link.assets/ })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /navigationDao.link.transactions/ })).toBeInTheDocument();

        expect(screen.queryByRole('link', { name: /navigationDao.link.dashboard/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /navigationDao.link.settings/ })).not.toBeInTheDocument();
    });

    it('renders a button to open the navigation dialog on mobile devices', async () => {
        render(createTestComponent());
        await userEvent.click(screen.getByTestId('nav-trigger-mock'));

        expect(screen.getByTestId('nav-dialog-mock')).toBeInTheDocument();
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
