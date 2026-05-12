import * as AppKit from '@reown/appkit/react';
import { render } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { DesyncWatcher } from './desyncWatcher';

describe('<DesyncWatcher /> component', () => {
    const useAppKitAccountSpy = jest.spyOn(AppKit, 'useAppKitAccount');
    const useConnectionSpy = jest.spyOn(wagmi, 'useConnection');
    const useDisconnectSpy = jest.spyOn(AppKit, 'useDisconnect');

    const mockDisconnect = jest.fn();

    const mockState = (params: {
        appKitConnected: boolean;
        wagmiConnected: boolean;
        isReconnecting?: boolean;
    }) => {
        const {
            appKitConnected,
            wagmiConnected,
            isReconnecting = false,
        } = params;

        useAppKitAccountSpy.mockReturnValue({
            isConnected: appKitConnected,
        } as unknown as ReturnType<typeof AppKit.useAppKitAccount>);
        useConnectionSpy.mockReturnValue({
            isConnected: wagmiConnected,
            isReconnecting,
        } as unknown as wagmi.UseConnectionReturnType);
    };

    beforeEach(() => {
        useDisconnectSpy.mockReturnValue({
            disconnect: mockDisconnect,
        } as unknown as ReturnType<typeof AppKit.useDisconnect>);
    });

    afterEach(() => {
        useAppKitAccountSpy.mockReset();
        useConnectionSpy.mockReset();
        useDisconnectSpy.mockReset();
        mockDisconnect.mockReset();
    });

    it('does nothing when both stores agree they are connected', () => {
        mockState({ appKitConnected: true, wagmiConnected: true });
        render(<DesyncWatcher />);
        expect(mockDisconnect).not.toHaveBeenCalled();
    });

    it('does nothing when both stores agree they are disconnected', () => {
        mockState({ appKitConnected: false, wagmiConnected: false });
        render(<DesyncWatcher />);
        expect(mockDisconnect).not.toHaveBeenCalled();
    });

    it('disconnects when AppKit is connected but wagmi is not (orphan WC session)', () => {
        mockState({ appKitConnected: true, wagmiConnected: false });
        render(<DesyncWatcher />);
        expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it('disconnects when wagmi is connected but AppKit is not (stale wagmi-only state)', () => {
        mockState({ appKitConnected: false, wagmiConnected: true });
        render(<DesyncWatcher />);
        expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it('stays inert while wagmi is reconnecting even if stores diverge', () => {
        mockState({
            appKitConnected: true,
            wagmiConnected: false,
            isReconnecting: true,
        });
        render(<DesyncWatcher />);
        expect(mockDisconnect).not.toHaveBeenCalled();
    });
});
