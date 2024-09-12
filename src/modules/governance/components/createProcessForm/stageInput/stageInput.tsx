import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType } from '@aragon/ods';
import { useFieldArray, useForm } from 'react-hook-form';
import type { IStageInputProps, IStageInputResource } from './stageInput.api';
import { StageInputItem } from './stageInputItem';

export type StageInputBaseForm = Record<string, IStageInputResource[]>;

export const StageInput: React.FC<IStageInputProps> = (props) => {
    const { name } = props;

    const { t } = useTranslations();
    const { fields, append, remove } = useFieldArray<StageInputBaseForm>({ name });

    return (
        <div className="flex flex-col gap-2 md:gap-3">
            {fields.length > 0 && (
                <div className="flex flex-col gap-3 md:gap-2">
                    {fields.map((field, index) => (
                        <StageInputItem key={field.id} name={name} index={index} remove={remove} />
                    ))}
                </div>
            )}
            <Button
                size="md"
                variant="tertiary"
                className="w-fit"
                iconLeft={IconType.PLUS}
                onClick={() => append({ name: '', url: '' })}
            >
                {t('app.shared.stageInput.add')}
            </Button>
        </div>
    );
};
