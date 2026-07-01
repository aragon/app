import {
    addressUtils,
    Button,
    DefinitionList,
    IconType,
    Toggle,
    ToggleGroup,
} from '@aragon/gov-ui-kit';
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { useState } from 'react';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { SettingsSlotId } from '../../constants/moduleSlots';
import { ALLOW_FLAG } from '../../constants/permissionSentinels';
import type { IPermissionGraphEdge } from '../../types';
import { conditionTypeUtils } from '../../utils/conditionTypeUtils';
import { NoConditionSlot } from '../noConditionSlot';

/**
 * Data for the expanded detail node shown when a permission edge is selected.
 */
export interface IPermissionDetailNodeData {
    edge: IPermissionGraphEdge;
    whoLabel: string;
    whereLabel: string;
    onClose: () => void;
    [key: string]: unknown;
}

export type IPermissionDetailFlowNode = Node<
    IPermissionDetailNodeData,
    'permissionDetail'
>;

type DetailTab = 'permission' | 'condition';

export const PermissionDetailNode: React.FC<
    NodeProps<IPermissionDetailFlowNode>
> = ({ data }) => {
    const { t } = useTranslations();
    const { edge, whoLabel, whereLabel, onClose } = data;
    const { row } = edge;

    const [tab, setTab] = useState<DetailTab>('permission');

    const hasCondition = !addressUtils.isAddressEqual(
        row.conditionAddress,
        ALLOW_FLAG,
    );
    const conditionType = conditionTypeUtils.resolveConditionType(
        row.conditionAddress,
        row.condition,
    );

    const handleTabChange = (value?: string | string[]) => {
        if (value === 'permission' || value === 'condition') {
            setTab(value);
        }
    };

    return (
        <div className="w-fit max-w-xl rounded-xl border border-primary-400 bg-neutral-0 shadow-primary-lg">
            <Handle
                className="opacity-0"
                position={Position.Bottom}
                type="target"
            />

            <div className="flex items-start justify-between gap-4 border-neutral-100 border-b p-4">
                <span className="whitespace-nowrap font-mono text-neutral-800 text-sm">
                    {edge.permissionName}
                    {edge.conditionLabel != null && (
                        <span className="text-neutral-500">
                            {` ${t(
                                'app.settings.daoPermissionsPage.graphView.edge.condition',
                                { condition: edge.conditionLabel },
                            )}`}
                        </span>
                    )}
                </span>
                <Button
                    aria-label={t(
                        'app.settings.daoPermissionsPage.graphView.detail.close',
                    )}
                    iconLeft={IconType.CLOSE}
                    onClick={onClose}
                    size="sm"
                    variant="tertiary"
                />
            </div>

            <div className="flex flex-col gap-4 p-4">
                <ToggleGroup
                    isMultiSelect={false}
                    onChange={handleTabChange}
                    value={tab}
                >
                    <Toggle
                        label={t(
                            'app.settings.daoPermissionsPage.graphView.detail.permission',
                        )}
                        value="permission"
                    />
                    <Toggle
                        label={t(
                            'app.settings.daoPermissionsPage.graphView.detail.condition',
                        )}
                        value="condition"
                    />
                </ToggleGroup>

                {tab === 'permission' ? (
                    <DefinitionList.Container>
                        <DefinitionList.Item
                            copyValue={row.whoAddress}
                            description={addressUtils.truncateAddress(
                                row.whoAddress,
                            )}
                            term={t('app.settings.permissionsList.details.who')}
                        >
                            {whoLabel}
                        </DefinitionList.Item>
                        <DefinitionList.Item
                            copyValue={row.whereAddress}
                            description={addressUtils.truncateAddress(
                                row.whereAddress,
                            )}
                            term={t(
                                'app.settings.permissionsList.details.where',
                            )}
                        >
                            {whereLabel}
                        </DefinitionList.Item>
                        <DefinitionList.Item
                            copyValue={row.permissionId}
                            description={addressUtils.truncateHash(
                                row.permissionId,
                            )}
                            term={t(
                                'app.settings.permissionsList.details.permission',
                            )}
                        >
                            {edge.permissionName}
                        </DefinitionList.Item>
                    </DefinitionList.Container>
                ) : (
                    <PluginSingleComponent
                        Fallback={NoConditionSlot}
                        pluginId={conditionType}
                        slotId={SettingsSlotId.PERMISSION_CONDITION}
                        {...(hasCondition ? row.condition : undefined)}
                    />
                )}
            </div>

            <Handle
                className="opacity-0"
                position={Position.Top}
                type="source"
            />
        </div>
    );
};
