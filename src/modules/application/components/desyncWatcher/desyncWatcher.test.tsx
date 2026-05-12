import * as AppKit from '@reown/appkit/react';
import { act, render } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { DesyncWatcher } from './desyncWatcher';

type AppKitStatus =
    | 'connected'
    | 'connecting'
    | 'disconnected'
    | 'reconnecting';

describe('<DesyncWatcher /> component', () => {
    const useAppKitAccountSpy = jest.spyOn(AppKit, 'useAppKitAccount');
    const useConnectionSpy = jest.spyOn(wagmi, 'useConnection');
    const useDisconnectSpy = jest.spyOn(AppKit, 'useDisconnect');

    const mockDisconnect = jest.fn();

    const mockState = (params: {
        appKitConnected: boolean;
        wagmiConnected: boolean;
        isReconnecting?: boolean;
        status?: AppKitStatus;
    }) => {
        const {
            appKitConnected,
            wagmiConnected,
            isReconnecting = false,
            status = appKitConnected ? 'connected' : 'disconnected',
        } = params;

        useAppKitAccountSpy.mockReturnValue({
            isConnected: appKitConnected,
            status,
        } as unknown as ReturnType<typeof AppKit.useAppKitAccount>);
        useConnectionSpy.mockReturnValue({
            isConnected: wagmiConnected,
            isReconnecting,
        } as unknown as wagmi.UseConnectionReturnType);
    };

    beforeEach(() => {
        jest.useFakeTimers();
        useDisconnectSpy.mockReturnValue({
            disconnect: mockDisconnect,
        } as unknown as ReturnType<typeof AppKit.useDisconnect>);
    });

    afterEach(() => {
        jest.useRealTimers();
        useAppKitAccountSpy.mockReset();
        useConnectionSpy.mockReset();
        useDisconnectSpy.mockReset();
        mockDisconnect.mockReset();
    });

    it('does nothing when both stores agree they are connected', () => {
        mockState({ appKitConnected: true, wagmiConnected: true });
        render(<DesyncWatcher />);
        act(() => {
            jest.runAllTimers();
        });
        expect(mockDisconnect).not.toHaveBeenCalled();
    });

    it('does nothing when both stores agree they are disconnected', () => {
        mockState({ appKitConnected: false, wagmiConnected: false });
        render(<DesyncWatcher />);
        act(() => {
            jest.runAllTimers();
        });
        expect(mockDisconnect).not.toHaveBeenCalled();
    });

    it('disconnects after the settle window when divergence persists (AppKit connected, wagmi not)', () => {
        mockState({ appKitConnected: true, wagmiConnected: false });
        render(<DesyncWatcher />);
        expect(mockDisconnect).not.toHaveBeenCalled();
        act(() => {
            jest.advanceTimersByTime(1500);
        });
        expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it('disconnects after the settle window when divergence persists (wagmi connected, AppKit not)', () => {
        mockState({ appKitConnected: false, wagmiConnected: true });
        render(<DesyncWatcher />);
        act(() => {
            jest.advanceTimersByTime(1500);
        });
        expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it('cancels the pending disconnect when stores converge during the settle window', () => {
        mockState({ appKitConnected: false, wagmiConnected: true });
        const { rerender } = render(<DesyncWatcher />);
        act(() => {
            jest.advanceTimersByTime(500);
        });
        // AppKit catches up before the window elapses.
        mockState({ appKitConnected: true, wagmiConnected: true });
        rerender(<DesyncWatcher />);
        act(() => {
            jest.runAllTimers();
        });
        expect(mockDisconnect).not.toHaveBeenCalled();
    });

    it('stays inert while wagmi is reconnecting even if stores diverge', () => {
        mockState({
            appKitConnected: true,
            wagmiConnected: false,
            isReconnecting: true,
        });
        render(<DesyncWatcher />);
        act(() => {
            jest.runAllTimers();
        });
        expect(mockDisconnect).not.toHaveBeenCalled();
    });

    it('stays inert while AppKit status is connecting', () => {
        mockState({
            appKitConnected: false,
            wagmiConnected: true,
            status: 'connecting',
        });
        render(<DesyncWatcher />);
        act(() => {
            jest.runAllTimers();
        });
        expect(mockDisconnect).not.toHaveBeenCalled();
    });

    it('stays inert while AppKit status is reconnecting', () => {
        mockState({
            appKitConnected: false,
            wagmiConnected: true,
            status: 'reconnecting',
        });
        render(<DesyncWatcher />);
        act(() => {
            jest.runAllTimers();
        });
        expect(mockDisconnect).not.toHaveBeenCalled();
    });
});
