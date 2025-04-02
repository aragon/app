import type { ISetupBodyDialogParams } from '@/modules/createDao/dialogs/setupBodyDialog/setupBodyDialog';
import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog/setupBodyDialogDefinitions';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType, type IInputContainerProps, InputContainer } from '@aragon/gov-ui-kit';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { GovernanceType, type ICreateProcessFormData } from '../../../createProcessFormDefinitions';
import { GovernanceBodiesFieldItem } from './governanceBodiesFieldItem';

export interface IGovernanceBodiesFieldProps {
    /**
     * Defines if current stage is optimistic or not, only set for advanced governance processes.
     */
    isOptimisticStage?: boolean;
    /**
     * ID of the stage to add the governance bodies for.
     */
    stageId?: string;
    /**
     * Type of governance to setup.
     */
    governanceType: GovernanceType;
    /**
     * Alert to be displayed on the field.
     */
    alert?: IInputContainerProps['alert'];
}

export const GovernanceBodiesField: React.FC<IGovernanceBodiesFieldProps> = (props) => {
    const { isOptimisticStage, stageId, governanceType, alert } = props;

    const { open, close } = useDialogContext();
    const { t } = useTranslations();
    const { formState } = useFormContext<ICreateProcessFormData>();

    const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;

    // Only apply min-length rule for simple governance as stage bodies are already validated per-stage on the stage field
    const validateBodies = (bodies: ICreateProcessFormData['bodies']) => {
        const bodiesFieldError = 'app.createDao.createProcessForm.governance.bodiesField.error.minLength';
        const isValid = bodies.length > 0;

        return isAdvancedGovernance || isValid ? undefined : bodiesFieldError;
    };

    const {
        fields: bodiesField,
        remove: removeBody,
        update: updateBody,
        append: appendBody,
    } = useFieldArray<ICreateProcessFormData, 'bodies'>({ name: 'bodies', rules: { validate: validateBodies } });
    const watchBodiesField = useWatch<ICreateProcessFormData, 'bodies'>({ name: 'bodies' });
    const controlledBodiesField = bodiesField.map((field, index) => ({ ...field, ...watchBodiesField[index] }));

    const bodies = controlledBodiesField.filter((body) => stageId == null || body.stageId === stageId);
    const renderAddButton = isAdvancedGovernance || bodies.length === 0;

    const handleBodySubmit = (index?: number) => (values: ISetupBodyForm) => {
        if (index == null) {
            const bodyId = crypto.randomUUID();
            appendBody({ ...values, internalId: bodyId, stageId });
        } else {
            updateBody(index, values);
        }
        close();
    };

    const handleAddBody = () => {
        const params: ISetupBodyDialogParams = { onSubmit: handleBodySubmit(), isSubPlugin: isAdvancedGovernance };
        open('SETUP_BODY', { params });
    };

    const handleEditBody = (index: number) => {
        const params: ISetupBodyDialogParams = {
            onSubmit: handleBodySubmit(index),
            initialValues: controlledBodiesField[index],
            isSubPlugin: isAdvancedGovernance,
        };
        open('SETUP_BODY', { params });
    };

    const { message: errorMessage } = formState.errors.bodies?.root ?? {};
    const internalFieldAlert = errorMessage ? { message: t(errorMessage), variant: 'critical' as const } : undefined;

    const bodiesLabelContext = isOptimisticStage ? 'vetoing' : 'voting';

    return (
        <>
            <InputContainer
                className="flex flex-col gap-2"
                id="bodies"
                label={t(`app.createDao.createProcessForm.governance.bodiesField.label.${bodiesLabelContext}`)}
                helpText={t('app.createDao.createProcessForm.governance.bodiesField.helpText')}
                useCustomWrapper={true}
                alert={alert ?? internalFieldAlert}
            >
                <div className="flex flex-col gap-3 md:gap-2">
                    {bodies.map((body, index) => (
                        <GovernanceBodiesFieldItem
                            key={body.id}
                            fieldName={`bodies.${index.toString()}`}
                            body={body}
                            onEdit={() => handleEditBody(index)}
                            onDelete={() => removeBody(index)}
                        />
                    ))}
                    {renderAddButton && (
                        <Button
                            size="md"
                            variant="tertiary"
                            className="w-fit"
                            iconLeft={IconType.PLUS}
                            onClick={handleAddBody}
                        >
                            {t('app.createDao.createProcessForm.governance.bodiesField.action.add')}
                        </Button>
                    )}
                </div>
            </InputContainer>
        </>
    );
};
