import { ApplicationDialog } from '@/modules/application/constants/moduleDialogs';
import * as DaoService from '@/shared/api/daoService';
import * as useDialogContext from '@/shared/components/dialogProvider';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { type Route } from 'next';
import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import * as wagmi from 'wagmi';
import { NavigationWizard, type INavigationWizardProps } from './navigationWizard';

jest.mock('@aragon/ods', () => ({
    ...jest.requireActual('@aragon/ods'),
    DaoAvatar: (props: { src: string }) => <div data-testid="dao-avatar-mock" data-src={props.src} />,
    Wallet: (props: { user: { address: string } | undefined; onClick: () => void }) => (
        <button onClick={props.onClick}>{props?.user ? props.user.address : 'connect-mock'}</button>
    ),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('<NavigationWizard /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');
    const useAccountSpy = jest.spyOn(wagmi, 'useAccount');
    const confirmSpy = jest.spyOn(window, 'confirm');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        cidToSrcSpy.mockReturnValue('ipfs://avatar-cid');
        useRouterSpy.mockReturnValue({
            push: jest.fn(),
            prefetch: jest.fn(),
        } as unknown as AppRouterInstance);
        useAccountSpy.mockReturnValue({ address: '0x123', isConnected: true } as unknown as wagmi.UseAccountReturnType);
        useDialogContextSpy.mockReturnValue({ open: jest.fn(), close: jest.fn() });
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
        useRouterSpy.mockReset();
        useAccountSpy.mockReset();
        useDialogContextSpy.mockReset();
        confirmSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<INavigationWizardProps>) => {
        const completeProps: INavigationWizardProps = {
            name: '',
            exitAlertDescription: 'You sure?',
            exitPath: '/',
            ...props,
        };
        return (
            <OdsModulesProvider>
                <NavigationWizard {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('renders the DAO avatar and name when data is fetched', () => {
        const dao = generateDao({ avatar: 'ipfs://avatar-cid', name: 'Test DAO' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));

        render(createTestComponent());

        const daoAvatar = screen.getByTestId('dao-avatar-mock');
        expect(daoAvatar).toBeInTheDocument();
        expect(daoAvatar.getAttribute('data-src')).toEqual(ipfsUtils.cidToSrc(dao.avatar));
        expect(screen.getByText('Test DAO')).toBeInTheDocument();
    });

    it('renders the wizard name', () => {
        const name = 'Create A New Test Proposal';
        render(createTestComponent({ name }));
        expect(screen.getByText(name)).toBeInTheDocument();
    });

    it('renders the user wallet address and opens the user dialog when clicked', async () => {
        const address = '0xUser123';
        const open = jest.fn();
        useAccountSpy.mockReturnValue({ address, isConnected: true } as unknown as wagmi.UseAccountReturnType);
        useDialogContextSpy.mockReturnValue({ open, close: jest.fn() });

        render(createTestComponent());

        const walletButton = screen.getByText(address);
        expect(walletButton).toBeInTheDocument();

        await userEvent.click(walletButton);
        expect(open).toHaveBeenCalledWith(ApplicationDialog.USER);
    });

    it('renders connect wallet button when user is not connected', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue({ open, close: jest.fn() });
        useAccountSpy.mockReturnValue({ address: null, isConnected: false } as unknown as wagmi.UseAccountReturnType);

        render(createTestComponent());

        const walletButton = screen.getByText('connect-mock');
        expect(walletButton).toBeInTheDocument();

        await userEvent.click(walletButton);
        expect(open).toHaveBeenCalledWith(ApplicationDialog.CONNECT_WALLET);
    });

    it('opens a confirmation dialog and navigates to the proposals page on confirming the exit', async () => {
        const mockPush = jest.fn();
        useRouterSpy.mockReturnValue({
            push: mockPush,
            prefetch: jest.fn(),
        } as unknown as AppRouterInstance);
        const id = 'test-dao-id';
        const exitPath = `/dao/${id}/proposals/` as Route<string>;
        confirmSpy.mockReturnValue(true);

        render(createTestComponent({ id, exitPath }));

        const closeButton = screen.getByTestId('CLOSE');
        await userEvent.click(closeButton);

        expect(window.confirm).toHaveBeenCalledWith(expect.any(String));
        expect(mockPush).toHaveBeenCalledWith(exitPath);
    });

    it('does not navigate to the proposals page if the confirmation is cancelled', async () => {
        const mockPush = jest.fn();
        useRouterSpy.mockReturnValue({
            push: mockPush,
            prefetch: jest.fn(),
        } as unknown as AppRouterInstance);
        const id = 'test-dao-id';
        confirmSpy.mockReturnValue(false);

        render(createTestComponent({ id }));

        const closeButton = screen.getByTestId('CLOSE');
        await userEvent.click(closeButton);

        expect(window.confirm).toHaveBeenCalledWith(expect.any(String));
        expect(mockPush).not.toHaveBeenCalled();
    });
});
