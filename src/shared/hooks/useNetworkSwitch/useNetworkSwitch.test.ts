import { renderHook } from '@testing-library/react';
import * as Wagmi from 'wagmi';
import * as WalletAccount from '@/modules/application/hooks/useWalletAccount';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import * as DaoChain from '@/shared/hooks/useDaoChain';
import { useNetworkSwitch } from './useNetworkSwitch';

describe('useNetworkSwitch hook', () => {
    const useSwitchChainSpy = jest.spyOn(Wagmi, 'useSwitchChain');
    const useWalletAccountSpy = jest.spyOn(WalletAccount, 'useWalletAccount');
    const useDaoChainSpy = jest.spyOn(DaoChain, 'useDaoChain');

    const switchChainMutate = jest.fn();

    const ethereumChainId = networkDefinitions[Network.ETHEREUM_MAINNET].id;
    const polygonChainId = networkDefinitions[Network.POLYGON_MAINNET].id;

    beforeEach(() => {
        useSwitchChainSpy.mockReturnValue({
            mutate: switchChainMutate,
            status: 'idle',
        } as unknown as Wagmi.UseSwitchChainReturnType);

        useWalletAccountSpy.mockReturnValue({
            address: '0x123',
            chainId: ethereumChainId,
            isReconnecting: false,
        });

        useDaoChainSpy.mockReturnValue({
            chainId: ethereumChainId,
            network: Network.ETHEREUM_MAINNET,
            networkDefinition: networkDefinitions[Network.ETHEREUM_MAINNET],
            buildEntityUrl: jest.fn(),
            isLoading: false,
        });
    });

    afterEach(() => {
        useSwitchChainSpy.mockReset();
        useWalletAccountSpy.mockReset();
        useDaoChainSpy.mockReset();
        switchChainMutate.mockReset();
    });

    describe('isCrossNetworkTransaction', () => {
        it('returns false when wallet chain matches required chain', () => {
            const { result } = renderHook(() =>
                useNetworkSwitch({ network: Network.ETHEREUM_MAINNET }),
            );

            expect(result.current.isCrossNetworkTransaction).toBe(false);
        });

        it('returns true when wallet chain differs from required chain', () => {
            useDaoChainSpy.mockReturnValue({
                chainId: polygonChainId,
                network: Network.POLYGON_MAINNET,
                networkDefinition: networkDefinitions[Network.POLYGON_MAINNET],
                buildEntityUrl: jest.fn(),
                isLoading: false,
            });

            const { result } = renderHook(() =>
                useNetworkSwitch({ network: Network.POLYGON_MAINNET }),
            );

            expect(result.current.isCrossNetworkTransaction).toBe(true);
        });

        it('returns false when wallet chain is undefined', () => {
            useWalletAccountSpy.mockReturnValue({
                address: undefined,
                chainId: undefined,
                isReconnecting: false,
            });

            const { result } = renderHook(() =>
                useNetworkSwitch({ network: Network.ETHEREUM_MAINNET }),
            );

            expect(result.current.isCrossNetworkTransaction).toBe(false);
        });

        it('returns false when required chain is undefined', () => {
            useDaoChainSpy.mockReturnValue({
                chainId: undefined,
                network: undefined,
                networkDefinition: undefined,
                buildEntityUrl: jest.fn(),
                isLoading: true,
            });

            const { result } = renderHook(() =>
                useNetworkSwitch({ daoId: 'loading-dao' }),
            );

            expect(result.current.isCrossNetworkTransaction).toBe(false);
        });
    });

    describe('networkName', () => {
        it('returns the network definition name', () => {
            const { result } = renderHook(() =>
                useNetworkSwitch({ network: Network.ETHEREUM_MAINNET }),
            );

            expect(result.current.networkName).toBe(
                networkDefinitions[Network.ETHEREUM_MAINNET].name,
            );
        });

        it('returns undefined when network definition is unavailable', () => {
            useDaoChainSpy.mockReturnValue({
                chainId: undefined,
                network: undefined,
                networkDefinition: undefined,
                buildEntityUrl: jest.fn(),
                isLoading: true,
            });

            const { result } = renderHook(() =>
                useNetworkSwitch({ daoId: 'loading-dao' }),
            );

            expect(result.current.networkName).toBeUndefined();
        });
    });

    describe('withNetworkSwitch', () => {
        it('calls onSend directly when chains match', () => {
            const { result } = renderHook(() =>
                useNetworkSwitch({ network: Network.ETHEREUM_MAINNET }),
            );

            const onSend = jest.fn();
            result.current.withNetworkSwitch(onSend);

            expect(switchChainMutate).not.toHaveBeenCalled();
            expect(onSend).toHaveBeenCalledTimes(1);
        });

        it('calls switchChain with onSuccess when chains differ', () => {
            useDaoChainSpy.mockReturnValue({
                chainId: polygonChainId,
                network: Network.POLYGON_MAINNET,
                networkDefinition: networkDefinitions[Network.POLYGON_MAINNET],
                buildEntityUrl: jest.fn(),
                isLoading: false,
            });

            const { result } = renderHook(() =>
                useNetworkSwitch({ network: Network.POLYGON_MAINNET }),
            );

            const onSend = jest.fn();
            result.current.withNetworkSwitch(onSend);

            expect(switchChainMutate).toHaveBeenCalledWith(
                { chainId: polygonChainId },
                { onSuccess: onSend },
            );
            expect(onSend).not.toHaveBeenCalled();
        });
    });

    describe('switchChainStatus', () => {
        it('reflects the wagmi mutation status', () => {
            useSwitchChainSpy.mockReturnValue({
                mutate: switchChainMutate,
                status: 'pending',
            } as unknown as Wagmi.UseSwitchChainReturnType);

            const { result } = renderHook(() =>
                useNetworkSwitch({ network: Network.ETHEREUM_MAINNET }),
            );

            expect(result.current.switchChainStatus).toBe('pending');
        });
    });

    describe('isLoading', () => {
        it('returns true when resolving chain via daoId and DAO is loading', () => {
            useDaoChainSpy.mockReturnValue({
                chainId: undefined,
                network: undefined,
                networkDefinition: undefined,
                buildEntityUrl: jest.fn(),
                isLoading: true,
            });

            const { result } = renderHook(() =>
                useNetworkSwitch({ daoId: 'loading-dao' }),
            );

            expect(result.current.isLoading).toBe(true);
        });

        it('returns false when network is provided directly', () => {
            const { result } = renderHook(() =>
                useNetworkSwitch({ network: Network.ETHEREUM_MAINNET }),
            );

            expect(result.current.isLoading).toBe(false);
        });
    });
});
