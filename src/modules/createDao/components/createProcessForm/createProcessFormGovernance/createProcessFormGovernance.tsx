import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { GovernanceType, type ICreateProcessFormData } from '../createProcessFormDefinitions';
import { createProcessFormUtils } from '../createProcessFormUtils';
import { CreateProcessFormGovernanceItem } from './createProcessFormGovernanceItem';
import { GovernanceBodiesField } from './fields/governanceBodiesField';
import { useFormField } from '@/shared/hooks/useFormField';

export interface ICreateProcessFormGovernanceProps {}

export const CreateProcessFormGovernance: React.FC<ICreateProcessFormGovernanceProps> = () => {
    const { t } = useTranslations();

    const { setValue, getValues } = useFormContext<ICreateProcessFormData>();

    const {
        value: governanceType,
        onChange: onGovernanceTypeChange,
        ...governanceTypeField
    } = useFormField<ICreateProcessFormData, 'governanceType'>('governanceType', {
        label: t('app.createDao.createProcessForm.governanceType.label'),
        defaultValue: GovernanceType.BASIC,
        rules: { required: true },
    });

    const {
        fields: stages,
        append: appendStage,
        remove: removeStage,
    } = useFieldArray<ICreateProcessFormData, 'stages'>({ name: 'stages' });

    const handleAddStage = () => appendStage(createProcessFormUtils.buildDefaultStage());

    const handleRemoveStage = (index: number) => {
        const currentBodies = getValues('bodies');
        const updatedBodies = currentBodies.filter((body) => body.stageId !== stages[index].internalId);
        removeStage(index);
        setValue('bodies', updatedBodies);
    };

    const handleGovernanceTypeChanged = (value: string) => {
        onGovernanceTypeChange(value);

        // Reset stages if process type is BASIC
        if (value === GovernanceType.BASIC) {
            setValue('stages', []);
        }
    };

    return (
        <div className="flex w-full flex-col gap-10">
            <RadioGroup
                helpText={t('app.createDao.createProcessForm.governanceType.helpText')}
                onValueChange={handleGovernanceTypeChanged}
                className="w-full !flex-row gap-4"
                value={governanceType}
                {...governanceTypeField}
            >
                {Object.values(GovernanceType).map((type) => (
                    <RadioCard
                        key={type}
                        label={t(`app.createDao.createProcessForm.governanceType.${type}.label`)}
                        description={t(`app.createDao.createProcessForm.governanceType.${type}.description`)}
                        value={type}
                    />
                ))}
            </RadioGroup>
            {governanceType === GovernanceType.BASIC && <GovernanceBodiesField />}
            {governanceType === GovernanceType.ADVANCED && (
                <div className="flex flex-col gap-2 md:gap-3">
                    <div className="flex flex-col gap-3 md:gap-2">
                        {stages.map((stage, index) => (
                            <CreateProcessFormGovernanceItem
                                key={stage.id}
                                formPrefix={`stages.${index.toString()}`}
                                stage={stage}
                                stagesCount={stages.length}
                                onDelete={() => handleRemoveStage(index)}
                            />
                        ))}
                    </div>
                    <Button
                        size="md"
                        variant="tertiary"
                        className="self-start"
                        iconLeft={IconType.PLUS}
                        onClick={handleAddStage}
                    >
                        {t('app.createDao.createProcessForm.stages.action.add')}
                    </Button>
                </div>
            )}
        </div>
    );
};
