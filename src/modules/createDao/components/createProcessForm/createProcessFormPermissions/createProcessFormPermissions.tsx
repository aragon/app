import {
    type ICreateProcessFormData,
    ProcessPermission,
} from '@/modules/createDao/components/createProcessForm/createProcessFormDefinitions';
import type { Hex } from 'viem';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, CardEmptyState, RadioCard, RadioGroup, SmartContractFunctionDataListItem } from '@aragon/gov-ui-kit';
import { useFieldArray } from 'react-hook-form';
import { useDao } from '@/shared/api/daoService/queries/useDao/useDao';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IActionComposerPluginData } from '@/modules/governance/types';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';

export interface ICreateProcessFormPermissionsProps {
    /**
     * ID of the DAO
     */
    daoId: string;
}

export const CreateProcessFormPermissions: React.FC<ICreateProcessFormPermissionsProps> = (props) => {
    const { daoId } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();

    const pluginActions =
        dao?.plugins.map((plugin) =>
            pluginRegistryUtils.getSlotFunction<IDaoPlugin, IActionComposerPluginData>({
                pluginId: plugin.interfaceType,
                slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
            })?.(plugin),
        ) ?? [];

    const pluginItems = pluginActions.flatMap((data) => data?.items ?? []);
    const pluginGroups = pluginActions.flatMap((data) => data?.groups ?? []);

    console.log('ITEMS', pluginItems);
    console.log('GROUPS', pluginGroups);

    const { ANY, SELECTED } = ProcessPermission;

    const {
        onChange: onProcessPermissionChange,
        value: processPermission,
        ...processPermissionField
    } = useFormField<ICreateProcessFormData, 'permissions'>('permissions', {
        label: t('app.createDao.createProcessForm.permissions.permissionField.label'),
        defaultValue: ANY,
    });

    const {
        fields: permissionSelectors,
        append: appendPermissionSelector,
        remove: removePermissionSelector,
    } = useFieldArray<ICreateProcessFormData, 'permissionSelectors'>({
        name: 'permissionSelectors',
    });

    const addPermissionSelector = () => {
        appendPermissionSelector({ where: '0x' as Hex, selectors: [] });
    };

    const removePermissionSelectorByIndex = (index: number) => {
        removePermissionSelector(index);
    };

    return (
        <>
            <RadioGroup
                className="flex gap-4 md:!flex-row"
                onValueChange={onProcessPermissionChange}
                value={processPermission}
                helpText={t('app.createDao.createProcessForm.permissions.permissionField.helpText')}
                {...processPermissionField}
            >
                <RadioCard
                    className="min-w-0"
                    label={t('app.createDao.createProcessForm.permissions.permissionField.anyLabel')}
                    description={t('app.createDao.createProcessForm.permissions.permissionField.anyDescription')}
                    value={ANY}
                />
                <RadioCard
                    className="min-w-0"
                    label={t('app.createDao.createProcessForm.permissions.permissionField.specificLabel')}
                    description={t('app.createDao.createProcessForm.permissions.permissionField.specificDescription')}
                    value={SELECTED}
                />
            </RadioGroup>
            {processPermission === ANY && (
                <CardEmptyState
                    heading={t('app.createDao.createProcessForm.permissions.anyEmptyState.heading')}
                    description={t('app.createDao.createProcessForm.permissions.anyEmptyState.description')}
                    objectIllustration={{ object: 'SETTINGS' }}
                    isStacked={false}
                />
            )}
            {processPermission === SELECTED && permissionSelectors.length === 0 && (
                <CardEmptyState
                    heading={t('app.createDao.createProcessForm.permissions.specificEmptyState.heading')}
                    objectIllustration={{ object: 'SETTINGS' }}
                    isStacked={false}
                />
            )}
            <div className="flex flex-col gap-2">
                {permissionSelectors.map((selector, index) => (
                    <SmartContractFunctionDataListItem.Structure
                        key={selector.id}
                        contractAddress={selector.where}
                        onRemove={() => removePermissionSelectorByIndex(index)}
                    />
                ))}
            </div>
            {processPermission === SELECTED && (
                <div className="flex flex-col gap-4">
                    <Button variant="tertiary" size="md" onClick={addPermissionSelector} className="self-start">
                        Add Permission Selector
                    </Button>
                </div>
            )}
        </>
    );
};
