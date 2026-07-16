import { renderHook } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
import { useSupportAppContext } from './useSupportAppContext';

describe('useSupportAppContext hook', () => {
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');
    const useParamsSpy = jest.spyOn(NextNavigation, 'useParams');
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountModule,
        'useWalletAccount',
    );

    beforeEach(() => {
        usePathnameSpy.mockReturnValue('/');
        useParamsSpy.mockReturnValue({});
        useWalletAccountSpy.mockReturnValue({
            address: undefined,
            chainId: undefined,
            isReconnecting: false,
        } as ReturnType<typeof useWalletAccountModule.useWalletAccount>);
    });

    afterEach(() => {
        usePathnameSpy.mockReset();
        useParamsSpy.mockReset();
        useWalletAccountSpy.mockReset();
    });

    it('returns the current route and application version', () => {
        usePathnameSpy.mockReturnValue('/create/dao');
        const { result } = renderHook(() => useSupportAppContext());
        expect(result.current.route).toEqual('/create/dao');
        expect(result.current.appVersion).toEqual(
            process.env.version ?? 'unknown',
        );
        expect(result.current.daoAddress).toBeUndefined();
        expect(result.current.network).toBeUndefined();
        expect(result.current.walletAddress).toBeUndefined();
    });

    it('includes the DAO route params when set', () => {
        useParamsSpy.mockReturnValue({
            addressOrEns: '0x123',
            network: 'ethereum-mainnet',
        });
        const { result } = renderHook(() => useSupportAppContext());
        expect(result.current.daoAddress).toEqual('0x123');
        expect(result.current.network).toEqual('ethereum-mainnet');
    });

    it('includes the connected wallet address when available', () => {
        useWalletAccountSpy.mockReturnValue({
            address: '0xabc',
            chainId: 1,
            isReconnecting: false,
        } as unknown as ReturnType<
            typeof useWalletAccountModule.useWalletAccount
        >);
        const { result } = renderHook(() => useSupportAppContext());
        expect(result.current.walletAddress).toEqual('0xabc');
    });
});
