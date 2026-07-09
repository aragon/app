import { act, renderHook } from '@testing-library/react';
import * as wagmiActions from 'wagmi/actions';
import {
    PendingTransactionStatus,
    pendingTransactionManager,
} from '@/shared/utils/pendingTransactionManager';
import { usePendingTransaction } from './usePendingTransaction';

jest.mock('@/modules/application/constants/wagmi', () => ({ wagmiConfig: {} }));

const request = {
    to: '0xabc',
    data: '0x',
    value: BigInt(0),
    chainId: 1,
} as unknown as Parameters<typeof pendingTransactionManager.send>[1];

describe('usePendingTransaction', () => {
    const sendTransactionSpy = jest.spyOn(wagmiActions, 'sendTransaction');

    afterEach(() => {
        pendingTransactionManager.clear('hook-id');
        sendTransactionSpy.mockReset();
    });

    it('returns undefined when no intentId is provided', () => {
        const { result } = renderHook(() => usePendingTransaction(undefined));
        expect(result.current).toBeUndefined();
    });

    it('reflects the manager state for its intentId and re-renders on change', () => {
        sendTransactionSpy.mockReturnValue(new Promise(() => undefined));
        const { result } = renderHook(() => usePendingTransaction('hook-id'));
        expect(result.current).toBeUndefined();

        act(() => pendingTransactionManager.send('hook-id', request));
        expect(result.current?.status).toBe(PendingTransactionStatus.PENDING);

        act(() => pendingTransactionManager.clear('hook-id'));
        expect(result.current).toBeUndefined();
    });
});
