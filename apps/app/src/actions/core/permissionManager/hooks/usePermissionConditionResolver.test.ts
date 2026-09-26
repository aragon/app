import { renderHook } from '@testing-library/react';
import * as daoService from '@/shared/api/daoService';
import { generateDao, generateDaoPermission } from '@/shared/testUtils';
import { usePermissionConditionResolver } from './usePermissionConditionResolver';

describe('usePermissionConditionResolver hook', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useAllDaoPermissionsSpy = jest.spyOn(
        daoService,
        'useAllDaoPermissions',
    );

    const conditionAddress = '0xC0e86b47cf9e459999769E9CC0E589B16C699D5a';
    const otherAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

    const mockPermissions = (permissions: daoService.IDaoPermission[]) =>
        useAllDaoPermissionsSpy.mockReturnValue({
            data: permissions,
        } as ReturnType<typeof daoService.useAllDaoPermissions>);

    beforeEach(() => {
        useDaoSpy.mockReturnValue({
            data: generateDao({ id: 'test-dao' }),
        } as unknown as ReturnType<typeof daoService.useDao>);
        mockPermissions([]);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useAllDaoPermissionsSpy.mockReset();
    });

    it('resolves a condition the DAO already uses to its permissions page label', () => {
        mockPermissions([
            generateDaoPermission({
                conditionAddress: conditionAddress.toLowerCase(),
                condition: { conditionType: 'voting-power' },
            }),
        ]);
        const { result } = renderHook(() =>
            usePermissionConditionResolver({
                daoId: 'test-dao',
                enabled: true,
            }),
        );

        expect(result.current(conditionAddress)).toBe('VotingPower');
    });

    it('returns nothing for a condition the DAO does not use yet', () => {
        const { result } = renderHook(() =>
            usePermissionConditionResolver({
                daoId: 'test-dao',
                enabled: true,
            }),
        );

        expect(result.current(otherAddress)).toBeUndefined();
    });

    it('returns nothing when the condition type is unrecognised', () => {
        mockPermissions([
            generateDaoPermission({ conditionAddress, condition: undefined }),
        ]);
        const { result } = renderHook(() =>
            usePermissionConditionResolver({
                daoId: 'test-dao',
                enabled: true,
            }),
        );

        expect(result.current(conditionAddress)).toBeUndefined();
    });

    it('only fetches the DAO permissions when enabled', () => {
        renderHook(() =>
            usePermissionConditionResolver({
                daoId: 'test-dao',
                enabled: false,
            }),
        );

        expect(useAllDaoPermissionsSpy).toHaveBeenLastCalledWith(
            expect.anything(),
            { enabled: false },
        );
    });
});
