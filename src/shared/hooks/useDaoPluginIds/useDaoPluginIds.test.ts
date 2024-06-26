import * as daoService from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultError,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import { useDaoPluginIds } from './useDaoPluginIds';

describe('useDaoPluginIds hook', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

    afterEach(() => {
        useDaoSpy.mockReset();
    });

    it('fetches the dao and returns its plugin ids', () => {
        const daoId = 'test-id';
        const plugins = [generateDaoPlugin({ subdomain: 'id-1' }), generateDaoPlugin({ subdomain: 'id-2' })];
        const dao = generateDao({ id: daoId, plugins });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        const { result } = renderHook(() => useDaoPluginIds(daoId));
        expect(result.current).toEqual([plugins[0].subdomain, plugins[1].subdomain]);
    });

    it('returns empty array when dao has no plugins', () => {
        const daoId = 'no-plugin';
        const dao = generateDao({ id: daoId, plugins: [] });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        const { result } = renderHook(() => useDaoPluginIds(daoId));
        expect(result.current).toEqual([]);
    });

    it('returns empty array on fetch dao error', () => {
        const daoId = 'no-plugin';
        useDaoSpy.mockReturnValue(generateReactQueryResultError({ error: new Error('oops') }));
        const { result } = renderHook(() => useDaoPluginIds(daoId));
        expect(result.current).toEqual([]);
    });
});
