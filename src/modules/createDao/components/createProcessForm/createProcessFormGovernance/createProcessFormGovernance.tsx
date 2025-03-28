import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { type ICreateProcessFormData } from '../createProcessFormDefinitions';
import { createProcessFormUtils } from '../createProcessFormUtils';
import { CreateProcessFormGovernanceItem } from './createProcessFormGovernanceItem';
import { useState } from 'react';
import { GovernanceBodiesField } from './fields/governanceBodiesField';

export interface ICreateProcessFormGovernanceProps {}

export const CreateProcessFormGovernance: React.FC<ICreateProcessFormGovernanceProps> = () => {
    const { t } = useTranslations();

    const { setValue, getValues } = useFormContext<ICreateProcessFormData>();

    const [processType, setProcessType] = useState<'basic' | 'advanced'>('basic');

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

    const handleProcessTypeChanged = (value: string) => {
            setProcessType(value as typeof processType);
            if (value === 'basic') {
                setValue('stages', []);
            } else {
                handleAddStage();
            }
        };

    return (
        <div className="flex w-full flex-col gap-10">
            <RadioGroup
                label={t('app.createDao.createProcessForm.processType.label')}
                helpText={t('app.createDao.createProcessForm.processType.helpText')}
                value={processType}
                onValueChange={handleProcessTypeChanged}
                className="w-full !flex-row gap-4"
            >
                <RadioCard
                    label={t('app.createDao.createProcessForm.processType.basic.label')}
                    description={t('app.createDao.createProcessForm.processType.basic.description')}
                    value="basic"
                />
                <RadioCard
                    label={t('app.createDao.createProcessForm.processType.advanced.label')}
                    description={t('app.createDao.createProcessForm.processType.advanced.description')}
                    value="advanced"
                />
            </RadioGroup>
            {processType === 'basic' && <GovernanceBodiesField />}
            {processType === 'advanced' && (
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
