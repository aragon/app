import type { IProposalActionInputDataParameter } from '@aragon/gov-ui-kit';
import { IconType } from '@aragon/gov-ui-kit';
import type { AbiFunction, AbiParameter } from 'viem';
import {
    actionViewRegistry,
    type IActionViewDescriptor,
} from '@/shared/utils/actionViewRegistry';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { CoreActionType } from '../types/enum/coreActionType';
import { PermissionActionCreate } from './components/permissionActionCreate';
import { PermissionActionDetails } from './components/permissionActionDetails';
import { PermissionChangesCreate } from './components/permissionChangesCreate';
import { PermissionChangesDetails } from './components/permissionChangesDetails';
import {
    permissionActionAbis,
    permissionActionSelectors,
} from './constants/permissionActionSelectors';

/**
 * Every permission entry point lives on the DAO and needs ROOT there, so the composer
 * lists the actions under the DAO's own ROOT permission.
 */
const rootPermissionId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');

type InputDataParameterShape = Omit<IProposalActionInputDataParameter, 'value'>;

// viem's ABI parameters have optional names and readonly components; the kit wants
// both plain, so the shape is copied over rather than spread.
const toParameterShape = (input: AbiParameter): InputDataParameterShape => ({
    name: input.name ?? '',
    type: input.type,
    ...('components' in input
        ? { components: input.components.map(toParameterShape) }
        : {}),
});

/**
 * Builds the composer catalog item of a permission action: an empty action on the DAO
 * with the ABI shape the create component expects, so the same form renders whether the
 * action was picked here or decoded from calldata.
 */
const buildItem =
    (
        actionType: CoreActionType,
        abi: AbiFunction,
        nameKey: string,
    ): NonNullable<IActionViewDescriptor['getItem']> =>
    ({ contractAddress, t }) => ({
        id: `${contractAddress}-${actionType}`,
        name: t(`app.actions.core.permissionManager.composer.${nameKey}`),
        icon: IconType.SETTINGS,
        groupId: contractAddress,
        defaultValue: {
            type: actionType,
            from: '',
            to: contractAddress,
            data: '',
            value: '0',
            inputData: {
                function: abi.name,
                contract: 'DAO',
                stateMutability: abi.stateMutability,
                parameters: abi.inputs.map((input) => ({
                    ...toParameterShape(input),
                    value: input.type.endsWith('[]') ? [] : '',
                })),
            },
        },
    });

/**
 * Permission actions are matched on their function selector rather than an action type:
 * they usually reach the app decoded from calldata, with no type of their own.
 */
export const initPermissionManagerActionViews = () => {
    actionViewRegistry.register({
        actionType: CoreActionType.PERMISSION_GRANT,
        permissionId: rootPermissionId,
        componentCreate: PermissionActionCreate,
        componentDetails: PermissionActionDetails,
        functionSelector: permissionActionSelectors.grant,
        getItem: buildItem(
            CoreActionType.PERMISSION_GRANT,
            permissionActionAbis.grant,
            'grantActionName',
        ),
    });

    actionViewRegistry.register({
        actionType: CoreActionType.PERMISSION_REVOKE,
        permissionId: rootPermissionId,
        componentCreate: PermissionActionCreate,
        componentDetails: PermissionActionDetails,
        functionSelector: permissionActionSelectors.revoke,
        getItem: buildItem(
            CoreActionType.PERMISSION_REVOKE,
            permissionActionAbis.revoke,
            'revokeActionName',
        ),
    });

    actionViewRegistry.register({
        actionType: CoreActionType.PERMISSION_GRANT_WITH_CONDITION,
        permissionId: rootPermissionId,
        componentCreate: PermissionActionCreate,
        componentDetails: PermissionActionDetails,
        functionSelector: permissionActionSelectors.grantWithCondition,
        getItem: buildItem(
            CoreActionType.PERMISSION_GRANT_WITH_CONDITION,
            permissionActionAbis.grantWithCondition,
            'grantWithConditionActionName',
        ),
    });

    actionViewRegistry.register({
        actionType: CoreActionType.PERMISSION_APPLY_SINGLE_TARGET,
        permissionId: rootPermissionId,
        componentCreate: PermissionChangesCreate,
        componentDetails: PermissionChangesDetails,
        functionSelector:
            permissionActionSelectors.applySingleTargetPermissions,
        getItem: buildItem(
            CoreActionType.PERMISSION_APPLY_SINGLE_TARGET,
            permissionActionAbis.applySingleTargetPermissions,
            'applySingleTargetActionName',
        ),
    });

    actionViewRegistry.register({
        actionType: CoreActionType.PERMISSION_APPLY_MULTI_TARGET,
        permissionId: rootPermissionId,
        componentCreate: PermissionChangesCreate,
        componentDetails: PermissionChangesDetails,
        functionSelector: permissionActionSelectors.applyMultiTargetPermissions,
        getItem: buildItem(
            CoreActionType.PERMISSION_APPLY_MULTI_TARGET,
            permissionActionAbis.applyMultiTargetPermissions,
            'applyMultiTargetActionName',
        ),
    });
};
