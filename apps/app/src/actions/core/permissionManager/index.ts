import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { CoreActionType } from '../types/enum/coreActionType';
import { PermissionActionCreate } from './components/permissionActionCreate';
import { PermissionActionDetails } from './components/permissionActionDetails';
import { PermissionChangesCreate } from './components/permissionChangesCreate';
import { PermissionChangesDetails } from './components/permissionChangesDetails';
import { permissionActionSelectors } from './constants/permissionActionSelectors';

/**
 * Permission actions are matched on their function selector rather than an action type:
 * they usually reach the app decoded from calldata, with no type of their own.
 */
export const initPermissionManagerActionViews = () => {
    actionViewRegistry.register({
        actionType: CoreActionType.PERMISSION_GRANT,
        componentCreate: PermissionActionCreate,
        componentDetails: PermissionActionDetails,
        functionSelector: permissionActionSelectors.grant,
    });

    actionViewRegistry.register({
        actionType: CoreActionType.PERMISSION_REVOKE,
        componentCreate: PermissionActionCreate,
        componentDetails: PermissionActionDetails,
        functionSelector: permissionActionSelectors.revoke,
    });

    actionViewRegistry.register({
        actionType: CoreActionType.PERMISSION_GRANT_WITH_CONDITION,
        componentCreate: PermissionActionCreate,
        componentDetails: PermissionActionDetails,
        functionSelector: permissionActionSelectors.grantWithCondition,
    });

    actionViewRegistry.register({
        actionType: CoreActionType.PERMISSION_APPLY_SINGLE_TARGET,
        componentCreate: PermissionChangesCreate,
        componentDetails: PermissionChangesDetails,
        functionSelector:
            permissionActionSelectors.applySingleTargetPermissions,
    });

    actionViewRegistry.register({
        actionType: CoreActionType.PERMISSION_APPLY_MULTI_TARGET,
        componentCreate: PermissionChangesCreate,
        componentDetails: PermissionChangesDetails,
        functionSelector: permissionActionSelectors.applyMultiTargetPermissions,
    });
};
