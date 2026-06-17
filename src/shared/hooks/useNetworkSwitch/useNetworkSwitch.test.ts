import { renderHook } from '@testing-library/react';
import * as Wagmi from 'wagmi';
import * as WalletAccount from '@/modules/application/hooks/useWalletAccount';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useNetworkSwitch } from './useNetworkSwitch';

describe('useNetworkSwitch hook', () => {
    const useSwitchChainSpy = jest.spyOn(Wagmi, 'useSwitchChain');
    const useWalletAccountSpy = jest.spyOn(WalletAccount, 'useWalletAccount');

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
    });

    afterEach(() => {
        useSwitchChainSpy.mockReset();
        useWalletAccountSpy.mockReset();
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

        it('calls onSend directly when wallet chain is undefined', () => {
            useWalletAccountSpy.mockReturnValue({
                address: undefined,
                chainId: undefined,
                isReconnecting: false,
            });

            const { result } = renderHook(() =>
                useNetworkSwitch({ network: Network.ETHEREUM_MAINNET }),
            );

            const onSend = jest.fn();
            result.current.withNetworkSwitch(onSend);

            expect(switchChainMutate).not.toHaveBeenCalled();
            expect(onSend).toHaveBeenCalledTimes(1);
        });

        it('calls switchChain with onSuccess when chains differ', () => {
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

    describe('requiredChainId', () => {
        it('returns the chain id resolved from the network', () => {
            const { result } = renderHook(() =>
                useNetworkSwitch({ network: Network.ETHEREUM_MAINNET }),
            );

            expect(result.current.requiredChainId).toBe(ethereumChainId);
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
});
