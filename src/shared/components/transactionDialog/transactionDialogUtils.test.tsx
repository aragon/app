import type { UseQueryReturnType } from 'wagmi/query';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { transactionDialogUtils } from './transactionDialogUtils';

describe('transactionDialog utils', () => {
    describe('queryToStepState', () => {
        it('returns pending when query status is pending and fetch status is fetching', () => {
            expect(
                transactionDialogUtils.queryToStepState('pending', 'fetching'),
            ).toEqual('pending');
        });

        it('returns idle when query status is pending but fetch status is idle', () => {
            expect(
                transactionDialogUtils.queryToStepState('pending', 'idle'),
            ).toEqual('idle');
        });

        it.each([
            { queryStatus: 'success' },
            { queryStatus: 'error' },
        ])('returns $queryStatus when query status is $queryStatus', ({
            queryStatus,
        }) => {
            const result = transactionDialogUtils.queryToStepState(
                queryStatus as UseQueryReturnType['status'],
                'idle',
            );
            expect(result).toEqual(queryStatus);
        });
    });

    describe('monitorTransactionError', () => {
        const logErrorSpy = jest.spyOn(monitoringUtils, 'logError');

        afterEach(() => {
            logErrorSpy.mockReset();
        });

        it('reports the error with the eventual error context', () => {
            const error = new Error('test-error');
            const context = { transactionId: 123 };
            transactionDialogUtils.monitorTransactionError(error, context);
            expect(logErrorSpy).toHaveBeenCalledWith(error, { context });
        });

        it('still reports expected wallet errors (kept for investigation, tagged by beforeSend)', () => {
            const error = new Error('User rejected the request');
            transactionDialogUtils.monitorTransactionError(error);
            expect(logErrorSpy).toHaveBeenCalledWith(error, {
                context: undefined,
            });
        });
    });
});
