import type { ISetupBodyDialogParams } from '@/modules/createDao/dialogs/setupBodyDialog/setupBodyDialog';
import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog/setupBodyDialogDefinitions';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useFieldArray, useWatch } from 'react-hook-form';
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
}

export const GovernanceBodiesField: React.FC<IGovernanceBodiesFieldProps> = (props) => {
    const { isOptimisticStage, stageId, governanceType } = props;

    const { open, close } = useDialogContext();
    const { t } = useTranslations();

    const {
        fields: bodiesField,
        remove: removeBody,
        update: updateBody,
        append: appendBody,
    } = useFieldArray<ICreateProcessFormData>({ name: 'bodies' });
    const watchBodiesField = useWatch<ICreateProcessFormData, 'bodies'>({ name: 'bodies' });
    const controlledBodiesField = bodiesField.map((field, index) => ({ ...field, ...watchBodiesField[index] }));

    const bodies = controlledBodiesField.filter((body) => stageId == null || body.stageId === stageId);

    const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;
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

    const bodiesLabelContext = isOptimisticStage ? 'vetoing' : 'voting';

    return (
        <>
            <InputContainer
                className="flex flex-col gap-2"
                id="bodies"
                label={t(`app.createDao.createProcessForm.governance.bodiesField.label.${bodiesLabelContext}`)}
                helpText={t('app.createDao.createProcessForm.governance.bodiesField.helpText')}
                useCustomWrapper={true}
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
