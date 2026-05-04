import { renderHook, waitFor } from '@testing-library/react';
import * as wagmiActions from 'wagmi/actions';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { useDelegateStatementCid } from './useDelegateStatementCid';

jest.mock('@/modules/application/constants/wagmi', () => ({
    wagmiConfig: { mocked: true },
}));

const TOKEN_A = '0x1111111111111111111111111111111111111111';
const TOKEN_B = '0x2222222222222222222222222222222222222222';
const TOKEN_C = '0x3333333333333333333333333333333333333333';
const ENS_NAME = 'whomst.eth';
const CID_A = 'bafyAaaa';
const CID_B = 'bafyBbbb';

describe('useDelegateStatementCid', () => {
    const getEnsTextSpy = jest.spyOn(wagmiActions, 'getEnsText');

    afterEach(() => {
        getEnsTextSpy.mockReset();
    });

    it('issues one getEnsText call per token (multicall batches them) and returns CID per address', async () => {
        getEnsTextSpy.mockImplementation((_config, args) => {
            if (args.key.startsWith('eth.0x1111')) {
                return Promise.resolve(CID_A);
            }
            if (args.key.startsWith('eth.0x2222')) {
                return Promise.resolve(CID_B);
            }
            return Promise.resolve(null);
        });

        const { result } = renderHook(
            () =>
                useDelegateStatementCid({
                    ensName: ENS_NAME,
                    network: Network.ETHEREUM_MAINNET,
                    tokenAddresses: [TOKEN_A, TOKEN_B, TOKEN_C],
                }),
            { wrapper: ReactQueryWrapper },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(getEnsTextSpy).toHaveBeenCalledTimes(3);
        expect(result.current.data).toEqual({
            [TOKEN_A.toLowerCase()]: CID_A,
            [TOKEN_B.toLowerCase()]: CID_B,
            [TOKEN_C.toLowerCase()]: null,
        });
    });

    it('returns null per token when getEnsText rejects rather than failing the whole query', async () => {
        getEnsTextSpy
            .mockResolvedValueOnce(CID_A)
            .mockRejectedValueOnce(new Error('rpc broken'));

        const { result } = renderHook(
            () =>
                useDelegateStatementCid({
                    ensName: ENS_NAME,
                    network: Network.ETHEREUM_MAINNET,
                    tokenAddresses: [TOKEN_A, TOKEN_B],
                }),
            { wrapper: ReactQueryWrapper },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({
            [TOKEN_A.toLowerCase()]: CID_A,
            [TOKEN_B.toLowerCase()]: null,
        });
    });

    it('skips the query entirely when ensName is null', () => {
        const { result } = renderHook(
            () =>
                useDelegateStatementCid({
                    ensName: null,
                    network: Network.ETHEREUM_MAINNET,
                    tokenAddresses: [TOKEN_A],
                }),
            { wrapper: ReactQueryWrapper },
        );

        expect(result.current.isPending).toBe(true);
        expect(result.current.fetchStatus).toBe('idle');
        expect(getEnsTextSpy).not.toHaveBeenCalled();
    });

    it('skips the query when tokenAddresses is empty', () => {
        const { result } = renderHook(
            () =>
                useDelegateStatementCid({
                    ensName: ENS_NAME,
                    network: Network.ETHEREUM_MAINNET,
                    tokenAddresses: [],
                }),
            { wrapper: ReactQueryWrapper },
        );

        expect(result.current.fetchStatus).toBe('idle');
        expect(getEnsTextSpy).not.toHaveBeenCalled();
    });
});
