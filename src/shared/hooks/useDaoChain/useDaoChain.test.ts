import * as DaoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateDao, generateReactQueryResultLoading, generateReactQueryResultSuccess } from '@/shared/testUtils';
import * as GovUiKit from '@aragon/gov-ui-kit';
import { ChainEntityType } from '@aragon/gov-ui-kit';
import { renderHook } from '@testing-library/react';
import { useDaoChain } from './useDaoChain';

type BuildEntityUrlParams = Parameters<ReturnType<typeof GovUiKit.useBlockExplorer>['buildEntityUrl']>[0];

describe('useDaoChain hook', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const useBlockExplorerSpy = jest.spyOn(GovUiKit, 'useBlockExplorer');

    const mockChainEntityUrl = jest.fn(({ type, id }: BuildEntityUrlParams) => {
        return `https://etherscan.io/${type}/${id ?? ''}`;
    });

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useBlockExplorerSpy.mockReturnValue({
            buildEntityUrl: mockChainEntityUrl,
            getBlockExplorer: jest.fn(),
        } as ReturnType<typeof GovUiKit.useBlockExplorer>);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useBlockExplorerSpy.mockReset();
        mockChainEntityUrl.mockClear();
    });

    describe('with daoId', () => {
        it('fetches DAO and derives chainId from network', () => {
            const mockDao = generateDao({ network: Network.ETHEREUM_MAINNET });
            useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockDao }));

            const { result } = renderHook(() => useDaoChain({ daoId: 'dao-test' }));

            expect(useDaoSpy).toHaveBeenCalledWith({ urlParams: { id: 'dao-test' } }, { enabled: true });
            expect(result.current.chainId).toBe(networkDefinitions[Network.ETHEREUM_MAINNET].id);
            expect(result.current.network).toBe(Network.ETHEREUM_MAINNET);
            expect(result.current.buildEntityUrl).toEqual(expect.any(Function));
            expect(result.current.isLoading).toBe(false);
        });

        it('returns undefined chainId when DAO is not loaded yet', () => {
            useDaoSpy.mockReturnValue(generateReactQueryResultLoading() as ReturnType<typeof DaoService.useDao>);

            const { result } = renderHook(() => useDaoChain({ daoId: 'dao-missing' }));

            expect(result.current.chainId).toBeUndefined();
            expect(result.current.network).toBeUndefined();
            expect(result.current.isLoading).toBe(true);
        });
    });

    describe('with network', () => {
        it('derives chainId from network without fetching DAO', () => {
            const { result } = renderHook(() => useDaoChain({ network: Network.POLYGON_MAINNET }));

            expect(useDaoSpy).toHaveBeenCalledWith({ urlParams: { id: '' } }, { enabled: false });
            expect(result.current.chainId).toBe(networkDefinitions[Network.POLYGON_MAINNET].id);
            expect(result.current.network).toBe(Network.POLYGON_MAINNET);
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('with chainId', () => {
        it('uses provided chainId without fetching DAO', () => {
            const { result } = renderHook(() => useDaoChain({ chainId: 42161 }));

            expect(useDaoSpy).toHaveBeenCalledWith({ urlParams: { id: '' } }, { enabled: false });
            expect(result.current.chainId).toBe(42161);
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('priority resolution', () => {
        it('prioritizes chainId over network', () => {
            const { result } = renderHook(() =>
                useDaoChain({
                    chainId: 42161,
                    network: Network.ETHEREUM_MAINNET,
                }),
            );

            expect(result.current.chainId).toBe(42161);
            expect(result.current.network).toBe(Network.ETHEREUM_MAINNET);
        });

        it('prioritizes network over daoId', () => {
            const { result } = renderHook(() =>
                useDaoChain({
                    daoId: 'dao-test',
                    network: Network.POLYGON_MAINNET,
                }),
            );

            expect(useDaoSpy).toHaveBeenCalledWith({ urlParams: { id: 'dao-test' } }, { enabled: false });
            expect(result.current.chainId).toBe(networkDefinitions[Network.POLYGON_MAINNET].id);
            expect(result.current.network).toBe(Network.POLYGON_MAINNET);
        });
    });

    describe('buildEntityUrl', () => {
        it('returns a function that builds explorer URLs', () => {
            useBlockExplorerSpy.mockReturnValue({
                buildEntityUrl: mockChainEntityUrl,
                getBlockExplorer: jest.fn(),
            } as ReturnType<typeof GovUiKit.useBlockExplorer>);

            const { result } = renderHook(() => useDaoChain({ network: Network.ETHEREUM_MAINNET }));

            const url = result.current.buildEntityUrl({
                type: ChainEntityType.ADDRESS,
                id: '0x1234567890123456789012345678901234567890',
            });

            expect(mockChainEntityUrl).toHaveBeenCalledWith({
                type: ChainEntityType.ADDRESS,
                id: '0x1234567890123456789012345678901234567890',
            });
            expect(url).toBe('https://etherscan.io/address/0x1234567890123456789012345678901234567890');
        });
    });
});
