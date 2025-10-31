import type { IDaoPermission } from '@/shared/api/daoService';

export const generateDaoPermission = (daoPermission?: Partial<IDaoPermission>): IDaoPermission => ({
    permissionId: '0xPermissionId',
    whoAddress: '0xWhoAddress',
    whereAddress: '0xWhereAddress',
    conditionAddress: '0xConditionAddress',
    ...daoPermission,
});
