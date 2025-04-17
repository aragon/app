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

    it('calls createProposalGuard check when canCreateProposal result change to false', () => {
        const daoId = 'dao-id';
        const pluginAddress = 'plugin-address';
        const permissionDeniedRedirectTab = 'settings';
        const checkCreateProposalGuard = jest.fn();

        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: generateDaoPlugin() })]);
        usePermissionCheckGuardSpy
            .mockReturnValueOnce({
                result: true,
                check: checkCreateProposalGuard,
            })
            .mockReturnValueOnce({
                result: false,
                check: checkCreateProposalGuard,
            });

        const { rerender } = renderHook(() =>
            useProposalPermissionCheckGuard({
                daoId,
                pluginAddress,
                permissionDeniedRedirectTab,
            }),
        );

        expect(checkCreateProposalGuard).not.toHaveBeenCalled();

        rerender();

        expect(checkCreateProposalGuard).toHaveBeenCalled();
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
