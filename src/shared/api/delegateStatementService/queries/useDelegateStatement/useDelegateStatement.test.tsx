import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { delegateStatementService } from '../../delegateStatementService';
import { useDelegateStatement } from './useDelegateStatement';

const CID = 'bafyTestCid';

const STATEMENT = {
    version: 1,
    type: 'statement',
    format: 'markdown',
    content: 'I will vote for long-term protocol health.',
} as const;

const noRetryClient = () =>
    new QueryClient({ defaultOptions: { queries: { retry: false } } });

const noRetryWrapper = ({ children }: { children?: React.ReactNode }) => (
    <ReactQueryWrapper client={noRetryClient()}>{children}</ReactQueryWrapper>
);

describe('useDelegateStatement query', () => {
    const getDelegateStatementSpy = jest.spyOn(
        delegateStatementService,
        'getDelegateStatement',
    );

    afterEach(() => {
        getDelegateStatementSpy.mockReset();
    });

    it('fetches the statement for the given CID', async () => {
        getDelegateStatementSpy.mockResolvedValue(STATEMENT);
        const { result } = renderHook(
            () => useDelegateStatement({ cid: CID }),
            {
                wrapper: ReactQueryWrapper,
            },
        );
        await waitFor(() => expect(result.current.data).toEqual(STATEMENT));
        expect(getDelegateStatementSpy).toHaveBeenCalledWith({
            urlParams: { cid: CID },
        });
    });

    it('skips the query when caller passes enabled false', () => {
        const { result } = renderHook(
            () => useDelegateStatement({ cid: '' }, { enabled: false }),
            { wrapper: ReactQueryWrapper },
        );
        expect(result.current.fetchStatus).toBe('idle');
        expect(getDelegateStatementSpy).not.toHaveBeenCalled();
    });

    it('strips an ipfs:// prefix before calling the service so the BE-204 endpoint receives a bare CID', async () => {
        getDelegateStatementSpy.mockResolvedValue(STATEMENT);
        const { result } = renderHook(
            () => useDelegateStatement({ cid: `ipfs://${CID}` }),
            { wrapper: ReactQueryWrapper },
        );
        await waitFor(() => expect(result.current.data).toEqual(STATEMENT));
        expect(getDelegateStatementSpy).toHaveBeenCalledWith({
            urlParams: { cid: CID },
        });
    });

    it('propagates the error when the service rejects', async () => {
        getDelegateStatementSpy.mockRejectedValue(new Error('boom'));
        const { result } = renderHook(
            () => useDelegateStatement({ cid: CID }),
            { wrapper: noRetryWrapper },
        );
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect((result.current.error as Error | null)?.message).toBe('boom');
    });
});
