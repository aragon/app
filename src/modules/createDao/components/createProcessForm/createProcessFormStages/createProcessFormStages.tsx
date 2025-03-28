import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType } from '@aragon/gov-ui-kit';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { type ICreateProcessFormData } from '../createProcessFormDefinitions';
import { createProcessFormUtils } from '../createProcessFormUtils';
import { CreateProcessFormStagesItem } from './createProcessFormStagesItem';

export interface ICreateProcessFormStagesProps {}

export const CreateProcessFormStages: React.FC<ICreateProcessFormStagesProps> = () => {
    const { t } = useTranslations();

    const { setValue, getValues } = useFormContext<ICreateProcessFormData>();

    const {
        fields: stages,
        append: appendStage,
        remove: removeStage,
    } = useFieldArray<Record<string, ICreateProcessFormData['stages']>>({ name: 'stages' });

    const handleAddStage = () => appendStage(createProcessFormUtils.buildDefaultStage());

    const handleRemoveStage = (index: number) => {
        const currentBodies = getValues('bodies');
        const updatedBodies = currentBodies.filter((body) => body.stageId !== stages[index].internalId);
        removeStage(index);
        setValue('bodies', updatedBodies);
    };

    return (
        <div className="flex flex-col gap-2 md:gap-3">
            <div className="flex flex-col gap-3 md:gap-2">
                {stages.map((stage, index) => (
                    <CreateProcessFormStagesItem
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
    );
};
