import { act, renderHook } from '@testing-library/react';
import * as Wagmi from 'wagmi';
import { usePendingTransaction } from '@/shared/hooks/usePendingTransaction';
import {
    PendingTransactionStatus,
    pendingTransactionManager,
} from '@/shared/utils/pendingTransactionManager';
import { TransactionDialogStep } from './transactionDialog.api';
import { useManagedTransaction } from './useManagedTransaction';

jest.mock('@/modules/application/constants/wagmi', () => ({ wagmiConfig: {} }));
jest.mock('@/shared/hooks/usePendingTransaction', () => ({
    usePendingTransaction: jest.fn(),
}));

const request = {
    to: '0xabc',
    data: '0x',
    value: BigInt(0),
    chainId: 1,
} as unknown as Parameters<typeof pendingTransactionManager.send>[1];

describe('useManagedTransaction', () => {
    const usePendingTransactionMock = jest.mocked(usePendingTransaction);
    const useReceiptSpy = jest.spyOn(Wagmi, 'useWaitForTransactionReceipt');
    const getSpy = jest.spyOn(pendingTransactionManager, 'get');
    const isInterruptedSpy = jest.spyOn(
        pendingTransactionManager,
        'isInterrupted',
    );
    const sendSpy = jest.spyOn(pendingTransactionManager, 'send');
    const clearSpy = jest.spyOn(pendingTransactionManager, 'clear');
    const getRequestSpy = jest.spyOn(pendingTransactionManager, 'getRequest');

    beforeEach(() => {
        usePendingTransactionMock.mockReturnValue(undefined);
        useReceiptSpy.mockReturnValue(
            {} as Wagmi.UseWaitForTransactionReceiptReturnType,
        );
        getSpy.mockReturnValue(undefined);
        isInterruptedSpy.mockReturnValue(false);
        sendSpy.mockImplementation(() => undefined);
        clearSpy.mockImplementation(() => undefined);
        getRequestSpy.mockReturnValue(undefined);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('resumes to confirm for a submitted record', () => {
        getSpy.mockReturnValue({
            status: PendingTransactionStatus.SUBMITTED,
            hash: '0x1',
        });
        const { result } = renderHook(() => useManagedTransaction('id'));
        expect(result.current.resumeTarget).toBe(TransactionDialogStep.CONFIRM);
    });

    it('resumes to approve for a live pending record', () => {
        getSpy.mockReturnValue({ status: PendingTransactionStatus.PENDING });
        const { result } = renderHook(() => useManagedTransaction('id'));
        expect(result.current.resumeTarget).toBe(TransactionDialogStep.APPROVE);
    });

    it('does not resume and clears an interrupted (reloaded) pending record', () => {
        getSpy.mockReturnValue({ status: PendingTransactionStatus.PENDING });
        isInterruptedSpy.mockReturnValue(true);
        const { result } = renderHook(() => useManagedTransaction('id'));
        expect(result.current.resumeTarget).toBeUndefined();
        expect(clearSpy).toHaveBeenCalledWith('id');
    });

    it('re-resolves the resume target when the identity returns after a change, picking up the new status', () => {
        getSpy.mockReturnValue({ status: PendingTransactionStatus.PENDING });
        const { result, rerender } = renderHook(
            ({ id }: { id?: string }) => useManagedTransaction(id),
            { initialProps: { id: 'id' as string | undefined } },
        );
        expect(result.current.resumeTarget).toBe(TransactionDialogStep.APPROVE);

        // The id briefly drops (e.g. an auto-derived id while the wallet reconnects) and the action
        // is submitted in the meantime.
        rerender({ id: undefined });
        getSpy.mockReturnValue({
            status: PendingTransactionStatus.SUBMITTED,
            hash: '0x1',
        });

        // When the same id returns, the target must reflect the new status, not the stale one.
        rerender({ id: 'id' });
        expect(result.current.resumeTarget).toBe(TransactionDialogStep.CONFIRM);
    });

    it('drops the latched hash and resume target when reused for a different intent id', () => {
        usePendingTransactionMock.mockReturnValue({
            status: PendingTransactionStatus.SUBMITTED,
            hash: '0xold',
        });
        getSpy.mockReturnValue({
            status: PendingTransactionStatus.SUBMITTED,
            hash: '0xold',
        });
        const { result, rerender } = renderHook(
            ({ id }: { id?: string }) => useManagedTransaction(id),
            { initialProps: { id: 'id1' as string | undefined } },
        );
        expect(result.current.hash).toBe('0xold');
        expect(result.current.resumeTarget).toBe(TransactionDialogStep.CONFIRM);

        // A different action in the same hook instance with no record of its own: nothing carries over.
        usePendingTransactionMock.mockReturnValue(undefined);
        getSpy.mockReturnValue(undefined);
        rerender({ id: 'id2' });

        expect(result.current.hash).toBeUndefined();
        expect(result.current.resumeTarget).toBeUndefined();
    });

    it('keeps the latched hash across a transient id drop for the same action', () => {
        usePendingTransactionMock.mockReturnValue({
            status: PendingTransactionStatus.SUBMITTED,
            hash: '0xabc',
        });
        const { result, rerender } = renderHook(
            ({ id }: { id?: string }) => useManagedTransaction(id),
            { initialProps: { id: 'id1' as string | undefined } },
        );
        expect(result.current.hash).toBe('0xabc');

        // The id momentarily drops (auto-derived) and returns for the SAME action; the record may be
        // cleared by then, so the latch is the only hash source and must survive the round-trip.
        usePendingTransactionMock.mockReturnValue(undefined);
        rerender({ id: undefined });
        rerender({ id: 'id1' });

        expect(result.current.hash).toBe('0xabc');
    });

    it('maps the managed status to the approve-step state', () => {
        usePendingTransactionMock.mockReturnValue({
            status: PendingTransactionStatus.PENDING,
        });
        const { result } = renderHook(() => useManagedTransaction('id'));
        expect(result.current.approveState).toBe('pending');
    });

    it('exposes the hash and reports success once a hash exists', () => {
        usePendingTransactionMock.mockReturnValue({
            status: PendingTransactionStatus.SUBMITTED,
            hash: '0xabc',
        });
        const { result } = renderHook(() => useManagedTransaction('id'));
        expect(result.current.hash).toBe('0xabc');
        expect(result.current.approveState).toBe('success');
    });

    it('sends through the manager keyed by the intent id', () => {
        const { result } = renderHook(() => useManagedTransaction('id'));
        act(() => result.current.send(request));
        expect(sendSpy).toHaveBeenCalledWith('id', request);
    });

    it('resends the stored request for a resumed action and reports success', () => {
        getRequestSpy.mockReturnValue(request);
        const { result } = renderHook(() => useManagedTransaction('id'));
        let sent = false;
        act(() => {
            sent = result.current.resend();
        });
        expect(sent).toBe(true);
        expect(sendSpy).toHaveBeenCalledWith('id', request);
    });

    it('reports false and does nothing on resend when there is no stored request', () => {
        getRequestSpy.mockReturnValue(undefined);
        const { result } = renderHook(() => useManagedTransaction('id'));
        let sent = true;
        act(() => {
            sent = result.current.resend();
        });
        expect(sent).toBe(false);
        expect(sendSpy).not.toHaveBeenCalled();
    });

    it('forgets the latched hash on a new send, so a retry cannot advance on the old hash', () => {
        usePendingTransactionMock.mockReturnValue({
            status: PendingTransactionStatus.SUBMITTED,
            hash: '0xold',
        });
        const { result, rerender } = renderHook(() =>
            useManagedTransaction('id'),
        );
        expect(result.current.hash).toBe('0xold');

        // A retry: a new send, and the manager flips back to PENDING with no hash yet.
        usePendingTransactionMock.mockReturnValue({
            status: PendingTransactionStatus.PENDING,
        });
        act(() => result.current.send(request));
        rerender();

        expect(result.current.hash).toBeUndefined();
    });

    it('clears the record once the receipt confirms', () => {
        useReceiptSpy.mockReturnValue({
            status: 'success',
        } as Wagmi.UseWaitForTransactionReceiptReturnType);
        renderHook(() => useManagedTransaction('id'));
        expect(clearSpy).toHaveBeenCalledWith('id');
    });
});
