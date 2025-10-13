import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import * as UseDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import * as UsePermissionCheckGuard from '../usePermissionCheckGuard';
import { useProposalExecuteGuard } from './useProposalExecuteGuard';

describe('useProposalPermissionCheckGuard hook', () => {
    const usePermissionCheckGuardSpy = jest.spyOn(UsePermissionCheckGuard, 'usePermissionCheckGuard');
    const useDaoPluginsSpy = jest.spyOn(UseDaoPlugins, 'useDaoPlugins');
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        usePermissionCheckGuardSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        useRouterSpy.mockReset();
        useDaoSpy.mockReset();
    });

    it('calls createProposalGuard when canCreateProposal check returns false', () => {
        const checkCreateProposalGuard = jest.fn();
        useDaoPluginsSpy.mockReturnValue([generateFilterComponentPlugin({ meta: generateDaoPlugin() })]);
        usePermissionCheckGuardSpy.mockReturnValue({
            result: false,
            check: checkCreateProposalGuard,
        });

        renderHook(() => useProposalExecuteGuard({ daoId: '', pluginAddress: '' }));
        expect(checkCreateProposalGuard).toHaveBeenCalled();
    });

    it('does not call createProposalGuard when canCreateProposal check returns true', () => {
        const checkCreateProposalGuard = jest.fn();
        useDaoPluginsSpy.mockReturnValue([generateFilterComponentPlugin({ meta: generateDaoPlugin() })]);
        usePermissionCheckGuardSpy.mockReturnValue({
            result: true,
            check: checkCreateProposalGuard,
        });

        renderHook(() => useProposalExecuteGuard({ daoId: 'dao-id', pluginAddress: 'plugin-address' }));
        expect(checkCreateProposalGuard).not.toHaveBeenCalled();
    });

    it('redirects to the specified tab when permission check fails', () => {
        const daoId = 'dao-id';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const daoAddress = '0x12345';
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao({ address: daoAddress, network: daoNetwork }) }),
        );
        const pluginAddress = 'plugin-address';
        const redirectTab = 'settings';
        const checkCreateProposalGuard = jest.fn();

        useDaoPluginsSpy.mockReturnValue([generateFilterComponentPlugin({ meta: generateDaoPlugin() })]);
        usePermissionCheckGuardSpy.mockReturnValue({ result: false, check: checkCreateProposalGuard });
        const mockRouter = { push: jest.fn() };
        useRouterSpy.mockReturnValue(mockRouter as unknown as AppRouterInstance);

        renderHook(() => useProposalExecuteGuard({ daoId, pluginAddress, redirectTab }));

        // simulate failed permission check
        usePermissionCheckGuardSpy.mock.calls[0][0].onError!();
        expect(mockRouter.push).toHaveBeenCalledWith(`/dao/${daoNetwork}/${daoAddress}/${redirectTab}`);
    });
});
