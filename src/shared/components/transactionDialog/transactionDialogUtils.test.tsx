import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import type { UseQueryReturnType } from 'wagmi/query';
import { transactionDialogUtils } from './transactionDialogUtils';

describe('transactionDialog utils', () => {
    describe('queryToStepState', () => {
        it('returns pending when query status is pending and fetch status is fetching', () => {
            expect(transactionDialogUtils.queryToStepState('pending', 'fetching')).toEqual('pending');
        });

        it('returns idle when query status is pending but fetch status is idle', () => {
            expect(transactionDialogUtils.queryToStepState('pending', 'idle')).toEqual('idle');
        });

        it.each([{ queryStatus: 'success' }, { queryStatus: 'error' }])(
            'returns $queryStatus when query status is $queryStatus',
            ({ queryStatus }) => {
                const result = transactionDialogUtils.queryToStepState(
                    queryStatus as UseQueryReturnType['status'],
                    'idle',
                );
                expect(result).toEqual(queryStatus);
            },
        );
    });

    describe('shouldIgnoreError', () => {
        it('returns false when error is not an instance of Error class', () => {
            expect(transactionDialogUtils['shouldIgnoreError']('test')).toBeFalsy();
        });

        it('returns false when error does not match any of the ignore error list', () => {
            expect(transactionDialogUtils['shouldIgnoreError']('unknown-error')).toBeFalsy();
        });

        it('returns true when error matches one of the ignore error list', () => {
            const error = new Error('User rejected the request. stack: "Error: [...]');
            expect(transactionDialogUtils['shouldIgnoreError'](error)).toBeTruthy();
        });
    });

    describe('monitorTransactionError', () => {
        const logErrorSpy = jest.spyOn(monitoringUtils, 'logError');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shouldIgnoreErrorSpy = jest.spyOn(transactionDialogUtils as any, 'shouldIgnoreError');

        afterEach(() => {
            logErrorSpy.mockReset();
            shouldIgnoreErrorSpy.mockReset();
        });

        it('does not monitor the error when error should be ignored', () => {
            shouldIgnoreErrorSpy.mockReturnValue(true);
            transactionDialogUtils.monitorTransactionError('error');
            expect(logErrorSpy).not.toHaveBeenCalled();
        });

        it('monitors the error and passes the eventual error context when error should not be ignored', () => {
            shouldIgnoreErrorSpy.mockReturnValue(false);
            const error = new Error('test-error');
            const context = { transactionId: 123 };
            transactionDialogUtils.monitorTransactionError(error, context);
            expect(logErrorSpy).toHaveBeenCalledWith(error, { context });
        });
    });
});
