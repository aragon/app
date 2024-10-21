import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType } from '@aragon/ods';
import { useFieldArray } from 'react-hook-form';
import { CreateProcessFormStagesItem } from './createProcessFormStagesItem';

export interface ICreateProcessFormStagesProps {}

export const CreateProcessFormStages: React.FC<ICreateProcessFormStagesProps> = () => {
    const { t } = useTranslations();
    const { fields, append, remove } = useFieldArray({ name: 'stages' });

    const handleAddStage = () => append({});

    return (
        <div className="flex flex-col gap-2 md:gap-3">
            <div className="flex flex-col gap-3 md:gap-2">
                {fields.map((field, index) => (
                    <CreateProcessFormStagesItem
                        key={field.id}
                        index={index}
                        name={`stages.${index}`}
                        stagesCount={fields.length}
                        onRemoveStage={() => remove(index)}
                    />
                ))}
            </div>
            <Button size="md" variant="tertiary" className="w-fit" iconLeft={IconType.PLUS} onClick={handleAddStage}>
                {t('app.governance.createProcessForm.stage.add')}
            </Button>
        </div>
    );
};
