import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import * as wagmi from 'wagmi';
import * as wagmiActions from 'wagmi/actions';
import * as wagmiConnectors from 'wagmi/connectors';
import type { IDebugContext } from '@/shared/components/debugProvider';
import * as debugProvider from '@/shared/components/debugProvider';
import { useAddressImpersonation } from './useAddressImpersonation';

describe('useAddressImpersonation', () => {
    const validAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

    const mockConnectAsync = jest.fn();
    const mockDisconnectAsync = jest.fn();
    const mockConnector = jest.fn();
    const mockRegisterControl = jest.fn();
    const mockUnregisterControl = jest.fn();

    const useConnectSpy = jest.spyOn(wagmi, 'useConnect');
    const useDisconnectSpy = jest.spyOn(wagmi, 'useDisconnect');
    const mockConnectorType = wagmiConnectors.mock.type;
    // The spy replaces the connector factory, so its static `type` is restored for the hook to compare against.
    const mockSpy = Object.assign(jest.spyOn(wagmiConnectors, 'mock'), {
        type: mockConnectorType,
    });
    const useConfigSpy = jest.spyOn(wagmi, 'useConfig');
    const getConnectionSpy = jest.spyOn(wagmiActions, 'getConnection');
    const useDebugContextSpy = jest.spyOn(debugProvider, 'useDebugContext');

    const mockConnectedType = (type?: string) =>
        getConnectionSpy.mockReturnValue({
            connector: type == null ? undefined : { type },
        } as unknown as ReturnType<typeof wagmiActions.getConnection>);

    const createDebugContext = (
        values: Record<string, unknown> = {},
    ): IDebugContext => ({
        values,
        registerControl: mockRegisterControl,
        unregisterControl: mockUnregisterControl,
        controls: [],
        updateValue: jest.fn(),
    });

    beforeEach(() => {
        useConnectSpy.mockReturnValue({
            connectAsync: mockConnectAsync,
        } as unknown as wagmi.UseConnectReturnType);

        useDisconnectSpy.mockReturnValue({
            disconnectAsync: mockDisconnectAsync,
        } as unknown as wagmi.UseDisconnectReturnType);

        mockSpy.mockReturnValue(mockConnector as never);
        useConfigSpy.mockReturnValue({} as wagmi.Config);
        mockConnectedType(undefined);
        useDebugContextSpy.mockReturnValue(createDebugContext());
    });

    afterEach(() => {
        useConnectSpy.mockReset();
        useDisconnectSpy.mockReset();
        mockSpy.mockReset();
        useConfigSpy.mockReset();
        getConnectionSpy.mockReset();
        mockConnectAsync.mockReset();
        mockDisconnectAsync.mockReset();
        mockRegisterControl.mockReset();
        mockUnregisterControl.mockReset();
        useDebugContextSpy.mockReset();
    });

    it('registers the address control on mount', () => {
        renderHook(() => useAddressImpersonation());

        expect(mockRegisterControl).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'impersonateAddress',
                type: 'address',
                label: 'Impersonate address',
                group: 'Simulation',
            }),
        );
        expect(mockRegisterControl).not.toHaveBeenCalledWith(
            expect.objectContaining({ name: 'impersonatePersist' }),
        );
    });

    it('unregisters the address control on unmount', () => {
        const { unmount } = renderHook(() => useAddressImpersonation());
        unmount();

        expect(mockUnregisterControl).toHaveBeenCalledWith(
            'impersonateAddress',
        );
        expect(mockUnregisterControl).not.toHaveBeenCalledWith(
            'impersonatePersist',
        );
    });

    it('does not connect or disconnect on initial render', () => {
        renderHook(() => useAddressImpersonation());

        expect(mockConnectAsync).not.toHaveBeenCalled();
        expect(mockDisconnectAsync).not.toHaveBeenCalled();
    });

    it('connects mock connector when onChange fires with a valid address', async () => {
        renderHook(() => useAddressImpersonation());

        const addressControl = mockRegisterControl.mock.calls[0][0];
        await act(() => addressControl.onChange(validAddress));

        await waitFor(() => {
            expect(mockDisconnectAsync).toHaveBeenCalled();
            expect(mockConnectAsync).toHaveBeenCalledWith({
                connector: mockConnector,
            });
            expect(mockSpy).toHaveBeenCalledWith({
                accounts: [validAddress],
            });
        });
    });

    it('does not disconnect a real wallet when onChange fires with undefined', async () => {
        mockConnectedType('injected');
        renderHook(() => useAddressImpersonation());

        const addressControl = mockRegisterControl.mock.calls[0][0];
        await act(() => addressControl.onChange(undefined));

        expect(mockDisconnectAsync).not.toHaveBeenCalled();
        expect(mockConnectAsync).not.toHaveBeenCalled();
    });

    it('disconnects the impersonated address when onChange fires with undefined', async () => {
        mockConnectedType(mockConnectorType);
        renderHook(() => useAddressImpersonation());

        const addressControl = mockRegisterControl.mock.calls[0][0];
        await act(() => addressControl.onChange(undefined));

        expect(mockDisconnectAsync).toHaveBeenCalledTimes(1);
    });

    it('does not disconnect a real wallet connected after a failed address switch', async () => {
        const otherAddress = '0x0000000000000000000000000000000000000001';
        renderHook(() => useAddressImpersonation());

        const addressControl = mockRegisterControl.mock.calls[0][0];
        await act(() => addressControl.onChange(validAddress));
        mockConnectAsync.mockRejectedValueOnce(new Error('connect failed'));
        await act(() => addressControl.onChange(otherAddress));
        mockDisconnectAsync.mockClear();

        mockConnectedType('injected');
        await act(() => addressControl.onChange(undefined));

        expect(mockDisconnectAsync).not.toHaveBeenCalled();
    });

    it('does not disconnect a real wallet connected after the mock was disconnected elsewhere', async () => {
        mockConnectedType(mockConnectorType);
        renderHook(() => useAddressImpersonation());

        const addressControl = mockRegisterControl.mock.calls[0][0];
        await act(() => addressControl.onChange(validAddress));
        mockDisconnectAsync.mockClear();

        mockConnectedType('injected');
        await act(() => addressControl.onChange(undefined));

        expect(mockDisconnectAsync).not.toHaveBeenCalled();
    });
});
