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
        localStorage.clear();

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

    it('registers address and persist controls on mount', () => {
        renderHook(() => useAddressImpersonation());

        expect(mockRegisterControl).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'impersonateAddress',
                type: 'address',
                label: 'Impersonate address',
                group: 'Simulation',
            }),
        );

        expect(mockRegisterControl).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'impersonatePersist',
                type: 'boolean',
                label: 'Persist across reloads',
                group: 'Simulation',
            }),
        );
    });

    it('unregisters both controls on unmount', () => {
        const { unmount } = renderHook(() => useAddressImpersonation());
        unmount();

        expect(mockUnregisterControl).toHaveBeenCalledWith(
            'impersonateAddress',
        );
        expect(mockUnregisterControl).toHaveBeenCalledWith(
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

        const addressControl = mockRegisterControl.mock.calls[0][0];
        await act(() => addressControl.onChange(undefined));

        await waitFor(() => {
            expect(mockDisconnectAsync).toHaveBeenCalled();
            expect(mockConnectAsync).not.toHaveBeenCalled();
        });
    });

    it('removes saved address from localStorage when onChange fires with undefined', async () => {
        localStorage.setItem('debug:impersonateAddress', validAddress);

        renderHook(() => useAddressImpersonation());

        const addressControl = mockRegisterControl.mock.calls[0][0];
        await act(() => addressControl.onChange(undefined));

        expect(localStorage.getItem('debug:impersonateAddress')).toBeNull();
    });

    it('saves address to localStorage when persist is enabled', async () => {
        renderHook(() => useAddressImpersonation());

        const addressControl = mockRegisterControl.mock.calls[0][0];
        const persistControl = mockRegisterControl.mock.calls[1][0];

        act(() => persistControl.onChange(true));
        await act(() => addressControl.onChange(validAddress));

        expect(localStorage.getItem('debug:impersonateAddress')).toBe(
            validAddress,
        );
        expect(localStorage.getItem('debug:impersonatePersist')).toBe('true');
    });

    it('clears localStorage when persist is disabled', () => {
        localStorage.setItem('debug:impersonatePersist', 'true');
        localStorage.setItem('debug:impersonateAddress', validAddress);

        renderHook(() => useAddressImpersonation());

        const persistControl = mockRegisterControl.mock.calls[1][0];
        act(() => persistControl.onChange(false));

        expect(localStorage.getItem('debug:impersonateAddress')).toBeNull();
        expect(localStorage.getItem('debug:impersonatePersist')).toBeNull();
    });

    it('restores persisted address and auto-connects on mount', async () => {
        localStorage.setItem('debug:impersonatePersist', 'true');
        localStorage.setItem('debug:impersonateAddress', validAddress);

        renderHook(() => useAddressImpersonation());

        await waitFor(() => {
            expect(mockDisconnectAsync).toHaveBeenCalled();
            expect(mockConnectAsync).toHaveBeenCalledWith({
                connector: mockConnector,
            });
        });
    });

    it('does not auto-connect when persist is disabled', () => {
        localStorage.setItem('debug:impersonateAddress', validAddress);

        renderHook(() => useAddressImpersonation());

        expect(mockConnectAsync).not.toHaveBeenCalled();
        expect(mockDisconnectAsync).not.toHaveBeenCalled();
    });
});
