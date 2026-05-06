import { renderHook, waitFor } from '@testing-library/react';
import * as wagmiActions from 'wagmi/actions';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { useDelegateStatementCid } from './useDelegateStatementCid';

jest.mock('@/modules/application/constants/wagmi', () => ({
    wagmiConfig: { mocked: true },
}));

const TOKEN_ADDRESS = '0x1111111111111111111111111111111111111111';
const ENS_NAME = 'whomst.eth';
const CID = 'bafyTestCid';

describe('useDelegateStatementCid', () => {
    const getEnsTextSpy = jest.spyOn(wagmiActions, 'getEnsText');

    afterEach(() => {
        getEnsTextSpy.mockReset();
    });

    it('resolves to the CID stored on the ENS text record', async () => {
        getEnsTextSpy.mockResolvedValue(CID);

        const { result } = renderHook(
            () =>
                useDelegateStatementCid({
                    ensName: ENS_NAME,
                    network: Network.ETHEREUM_MAINNET,
                    tokenAddress: TOKEN_ADDRESS,
                }),
            { wrapper: ReactQueryWrapper },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toBe(CID);
        expect(getEnsTextSpy).toHaveBeenCalledTimes(1);
    });

    it('returns null when the text record is absent', async () => {
        getEnsTextSpy.mockResolvedValue(null);

        const { result } = renderHook(
            () =>
                useDelegateStatementCid({
                    ensName: ENS_NAME,
                    network: Network.ETHEREUM_MAINNET,
                    tokenAddress: TOKEN_ADDRESS,
                }),
            { wrapper: ReactQueryWrapper },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toBeNull();
    });

    it('skips the query entirely when ensName is null', () => {
        const { result } = renderHook(
            () =>
                useDelegateStatementCid({
                    ensName: null,
                    network: Network.ETHEREUM_MAINNET,
                    tokenAddress: TOKEN_ADDRESS,
                }),
            { wrapper: ReactQueryWrapper },
        );

        expect(result.current.fetchStatus).toBe('idle');
        expect(getEnsTextSpy).not.toHaveBeenCalled();
    });

    it('skips the query when network is undefined (DAO still loading)', () => {
        const { result } = renderHook(
            () =>
                useDelegateStatementCid({
                    ensName: ENS_NAME,
                    network: undefined,
                    tokenAddress: TOKEN_ADDRESS,
                }),
            { wrapper: ReactQueryWrapper },
        );

        expect(result.current.fetchStatus).toBe('idle');
        expect(getEnsTextSpy).not.toHaveBeenCalled();
    });
});
