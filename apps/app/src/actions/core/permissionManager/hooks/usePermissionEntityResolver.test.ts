import { addressUtils } from '@aragon/gov-ui-kit';
import { renderHook } from '@testing-library/react';
import { ANY_ADDR } from '@/modules/settings/constants/permissionSentinels';
import * as daoService from '@/shared/api/daoService';
import * as useDaoPluginsModule from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
} from '@/shared/testUtils';
import { usePermissionEntityResolver } from './usePermissionEntityResolver';

describe('usePermissionEntityResolver hook', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPluginsSpy = jest.spyOn(useDaoPluginsModule, 'useDaoPlugins');

    const daoAddress = '0xC8da4C1d9BB59DD32ac39A925933188b7c66c311';
    const pluginAddress = '0x0150627b84a0C8257AB28cD0E1F71E81c7aafe3d';
    const strangerAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

    beforeEach(() => {
        const dao = generateDao({
            id: 'test-dao',
            address: daoAddress,
            name: 'Test DAO',
        });
        useDaoSpy.mockReturnValue({ data: dao } as unknown as ReturnType<
            typeof daoService.useDao
        >);
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({
                meta: generateDaoPlugin({ address: pluginAddress }),
            }),
        ]);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoPluginsSpy.mockReset();
    });

    it('resolves the DAO address to the DAO name', () => {
        const { result } = renderHook(() =>
            usePermissionEntityResolver({ daoId: 'test-dao' }),
        );

        const entity = result.current(daoAddress);
        expect(entity.type).toBe('dao');
        expect(entity.label).toBe('Test DAO');
    });

    it('resolves an installed plugin, including unsupported ones', () => {
        const { result } = renderHook(() =>
            usePermissionEntityResolver({ daoId: 'test-dao' }),
        );

        expect(result.current(pluginAddress).type).toBe('plugin');
        expect(useDaoPluginsSpy).toHaveBeenCalledWith(
            expect.objectContaining({ includeUnsupported: true }),
        );
    });

    it('resolves the OSx any-address sentinel', () => {
        const { result } = renderHook(() =>
            usePermissionEntityResolver({ daoId: 'test-dao' }),
        );

        expect(result.current(ANY_ADDR).label).toBe('Anyone');
    });

    it('falls back to the truncated address for an unknown account', () => {
        const { result } = renderHook(() =>
            usePermissionEntityResolver({ daoId: 'test-dao' }),
        );

        expect(result.current(strangerAddress).label).toBe(
            addressUtils.truncateAddress(strangerAddress),
        );
    });

    it('skips the DAO lookups when there is no daoId and resolves nothing', () => {
        // A disabled query has no data; the hook must not fall back to a stale DAO.
        useDaoSpy.mockReturnValue({
            data: undefined,
        } as unknown as ReturnType<typeof daoService.useDao>);
        useDaoPluginsSpy.mockReturnValue([]);

        const { result } = renderHook(() => usePermissionEntityResolver({}));

        expect(useDaoSpy).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ enabled: false }),
        );
        expect(useDaoPluginsSpy).toHaveBeenCalledWith(
            expect.objectContaining({ enabled: false }),
        );
        expect(result.current(daoAddress).label).toBe(
            addressUtils.truncateAddress(daoAddress),
        );
    });
});
