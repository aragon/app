import { renderHook } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import * as UseConnectedWalletGuard from '@/modules/application/hooks/useConnectedWalletGuard';
import * as UseWalletAccount from '@/modules/application/hooks/useWalletAccount';
import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import * as UseDaoExecutePermission from '@/shared/hooks/useDaoExecutePermission';
import {
    generateDao,
    generateReactQueryResultSuccess,
    generateReactQueryResultSuccessWithData,
} from '@/shared/testUtils';
import { useExecutePermissionCheckGuard } from './useExecutePermissionCheckGuard';

describe('useExecutePermissionCheckGuard hook', () => {
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useWalletAccountSpy = jest.spyOn(
        UseWalletAccount,
        'useWalletAccount',
    );
    const useConnectedWalletGuardSpy = jest.spyOn(
        UseConnectedWalletGuard,
        'useConnectedWalletGuard',
    );
    const useDaoExecutePermissionSpy = jest.spyOn(
        UseDaoExecutePermission,
        'useDaoExecutePermission',
    );

    const mockRouter = { push: jest.fn() };

    beforeEach(() => {
        useRouterSpy.mockReturnValue(
            mockRouter as unknown as AppRouterInstance,
        );
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        useWalletAccountSpy.mockReturnValue({
            address: '0xabc',
            chainId: 1,
            isReconnecting: false,
        });
        useConnectedWalletGuardSpy.mockReturnValue({
            check: jest.fn(),
            result: true,
        });
        useDaoExecutePermissionSpy.mockReturnValue({
            hasPermission: true,
            isLoading: false,
        });
    });

    afterEach(() => {
        useRouterSpy.mockReset();
        useDaoSpy.mockReset();
        useWalletAccountSpy.mockReset();
        useConnectedWalletGuardSpy.mockReset();
        useDaoExecutePermissionSpy.mockReset();
        mockRouter.push.mockReset();
    });

    it('prompts to connect the wallet when disconnected', () => {
        const check = jest.fn();
        useConnectedWalletGuardSpy.mockReturnValue({ check, result: false });

        renderHook(() => useExecutePermissionCheckGuard({ daoId: 'dao-id' }));

        expect(check).toHaveBeenCalled();
        expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('redirects to the transactions page when connected but not permitted', () => {
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const daoAddress = '0x12345';
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateDao({ address: daoAddress, network: daoNetwork }),
            }),
        );
        useConnectedWalletGuardSpy.mockReturnValue({
            check: jest.fn(),
            result: true,
        });
        useDaoExecutePermissionSpy.mockReturnValue({
            hasPermission: false,
            isLoading: false,
        });

        renderHook(() => useExecutePermissionCheckGuard({ daoId: 'dao-id' }));

        expect(mockRouter.push).toHaveBeenCalledWith(
            `/dao/${daoNetwork}/${daoAddress}/transactions`,
        );
    });

    it('does not redirect while the permission check is loading', () => {
        useDaoExecutePermissionSpy.mockReturnValue({
            hasPermission: false,
            isLoading: true,
        });

        renderHook(() => useExecutePermissionCheckGuard({ daoId: 'dao-id' }));

        expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('does not redirect when connected and permitted', () => {
        renderHook(() => useExecutePermissionCheckGuard({ daoId: 'dao-id' }));

        expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('does not redirect when connected but the DAO has not loaded yet', () => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccessWithData(
                undefined,
            ) as unknown as ReturnType<typeof daoService.useDao>,
        );
        useDaoExecutePermissionSpy.mockReturnValue({
            hasPermission: false,
            isLoading: false,
        });

        renderHook(() => useExecutePermissionCheckGuard({ daoId: 'dao-id' }));

        expect(mockRouter.push).not.toHaveBeenCalled();
    });
});
