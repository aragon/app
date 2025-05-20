import * as useDialogContext from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import type * as GovUiKit from '@aragon/gov-ui-kit';
import { addressUtils, clipboardUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as wagmi from 'wagmi';
import { type IUserDialogProps, UserDialog } from './userDialog';

jest.mock('@aragon/gov-ui-kit', () => ({
    ...jest.requireActual<typeof GovUiKit>('@aragon/gov-ui-kit'),
    MemberAvatar: () => <div data-testid="member-avatar-mock" />,
}));

describe('<UserDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');
    const useAccountSpy = jest.spyOn(wagmi, 'useAccount');
    const useDisconnectSpy = jest.spyOn(wagmi, 'useDisconnect');
    const useEnsNameSpy = jest.spyOn(wagmi, 'useEnsName');
    const clipboardCopySpy = jest.spyOn(clipboardUtils, 'copy');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useAccountSpy.mockReturnValue({} as unknown as wagmi.UseAccountReturnType);
        useDisconnectSpy.mockReturnValue({} as unknown as wagmi.UseDisconnectReturnType);
        useEnsNameSpy.mockReturnValue({} as unknown as wagmi.UseEnsNameReturnType);
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useAccountSpy.mockReset();
        useDisconnectSpy.mockReset();
        useEnsNameSpy.mockReset();
        clipboardCopySpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IUserDialogProps>) => {
        const completeProps: IUserDialogProps = {
            location: { id: 'test' },
            ...props,
        };

        return (
            <GukModulesProvider>
                <UserDialog {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders empty container when address is not defined', () => {
        useAccountSpy.mockReturnValue({ address: undefined } as unknown as wagmi.UseAccountReturnType);
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the connected user avatar, ens name and address', () => {
        const address = '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5';
        const ensName = 'name.eth';
        useAccountSpy.mockReturnValue({ address } as unknown as wagmi.UseAccountReturnType);
        useEnsNameSpy.mockReturnValue({ data: ensName } as unknown as wagmi.UseEnsNameReturnType);
        render(createTestComponent());
        expect(screen.getByTestId('member-avatar-mock')).toBeInTheDocument();
        expect(screen.getByText(ensName)).toBeInTheDocument();
        expect(screen.getByText(addressUtils.truncateAddress(address))).toBeInTheDocument();
    });

    it('only renders the user address when it is not linked to an ENS name', () => {
        const address = '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5';
        useAccountSpy.mockReturnValue({ address } as unknown as wagmi.UseAccountReturnType);
        useEnsNameSpy.mockReturnValue({ data: null } as unknown as wagmi.UseEnsNameReturnType);
        render(createTestComponent());
        expect(screen.getByText(addressUtils.truncateAddress(address))).toBeInTheDocument();
    });

    it('renders a disconnect action for the user which disconnects', async () => {
        const disconnect = jest.fn();
        const close = jest.fn();
        useAccountSpy.mockReturnValue({ address: '0x123' } as unknown as wagmi.UseAccountReturnType);
        useDisconnectSpy.mockReturnValue({ disconnect } as unknown as wagmi.UseDisconnectReturnType);
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent());

        const logoutIcon = screen.getByTestId('LOGOUT');
        expect(logoutIcon).toBeInTheDocument();

        // eslint-disable-next-line testing-library/no-node-access
        const disconnectLink = logoutIcon.closest('a');
        expect(disconnectLink).toBeInTheDocument();

        await userEvent.click(disconnectLink!);
        expect(disconnect).toHaveBeenCalled();
    });

    it('closes the dialog when the user disconnects', () => {
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        useAccountSpy
            .mockReturnValueOnce({ address: '0x123' } as unknown as wagmi.UseAccountReturnType)
            .mockReturnValueOnce({ address: null } as unknown as wagmi.UseAccountReturnType);
        const { rerender } = render(createTestComponent());
        rerender(createTestComponent());
        expect(close).toHaveBeenCalled();
    });
});
