import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType } from '@aragon/ods';
import { useFieldArray } from 'react-hook-form';
import type { ICreateProcessFormData } from '../createProcessFormDefinitions';
import { CreateProcessFormStagesItem } from './createProcessFormStagesItem';

export interface ICreateProcessFormStagesProps {}

export const CreateProcessFormStages: React.FC<ICreateProcessFormStagesProps> = () => {
    const { t } = useTranslations();

    const { fields, append, remove } = useFieldArray<Record<string, ICreateProcessFormData['stages']>>({
        name: 'stages',
    });

    const handleAddStage = () =>
        append({
            name: '',
            type: 'normal',
            votingPeriod: { days: 7, minutes: 0, hours: 0 },
            earlyStageAdvance: false,
            requiredApprovals: 1,
            bodies: [],
        });

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
