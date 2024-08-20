import * as useDialogContext from '@/shared/components/dialogProvider';
import { addressUtils, clipboardUtils, IconType } from '@aragon/ods';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as wagmi from 'wagmi';
import { type IUserDialogProps, UserDialog } from './userDialog';

jest.mock('@aragon/ods', () => ({
    ...jest.requireActual('@aragon/ods'),
    MemberAvatar: () => <div data-testid="member-avatar-mock" />,
}));

describe('<UserDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');
    const useAccountSpy = jest.spyOn(wagmi, 'useAccount');
    const useDisconnectSpy = jest.spyOn(wagmi, 'useDisconnect');
    const useEnsNameSpy = jest.spyOn(wagmi, 'useEnsName');
    const clipboardCopySpy = jest.spyOn(clipboardUtils, 'copy');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue({ open: jest.fn(), close: jest.fn() });
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

        return <UserDialog {...completeProps} />;
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

    it('renders a copy button to copy the user address', async () => {
        const address = '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5';
        useAccountSpy.mockReturnValue({ address } as unknown as wagmi.UseAccountReturnType);
        render(createTestComponent());

        const copyButton = screen.getAllByRole('button').find((button) => within(button).queryByTestId(IconType.COPY));
        expect(copyButton).toBeInTheDocument();
        await userEvent.click(copyButton!);
        expect(clipboardCopySpy).toHaveBeenCalledWith(address);
    });

    it('renders a logout button to close the dialog and disconnect the user', async () => {
        const disconnect = jest.fn();
        const close = jest.fn();
        useAccountSpy.mockReturnValue({ address: '0x123' } as unknown as wagmi.UseAccountReturnType);
        useDisconnectSpy.mockReturnValue({ disconnect } as unknown as wagmi.UseDisconnectReturnType);
        useDialogContextSpy.mockReturnValue({ close, open: jest.fn() });
        render(createTestComponent());

        const disconnectButton = screen
            .getAllByRole('button')
            .find((button) => within(button).queryByTestId(IconType.LOGOUT));
        expect(disconnectButton).toBeInTheDocument();
        await userEvent.click(disconnectButton!);
        expect(close).toHaveBeenCalled();
        expect(disconnect).toHaveBeenCalled();
    });

    it('closes the dialog when the user disconnects', () => {
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue({ close, open: jest.fn() });
        useAccountSpy
            .mockReturnValueOnce({ address: '0x123' } as unknown as wagmi.UseAccountReturnType)
            .mockReturnValueOnce({ address: null } as unknown as wagmi.UseAccountReturnType);
        const { rerender } = render(createTestComponent());
        rerender(createTestComponent());
        expect(close).toHaveBeenCalled();
    });
});
