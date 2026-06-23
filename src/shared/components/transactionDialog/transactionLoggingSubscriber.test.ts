import { PendingTransactionStatus } from '@/shared/utils/pendingTransactionManager';
import { transactionDialogUtils } from './transactionDialogUtils';
import { createTransactionLogger } from './transactionLoggingSubscriber';

jest.mock('@/modules/application/constants/wagmi', () => ({ wagmiConfig: {} }));

describe('transactionLoggingSubscriber', () => {
    const monitorSpy = jest
        .spyOn(transactionDialogUtils, 'monitorTransactionError')
        .mockImplementation(() => undefined);

    afterEach(() => {
        monitorSpy.mockClear();
    });

    it('logs a FAILED transition once, with the intent id', () => {
        const log = createTransactionLogger();
        const error = new Error('boom');

        log('id', { status: PendingTransactionStatus.FAILED, error });
        log('id', { status: PendingTransactionStatus.FAILED, error });

        expect(monitorSpy).toHaveBeenCalledTimes(1);
        expect(monitorSpy).toHaveBeenCalledWith(error, { intentId: 'id' });
    });

    it('logs again after a non-failed transition (a retry)', () => {
        const log = createTransactionLogger();

        log('id', {
            status: PendingTransactionStatus.FAILED,
            error: new Error('a'),
        });
        log('id', { status: PendingTransactionStatus.PENDING });
        log('id', {
            status: PendingTransactionStatus.FAILED,
            error: new Error('b'),
        });

        expect(monitorSpy).toHaveBeenCalledTimes(2);
    });

    it('does not log non-failed transitions or a clear', () => {
        const log = createTransactionLogger();

        log('id', { status: PendingTransactionStatus.SUBMITTED, hash: '0x1' });
        log('id', undefined);

        expect(monitorSpy).not.toHaveBeenCalled();
    });
});
