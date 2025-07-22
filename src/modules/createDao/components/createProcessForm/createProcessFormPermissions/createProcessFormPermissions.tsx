import {
    type ICreateProcessFormData,
    ProcessPermission,
} from '@/modules/createDao/components/createProcessForm/createProcessFormDefinitions';
import { ActionComposer, actionComposerUtils } from '@/modules/governance/components/actionComposer';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm/createProposalFormDefinitions';
import { useDao } from '@/shared/api/daoService/queries/useDao/useDao';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { CardEmptyState, RadioCard, RadioGroup, SmartContractFunctionDataListItem } from '@aragon/gov-ui-kit';
import { useFieldArray } from 'react-hook-form';

export interface ICreateProcessFormPermissionsProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const CreateProcessFormPermissions: React.FC<ICreateProcessFormPermissionsProps> = (props) => {
    const { daoId } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();

    const { pluginItems, pluginGroups } = actionComposerUtils.getPluginActionsFromDao(dao);

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

    const addPermissionSelector = (actions: IProposalActionData[]) => {
        appendPermissionSelector(actions);
        console.log('Permission selector added:', actions);
    };

    const removePermissionSelectorByIndex = (index: number) => removePermissionSelector(index);

    return (
        <div className="flex flex-col gap-6">
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
            {processPermission === SELECTED && (
                <div className="flex flex-col gap-2">
                    <ActionComposer
                        daoId={daoId}
                        onAddAction={addPermissionSelector}
                        nativeGroups={pluginGroups}
                        nativeItems={pluginItems}
                        hideWalletConnect={true}
                        excludeActionTypes={['Transfer']}
                    />
                    {permissionSelectors.map((selector, index) => (
                        <SmartContractFunctionDataListItem.Structure
                            key={selector.id}
                            contractAddress={selector.to}
                            onRemove={() => removePermissionSelectorByIndex(index)}
                            functionName={selector.inputData?.function}
                            contractName={selector.inputData?.contract}
                            functionParameters={selector.inputData?.parameters}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
