import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType, type IInputContainerProps, InputContainer } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import { GovernanceType, type ICreateProcessFormData } from '../../../createProcessFormDefinitions';
import type { IUseBodiesFieldReturn } from '../../hooks';
import { GovernanceBodiesFieldItem } from './governanceBodiesFieldItem';

export interface IGovernanceBodiesFieldProps extends IUseBodiesFieldReturn {
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
    const { isOptimisticStage, stageId, governanceType, alert, bodies, addBody, removeBody, editBody } = props;

    const { t } = useTranslations();
    const { formState } = useFormContext<ICreateProcessFormData>();

    const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;
    const filteredBodies = bodies.filter((body) => stageId == null || body.stageId === stageId);
    const renderAddButton = isAdvancedGovernance || filteredBodies.length === 0;

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
                    {filteredBodies.map((body, index) => (
                        <GovernanceBodiesFieldItem
                            key={body.id}
                            fieldName={`bodies.${index.toString()}`}
                            body={body}
                            onEdit={() => editBody(body.internalId)}
                            onDelete={() => removeBody(body.internalId)}
                        />
                    ))}
                    {renderAddButton && (
                        <Button
                            size="md"
                            variant="tertiary"
                            className="w-fit"
                            iconLeft={IconType.PLUS}
                            onClick={() => addBody(stageId)}
                        >
                            {t('app.createDao.createProcessForm.governance.bodiesField.action.add')}
                        </Button>
                    )}
                </div>
            </InputContainer>
        </>
    );
};
