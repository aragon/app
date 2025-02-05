import type { IPluginSetupDataPermission } from '@/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils';
import type { Hex } from 'viem';

export const generatePluginSetupDataPermission = (
    pluginSetupDataPermission?: Partial<IPluginSetupDataPermission>,
): IPluginSetupDataPermission => ({
    operation: 0,
    where: '0xWhere' as Hex,
    who: '0xWho' as Hex,
    condition: '0xCondition' as Hex,
    permissionId: '0xPermissionId' as Hex,
    ...pluginSetupDataPermission,
});
