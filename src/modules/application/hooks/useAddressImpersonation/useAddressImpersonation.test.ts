import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import * as wagmi from 'wagmi';
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
    const mockSpy = jest.spyOn(wagmiConnectors, 'mock');
    const useDebugContextSpy = jest.spyOn(debugProvider, 'useDebugContext');

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
        useDebugContextSpy.mockReturnValue(createDebugContext());
    });

    afterEach(() => {
        useConnectSpy.mockReset();
        useDisconnectSpy.mockReset();
        mockSpy.mockReset();
        mockConnectAsync.mockReset();
        mockDisconnectAsync.mockReset();
        mockRegisterControl.mockReset();
        mockUnregisterControl.mockReset();
        useDebugContextSpy.mockReset();
    });

    it('registers an address control on mount', () => {
        renderHook(() => useAddressImpersonation());

        expect(mockRegisterControl).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'impersonateAddress',
                type: 'address',
                label: 'Impersonate address',
                group: 'Wallet',
            }),
        );
    });

    it('unregisters the control on unmount', () => {
        const { unmount } = renderHook(() => useAddressImpersonation());
        unmount();

        expect(mockUnregisterControl).toHaveBeenCalledWith(
            'impersonateAddress',
        );
    });

    it('does not connect or disconnect on initial render', () => {
        renderHook(() => useAddressImpersonation());

        expect(mockConnectAsync).not.toHaveBeenCalled();
        expect(mockDisconnectAsync).not.toHaveBeenCalled();
    });

    it('connects mock connector when onChange fires with a valid address', async () => {
        renderHook(() => useAddressImpersonation());

        const registeredControl = mockRegisterControl.mock.calls[0][0];
        await act(() => registeredControl.onChange(validAddress));

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

    it('disconnects when onChange fires with undefined', async () => {
        renderHook(() => useAddressImpersonation());

        const registeredControl = mockRegisterControl.mock.calls[0][0];
        await act(() => registeredControl.onChange(undefined));

        await waitFor(() => {
            expect(mockDisconnectAsync).toHaveBeenCalled();
            expect(mockConnectAsync).not.toHaveBeenCalled();
        });
    });
});
