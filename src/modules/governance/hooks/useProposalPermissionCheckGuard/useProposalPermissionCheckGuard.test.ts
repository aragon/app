import * as UseDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { generateDaoPlugin, generateTabComponentPlugin } from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import * as UsePermissionCheckGuard from '../usePermissionCheckGuard';
import { useProposalPermissionCheckGuard } from './useProposalPermissionCheckGuard';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('useProposalPermissionCheckGuard hook', () => {
    const usePermissionCheckGuardSpy = jest.spyOn(UsePermissionCheckGuard, 'usePermissionCheckGuard');
    const useDaoPluginsSpy = jest.spyOn(UseDaoPlugins, 'useDaoPlugins');
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');

    afterEach(() => {
        usePermissionCheckGuardSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        useRouterSpy.mockReset();
    });

    it('calls createProposalGuard when canCreateProposal check returns false', () => {
        const checkCreateProposalGuard = jest.fn();
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: generateDaoPlugin() })]);
        usePermissionCheckGuardSpy.mockReturnValue({
            result: false,
            check: checkCreateProposalGuard,
        });

        renderHook(() =>
            useProposalPermissionCheckGuard({
                daoId: 'dao-id',
                pluginAddress: 'plugin-address',
                permissionDeniedRedirectTab: 'settings',
            }),
        );

        expect(checkCreateProposalGuard).toHaveBeenCalled();
    });

    it("doesn't call createProposalGuard when canCreateProposal check returns true", () => {
        const checkCreateProposalGuard = jest.fn();
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: generateDaoPlugin() })]);
        usePermissionCheckGuardSpy.mockReturnValue({
            result: true,
            check: checkCreateProposalGuard,
        });

        renderHook(() =>
            useProposalPermissionCheckGuard({
                daoId: 'dao-id',
                pluginAddress: 'plugin-address',
                permissionDeniedRedirectTab: 'settings',
            }),
        );

        expect(checkCreateProposalGuard).not.toHaveBeenCalled();
    });

    it('redirects to the specified tab when permission check fails', () => {
        const daoId = 'dao-id';
        const pluginAddress = 'plugin-address';
        const permissionDeniedRedirectTab = 'settings';
        const checkCreateProposalGuard = jest.fn();

        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: generateDaoPlugin() })]);
        usePermissionCheckGuardSpy.mockReturnValue({
            result: false,
            check: checkCreateProposalGuard,
        });
        const mockRouter = {
            push: jest.fn(),
        };
        useRouterSpy.mockReturnValue(mockRouter as unknown as AppRouterInstance);

        renderHook(() =>
            useProposalPermissionCheckGuard({
                daoId,
                pluginAddress,
                permissionDeniedRedirectTab,
            }),
        );

        // simulate failed permission check
        const spyFirstCall = usePermissionCheckGuardSpy.mock.calls[0];
        const spyFirstCallArgs = spyFirstCall[0];
        spyFirstCallArgs.onError!();

        expect(mockRouter.push).toHaveBeenCalledWith(`/dao/${daoId}/${permissionDeniedRedirectTab}`);
    });
});
