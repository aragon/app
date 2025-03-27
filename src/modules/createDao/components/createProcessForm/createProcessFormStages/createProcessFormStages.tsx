import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType } from '@aragon/gov-ui-kit';
import { useFieldArray } from 'react-hook-form';
import { defaultStage, type ICreateProcessFormData } from '../createProcessFormDefinitions';
import { CreateProcessFormStagesItem } from './createProcessFormStagesItem';

export interface ICreateProcessFormStagesProps {}

export const CreateProcessFormStages: React.FC<ICreateProcessFormStagesProps> = () => {
    const { t } = useTranslations();

    const {
        fields: stages,
        append: appendStage,
        remove: removeStage,
    } = useFieldArray<Record<string, ICreateProcessFormData['stages']>>({ name: 'stages' });

    const handleAddStage = () => appendStage(defaultStage);

    return (
        <div className="flex flex-col gap-2 md:gap-3">
            <div className="flex flex-col gap-3 md:gap-2">
                {stages.map((field, index) => (
                    <CreateProcessFormStagesItem
                        key={field.id}
                        index={index}
                        name={`stages.${index.toString()}`}
                        stagesCount={stages.length}
                        onDelete={removeStage}
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
