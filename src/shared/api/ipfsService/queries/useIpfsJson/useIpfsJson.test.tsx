import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { useIpfsJson } from './useIpfsJson';

const CID = 'bafyTestCid';
const GATEWAY_URL = `https://aragon-1.mypinata.cloud/ipfs/${CID}`;

const mockFetchResponse = (body: unknown, ok = true, status = 200) => ({
    ok,
    status,
    statusText: ok ? 'OK' : 'Internal Server Error',
    json: async () => body,
});

const noRetryClient = () =>
    new QueryClient({ defaultOptions: { queries: { retry: false } } });

const noRetryWrapper = ({ children }: { children?: React.ReactNode }) => (
    <ReactQueryWrapper client={noRetryClient()}>{children}</ReactQueryWrapper>
);

describe('useIpfsJson', () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    afterEach(() => {
        fetchSpy.mockReset();
    });

    it('fetches the gateway URL for the given CID and returns parsed JSON', async () => {
        const payload = { hello: 'world' };
        fetchSpy.mockResolvedValue(
            mockFetchResponse(payload) as unknown as Response,
        );

        const { result } = renderHook(() => useIpfsJson({ cid: CID }), {
            wrapper: ReactQueryWrapper,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(fetchSpy).toHaveBeenCalledWith(GATEWAY_URL);
        expect(result.current.data).toEqual(payload);
    });

    it('strips the ipfs:// prefix when building the gateway URL', async () => {
        fetchSpy.mockResolvedValue(
            mockFetchResponse({ ok: true }) as unknown as Response,
        );

        renderHook(() => useIpfsJson({ cid: `ipfs://${CID}` }), {
            wrapper: ReactQueryWrapper,
        });

        await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith(GATEWAY_URL));
    });

    it('does not send an Authorization header (gateway reads are public)', async () => {
        fetchSpy.mockResolvedValue(
            mockFetchResponse({ ok: true }) as unknown as Response,
        );

        renderHook(() => useIpfsJson({ cid: CID }), {
            wrapper: ReactQueryWrapper,
        });

        await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
        const callArgs = fetchSpy.mock.calls[0];
        expect(callArgs.length).toBe(1);
    });

    it('rejects when the gateway response is not ok', async () => {
        fetchSpy.mockResolvedValue(
            mockFetchResponse(null, false, 502) as unknown as Response,
        );

        const { result } = renderHook(() => useIpfsJson({ cid: CID }), {
            wrapper: noRetryWrapper,
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toBeInstanceOf(Error);
    });

    it('rejects when the optional validator does not match the parsed JSON', async () => {
        fetchSpy.mockResolvedValue(
            mockFetchResponse({ unexpected: true }) as unknown as Response,
        );

        const isString = (value: unknown): value is string =>
            typeof value === 'string';

        const { result } = renderHook(
            () => useIpfsJson({ cid: CID, validate: isString }),
            { wrapper: noRetryWrapper },
        );

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect((result.current.error as Error | null)?.message).toMatch(
            /did not match the expected shape/,
        );
    });

    it('skips the query entirely when cid is null', () => {
        const { result } = renderHook(() => useIpfsJson({ cid: null }), {
            wrapper: ReactQueryWrapper,
        });

        expect(result.current.fetchStatus).toBe('idle');
        expect(fetchSpy).not.toHaveBeenCalled();
    });
});
