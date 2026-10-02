import { renderHook } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import * as UseDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import * as UsePermissionCheckGuard from '../usePermissionCheckGuard';
import { useProposalPermissionCheckGuard } from './useProposalPermissionCheckGuard';

describe('useProposalPermissionCheckGuard hook', () => {
    const usePermissionCheckGuardSpy = jest.spyOn(
        UsePermissionCheckGuard,
        'usePermissionCheckGuard',
    );
    const useDaoPluginsSpy = jest.spyOn(UseDaoPlugins, 'useDaoPlugins');
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useWalletAccountSpy = jest.spyOn(
        walletAccountApi,
        'useWalletAccount',
    );

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: '0x1111111111111111111111111111111111111111',
            chainId: 1,
            isConnecting: false,
            isReconnecting: false,
        });
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
    });

    afterEach(() => {
        usePermissionCheckGuardSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        useRouterSpy.mockReset();
        useDaoSpy.mockReset();
        useWalletAccountSpy.mockReset();
    });

    it('calls createProposalGuard when canCreateProposal check returns false', () => {
        const checkCreateProposalGuard = jest.fn();
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: generateDaoPlugin() }),
        ]);
        usePermissionCheckGuardSpy.mockReturnValue({
            result: false,
            check: checkCreateProposalGuard,
        });

        renderHook(() =>
            useProposalPermissionCheckGuard({ daoId: '', pluginAddress: '' }),
        );
        expect(checkCreateProposalGuard).toHaveBeenCalled();
    });

    it('does not call createProposalGuard when canCreateProposal check returns true', () => {
        const checkCreateProposalGuard = jest.fn();
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: generateDaoPlugin() }),
        ]);
        usePermissionCheckGuardSpy.mockReturnValue({
            result: true,
            check: checkCreateProposalGuard,
        });

        renderHook(() =>
            useProposalPermissionCheckGuard({
                daoId: 'dao-id',
                pluginAddress: 'plugin-address',
            }),
        );
        expect(checkCreateProposalGuard).not.toHaveBeenCalled();
    });

    it('redirects to the specified tab when permission check fails', () => {
        const daoId = 'dao-id';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const daoAddress = '0x12345';
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateDao({ address: daoAddress, network: daoNetwork }),
            }),
        );
        const pluginAddress = 'plugin-address';
        const redirectTab = 'settings';
        const checkCreateProposalGuard = jest.fn();

        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: generateDaoPlugin() }),
        ]);
        usePermissionCheckGuardSpy.mockReturnValue({
            result: false,
            check: checkCreateProposalGuard,
        });
        const mockRouter = { push: jest.fn() };
        useRouterSpy.mockReturnValue(
            mockRouter as unknown as AppRouterInstance,
        );

        renderHook(() =>
            useProposalPermissionCheckGuard({
                daoId,
                pluginAddress,
                redirectTab,
            }),
        );

        // simulate failed permission check
        usePermissionCheckGuardSpy.mock.calls[0][0].onError!();
        expect(mockRouter.push).toHaveBeenCalledWith(
            `/dao/${daoNetwork}/${daoAddress}/${redirectTab}`,
        );
    });

    it('calls createProposalGuard only once even when component re-renders with canCreateProposal false', () => {
        const checkCreateProposalGuard = jest.fn();
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: generateDaoPlugin() }),
        ]);

        usePermissionCheckGuardSpy.mockImplementation(() => {
            // return new references so that useEffect is triggered to simulate the issue in the real environment
            return {
                result: false,
                check: jest.fn(() => checkCreateProposalGuard()),
            };
        });

        // Mock useDao to return a new dao object on each call to simulate the issue
        useDaoSpy.mockImplementation(() =>
            generateReactQueryResultSuccess({
                data: generateDao(),
            }),
        );

        const { rerender } = renderHook(() =>
            useProposalPermissionCheckGuard({ daoId: '', pluginAddress: '' }),
        );

        expect(checkCreateProposalGuard).toHaveBeenCalledTimes(1);

        // Re-render the component multiple times
        // Each re-render will get a new dao object from useDao and new createProposalGuard
        rerender();
        rerender();
        rerender();

        // Without the fix, guard would be called 4 times
        // With the fix, it should only be called once
        expect(checkCreateProposalGuard).toHaveBeenCalledTimes(1);
    });

    it('runs the creation guard once after it is subsequently enabled', () => {
        const checkCreateProposalGuard = jest.fn();
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: generateDaoPlugin() }),
        ]);
        usePermissionCheckGuardSpy.mockImplementation(() => ({
            result: false,
            check: jest.fn(() => checkCreateProposalGuard()),
        }));

        const { rerender } = renderHook(
            ({ enabled }) =>
                useProposalPermissionCheckGuard({
                    daoId: '',
                    pluginAddress: '',
                    enabled,
                }),
            { initialProps: { enabled: false } },
        );
        expect(checkCreateProposalGuard).not.toHaveBeenCalled();

        rerender({ enabled: true });
        rerender({ enabled: true });

        expect(checkCreateProposalGuard).toHaveBeenCalledTimes(1);
    });
    it('reruns the creation guard when the connected wallet changes', () => {
        const checkCreateProposalGuard = jest.fn();
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: generateDaoPlugin() }),
        ]);
        usePermissionCheckGuardSpy.mockImplementation(() => ({
            result: false,
            check: jest.fn(() => checkCreateProposalGuard()),
        }));

        const { rerender } = renderHook(() =>
            useProposalPermissionCheckGuard({
                daoId: '',
                pluginAddress: '',
            }),
        );
        expect(checkCreateProposalGuard).toHaveBeenCalledTimes(1);

        useWalletAccountSpy.mockReturnValue({
            address: '0x2222222222222222222222222222222222222222',
            chainId: 1,
            isConnecting: false,
            isReconnecting: false,
        });
        rerender();

        expect(checkCreateProposalGuard).toHaveBeenCalledTimes(2);
    });
});
