import {
    type ICreateProcessFormData,
    ProcessPermission,
} from '@/modules/createDao/components/createProcessForm/createProcessFormDefinitions';
import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { ActionComposer } from '@/modules/governance/components/actionComposer';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm/createProposalFormDefinitions';
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

    const { t } = useTranslations();

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

    const addPermissionSelector = (actions: IProposalActionData[]) => appendPermissionSelector(actions);

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
                <div className="flex flex-col gap-3">
                    <ActionComposer
                        daoId={daoId}
                        onAddAction={addPermissionSelector}
                        hideWalletConnect={true}
                        excludeActionTypes={[ProposalActionType.TRANSFER]}
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
