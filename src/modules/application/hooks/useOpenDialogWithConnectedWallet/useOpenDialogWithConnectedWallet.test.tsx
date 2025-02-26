import {
    IUseConnectedWalletGuardParams,
    useConnectedWalletGuard,
} from '@/modules/application/hooks/useConnectedWalletGuard';
import { useOpenDialogWithConnectedWallet } from '@/modules/application/hooks/useOpenDialogWithConnectedWallet/useOpenDialogWithConnectedWallet';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { act, renderHook } from '@testing-library/react';

jest.mock('@/shared/components/dialogProvider');
jest.mock('@/modules/application/hooks/useConnectedWalletGuard');

describe('useOpenDialogWithConnectedWallet', () => {
    const openMock = jest.fn();
    const promptWalletConnectionMock = jest.fn();

    beforeEach(() => {
        (useDialogContext as jest.Mock).mockReturnValue({ open: openMock });
        (useConnectedWalletGuard as jest.Mock).mockReturnValue({ check: promptWalletConnectionMock });
        openMock.mockClear();
        promptWalletConnectionMock.mockClear();
    });

    const dialogLocation = { id: 'dialog-id', params: { customDialogParams: 'value' } };
    const dialogId = dialogLocation.id;
    const options = { params: dialogLocation.params };

    it('opens dialog when wallet is connected', () => {
        const { result } = renderHook(() => useOpenDialogWithConnectedWallet());

        act(() => {
            result.current(dialogId, options);
        });

        expect(promptWalletConnectionMock).toHaveBeenCalled();
        // simulate wallet connection success
        const mockFirstCall = (useConnectedWalletGuard as jest.Mock).mock.calls[0] as IUseConnectedWalletGuardParams[];
        const mockReturnValue = mockFirstCall[0];
        mockReturnValue.onSuccess!();

        expect(openMock).toHaveBeenCalledWith(dialogId, options);
    });

    it('does not open dialog when wallet connection fails', () => {
        const { result } = renderHook(() => useOpenDialogWithConnectedWallet());

        act(() => {
            result.current(dialogId, options);
        });

        expect(promptWalletConnectionMock).toHaveBeenCalled();
        // simulate wallet connection error
        const mockFirstCall = (useConnectedWalletGuard as jest.Mock).mock.calls[0] as IUseConnectedWalletGuardParams[];
        const mockReturnValue = mockFirstCall[0];
        mockReturnValue.onError!();

        expect(openMock).not.toHaveBeenCalled();
    });
});
