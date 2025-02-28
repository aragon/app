import * as useConnectedWalletGuard from '@/modules/application/hooks/useConnectedWalletGuard';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { useOpenDialogWithConnectedWallet } from '.';

import { generateDialogContext } from '@/shared/testUtils';
import { act, renderHook } from '@testing-library/react';

describe('useOpenDialogWithConnectedWallet', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useConnectedWalletGuardSpy = jest.spyOn(useConnectedWalletGuard, 'useConnectedWalletGuard');

    const promptWalletConnectionMock = jest.fn();
    const openDialogMock = jest.fn();

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open: openDialogMock }));
        useConnectedWalletGuardSpy.mockReturnValue({ check: promptWalletConnectionMock, result: false });
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useConnectedWalletGuardSpy.mockReset();
        promptWalletConnectionMock.mockReset();
        openDialogMock.mockReset();
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
        const spyFirstCall = useConnectedWalletGuardSpy.mock.calls[0];
        const spyFirstCallArgs = spyFirstCall[0]!;
        spyFirstCallArgs.onSuccess!();

        expect(openDialogMock).toHaveBeenCalledWith(dialogId, options);
    });

    it('does not open dialog when wallet connection fails', () => {
        const { result } = renderHook(() => useOpenDialogWithConnectedWallet());

        act(() => {
            result.current(dialogId, options);
        });

        expect(promptWalletConnectionMock).toHaveBeenCalled();

        // simulate wallet connection error
        const spyFirstCall = useConnectedWalletGuardSpy.mock.calls[0];
        const spyFirstCallArgs = spyFirstCall[0]!;
        spyFirstCallArgs.onError!();

        expect(openDialogMock).not.toHaveBeenCalled();
    });
});
