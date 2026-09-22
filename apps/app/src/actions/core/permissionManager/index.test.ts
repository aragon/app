import { actionComposerUtils } from '@/modules/governance/components/actionComposer/actionComposerUtils';
import { generateDaoPermission } from '@/shared/testUtils';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { mockTranslations } from '@/test/utils';
import { CoreActionType } from '../types/enum/coreActionType';
import { initPermissionManagerActionViews } from './index';

describe('permissionManager action views', () => {
    const daoAddress = '0x1111111111111111111111111111111111111111';
    const rootPermissionId =
        permissionNameUtils.getPermissionId('ROOT_PERMISSION');

    beforeAll(() => {
        initPermissionManagerActionViews();
    });

    it('lists the five permission actions in the DAO group for a DAO holding ROOT', () => {
        const { items } = actionComposerUtils.getDaoPermissionActions({
            t: mockTranslations.tMock,
            permissions: [
                generateDaoPermission({
                    permissionId: rootPermissionId,
                    whereAddress: daoAddress,
                    whoAddress: daoAddress,
                }),
            ],
        });

        expect(items.map((item) => item.defaultValue?.type)).toEqual([
            CoreActionType.PERMISSION_GRANT,
            CoreActionType.PERMISSION_REVOKE,
            CoreActionType.PERMISSION_GRANT_WITH_CONDITION,
            CoreActionType.PERMISSION_APPLY_SINGLE_TARGET,
            CoreActionType.PERMISSION_APPLY_MULTI_TARGET,
        ]);
        expect(items.every((item) => item.groupId === daoAddress)).toBe(true);
        expect(
            items.every((item) => item.defaultValue?.to === daoAddress),
        ).toBe(true);
    });

    it('starts each action empty with the ABI shape the create components expect', () => {
        const { items } = actionComposerUtils.getDaoPermissionActions({
            t: mockTranslations.tMock,
            permissions: [
                generateDaoPermission({
                    permissionId: rootPermissionId,
                    whereAddress: daoAddress,
                }),
            ],
        });

        const grant = items.find(
            (item) =>
                item.defaultValue?.type === CoreActionType.PERMISSION_GRANT,
        );
        expect(grant?.defaultValue?.data).toBe('');
        expect(
            grant?.defaultValue?.inputData?.parameters.map((p) => p.value),
        ).toEqual(['', '', '']);

        const multi = items.find(
            (item) =>
                item.defaultValue?.type ===
                CoreActionType.PERMISSION_APPLY_MULTI_TARGET,
        );
        const [rows] = multi?.defaultValue?.inputData?.parameters ?? [];
        expect(rows?.value).toEqual([]);
        expect(rows?.components?.map((c) => c.name)).toEqual([
            'operation',
            'where',
            'who',
            'condition',
            'permissionId',
        ]);
    });

    it('lists nothing for a permission other than ROOT', () => {
        const { items } = actionViewRegistry.getActionsForPermissionId(
            permissionNameUtils.getPermissionId('EXECUTE_PERMISSION'),
            daoAddress,
            mockTranslations.tMock,
        );

        expect(items).toEqual([]);
    });
});
