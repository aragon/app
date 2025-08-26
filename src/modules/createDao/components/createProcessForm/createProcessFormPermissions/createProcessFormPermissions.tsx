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
import {
    CardEmptyState,
    InputContainer,
    invariant,
    RadioCard,
    RadioGroup,
    SmartContractFunctionDataListItem,
} from '@aragon/gov-ui-kit';
import { useFieldArray, useFormContext } from 'react-hook-form';

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
            (action, index) => actions.findIndex((current) => compareActionSelectors(action, current)) !== index,
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
            {processPermission === SELECTED && (
                <>
                    {permissionSelectors.length === 0 ? (
                        <CardEmptyState
                            heading={t('app.createDao.createProcessForm.permissions.specificEmptyState.heading')}
                            objectIllustration={{ object: 'SETTINGS' }}
                            isStacked={false}
                        />
                    ) : (
                        <InputContainer alert={fieldAlert} useCustomWrapper={true} className="w-full" id="selectors">
                            {permissionSelectors.map((action, index) => (
                                <SmartContractFunctionDataListItem.Structure
                                    key={action.id}
                                    contractAddress={action.to}
                                    onRemove={() => removePermissionSelector(index)}
                                    functionName={action.inputData?.function}
                                    contractName={action.inputData?.contract}
                                    functionSelector={proposalActionUtils.actionToFunctionSelector(action)}
                                />
                            ))}
                        </InputContainer>
                    )}
                    <ActionComposer
                        daoId={daoId}
                        onAddAction={addPermissionSelector}
                        hideWalletConnect={true}
                        excludeActionTypes={[ProposalActionType.TRANSFER, ActionItemId.RAW_CALLDATA]}
                    />
                </>
            )}
        </div>
    );
};
