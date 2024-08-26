import { ApplicationDialog } from '@/modules/application/constants/moduleDialogs';
import * as DaoService from '@/shared/api/daoService';
import * as useDialogContext from '@/shared/components/dialogProvider';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AppRouterInstance, NavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime';
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
    const useRouterMock = jest.spyOn(NextNavigation, 'useRouter');
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');
    const useAccountSpy = jest.spyOn(wagmi, 'useAccount');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        cidToSrcSpy.mockReturnValue('ipfs://avatar-cid');
        useRouterMock.mockReturnValue({
            back: jest.fn(),
        } as unknown as AppRouterInstance);
        useAccountSpy.mockReturnValue({ address: '0x123', isConnected: true } as unknown as wagmi.UseAccountReturnType);
        useDialogContextSpy.mockReturnValue({ open: jest.fn(), close: jest.fn() });
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
        useRouterMock.mockReset();
        useAccountSpy.mockReset();
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<INavigationWizardProps>) => {
        const completeProps: INavigationWizardProps = { id: 'test-id', ...props };
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

    it('renders the default title if no title is provided', () => {
        render(createTestComponent());
        expect(screen.getByText('Create Proposal')).toBeInTheDocument();
    });

    it('calls router back on back button click', async () => {
        const mockBack = jest.fn();
        useRouterMock.mockReturnValue({
            back: mockBack,
            push: function <RouteType>(
                href: __next_route_internal_types__.RouteImpl<RouteType>,
                options?: NavigateOptions,
            ): void {
                throw new Error('Function not implemented.');
            },
            replace: function <RouteType>(
                href: __next_route_internal_types__.RouteImpl<RouteType>,
                options?: NavigateOptions,
            ): void {
                throw new Error('Function not implemented.');
            },
            prefetch: function <RouteType>(href: __next_route_internal_types__.RouteImpl<RouteType>): void {
                throw new Error('Function not implemented.');
            },
            forward: function (): void {
                throw new Error('Function not implemented.');
            },
            refresh: function (): void {
                throw new Error('Function not implemented.');
            },
        });

        render(createTestComponent());

        const backButton = screen.getByTestId('CLOSE');
        await userEvent.click(backButton);
        expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('renders the user wallet address and opens the user dialog when clicked', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue({ open, close: jest.fn() });

        render(createTestComponent());

        const walletButton = screen.getByText('0x123');
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
});
