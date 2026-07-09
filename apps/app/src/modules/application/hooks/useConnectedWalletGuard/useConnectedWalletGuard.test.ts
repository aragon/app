import { renderHook } from '@testing-library/react';
import * as DialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import { ApplicationDialogId } from '../../constants/applicationDialogId';
import * as UseWalletConnected from '../useWalletConnected';
import { useConnectedWalletGuard } from './useConnectedWalletGuard';

describe('useConnectedWalletGuard hook', () => {
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');
    const useWalletConnectedSpy = jest.spyOn(
        UseWalletConnected,
        'useWalletConnected',
    );

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useWalletConnectedSpy.mockReset();
    });

    describe('result', () => {
        it('reflects the connection state from useWalletConnected', () => {
            useDialogContextSpy.mockReturnValue(generateDialogContext());
            useWalletConnectedSpy.mockReturnValue(true);
            const { result } = renderHook(() => useConnectedWalletGuard());
            expect(result.current.result).toBe(true);
        });
    });

    describe('check', () => {
        it('calls onSuccess and does not open the dialog when connected', () => {
            const open = jest.fn();
            const onSuccess = jest.fn();
            useDialogContextSpy.mockReturnValue(
                generateDialogContext({ open }),
            );
            useWalletConnectedSpy.mockReturnValue(true);
            const { result } = renderHook(() =>
                useConnectedWalletGuard({ onSuccess }),
            );
            result.current.check();
            expect(onSuccess).toHaveBeenCalledTimes(1);
            expect(open).not.toHaveBeenCalled();
        });

        it('opens the connect wallet dialog when disconnected', () => {
            const open = jest.fn();
            const onSuccess = jest.fn();
            const onError = jest.fn();
            useDialogContextSpy.mockReturnValue(
                generateDialogContext({ open }),
            );
            useWalletConnectedSpy.mockReturnValue(false);
            const { result } = renderHook(() =>
                useConnectedWalletGuard({ onSuccess, onError }),
            );
            result.current.check();
            expect(onSuccess).not.toHaveBeenCalled();
            expect(open).toHaveBeenCalledWith(
                ApplicationDialogId.CONNECT_WALLET,
                { params: { onError, onSuccess } },
            );
        });

        it('prefers per-call callbacks over hook-level callbacks', () => {
            const open = jest.fn();
            const hookOnSuccess = jest.fn();
            const callOnSuccess = jest.fn();
            useDialogContextSpy.mockReturnValue(
                generateDialogContext({ open }),
            );
            useWalletConnectedSpy.mockReturnValue(true);
            const { result } = renderHook(() =>
                useConnectedWalletGuard({ onSuccess: hookOnSuccess }),
            );
            result.current.check({ onSuccess: callOnSuccess });
            expect(callOnSuccess).toHaveBeenCalledTimes(1);
            expect(hookOnSuccess).not.toHaveBeenCalled();
        });
    });
});
