import { CardEmptyState, InputContainer, invariant, RadioCard, RadioGroup, SmartContractFunctionDataListItem } from '@aragon/gov-ui-kit';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
    type ICreateProcessFormData,
    ProcessPermission,
} from '@/modules/createDao/components/createProcessForm/createProcessFormDefinitions';
import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { ActionComposer, ActionItemId } from '@/modules/governance/components/actionComposer';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm/createProposalFormDefinitions';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

export interface ICreateProcessFormPermissionsProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

const compareActionSelectors = (actionOne: IProposalActionData, actionTwo: IProposalActionData) => {
    const selectorOne = proposalActionUtils.actionToFunctionSelector(actionOne);
    const selectorTwo = proposalActionUtils.actionToFunctionSelector(actionTwo);

    return actionOne.to === actionTwo.to && selectorOne === selectorTwo;
};

export const CreateProcessFormPermissions: React.FC<ICreateProcessFormPermissionsProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { getFieldState } = useFormContext();

    const { ANY, SELECTED } = ProcessPermission;

    const {
        onChange: onProcessPermissionChange,
        value: processPermission,
        ...processPermissionField
    } = useFormField<ICreateProcessFormData, 'permissions'>('permissions', {
        label: t('app.createDao.createProcessForm.permissions.permissionField.label'),
        defaultValue: ANY,
    });

    const validateActions = (actions: IProposalActionData[]) => {
        const hasInvalidActions = actions.some(({ inputData }) => inputData == null);
        invariant(!hasInvalidActions, 'CreateProcessFormPermissions: actions with invalid inputData found in list.');

        const hasDuplicateActions = actions.some(
            (action, index) => actions.findIndex((current) => compareActionSelectors(action, current)) !== index
        );

        if (hasDuplicateActions) {
            return 'app.createDao.createProcessForm.permissions.permissionField.error.duplicate';
        }

        return true;
    };

    const {
        fields: permissionSelectors,
        append: appendPermissionSelector,
        remove: removePermissionSelector,
    } = useFieldArray<ICreateProcessFormData, 'permissionSelectors'>({
        name: 'permissionSelectors',
        rules: { validate: validateActions },
    });

    const addPermissionSelector = (actions: IProposalActionData[]) => appendPermissionSelector(actions);

    const { message: fieldErrorMessage } = getFieldState('permissionSelectors').error?.root ?? {};
    const fieldAlert = fieldErrorMessage ? { message: t(fieldErrorMessage), variant: 'critical' as const } : undefined;

    return (
        <div className="flex flex-col gap-6">
            <RadioGroup
                className="md:!flex-row flex gap-4"
                helpText={t('app.createDao.createProcessForm.permissions.permissionField.helpText')}
                onValueChange={onProcessPermissionChange}
                value={processPermission}
                {...processPermissionField}
            >
                <RadioCard
                    className="min-w-0"
                    description={t('app.createDao.createProcessForm.permissions.permissionField.anyDescription')}
                    label={t('app.createDao.createProcessForm.permissions.permissionField.anyLabel')}
                    value={ANY}
                />
                <RadioCard
                    className="min-w-0"
                    description={t('app.createDao.createProcessForm.permissions.permissionField.specificDescription')}
                    label={t('app.createDao.createProcessForm.permissions.permissionField.specificLabel')}
                    value={SELECTED}
                />
            </RadioGroup>
            {processPermission === ANY && (
                <CardEmptyState
                    description={t('app.createDao.createProcessForm.permissions.anyEmptyState.description')}
                    heading={t('app.createDao.createProcessForm.permissions.anyEmptyState.heading')}
                    isStacked={false}
                    objectIllustration={{ object: 'SETTINGS' }}
                />
            )}
            {processPermission === SELECTED && (
                <>
                    {permissionSelectors.length === 0 ? (
                        <CardEmptyState
                            heading={t('app.createDao.createProcessForm.permissions.specificEmptyState.heading')}
                            isStacked={false}
                            objectIllustration={{ object: 'SETTINGS' }}
                        />
                    ) : (
                        <InputContainer alert={fieldAlert} className="w-full" id="selectors" useCustomWrapper={true}>
                            {permissionSelectors.map((action, index) => (
                                <SmartContractFunctionDataListItem.Structure
                                    contractAddress={action.to}
                                    contractName={action.inputData?.contract}
                                    functionName={action.inputData?.function}
                                    functionSelector={proposalActionUtils.actionToFunctionSelector(action)}
                                    key={action.id}
                                    onRemove={() => removePermissionSelector(index)}
                                />
                            ))}
                        </InputContainer>
                    )}
                    <ActionComposer
                        daoId={daoId}
                        excludeActionTypes={[ProposalActionType.TRANSFER, ActionItemId.RAW_CALLDATA]}
                        hideWalletConnect={true}
                        onAddAction={addPermissionSelector}
                    />
                </>
            )}
        </div>
    );
};
