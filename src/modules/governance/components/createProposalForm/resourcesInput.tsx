import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, Card, IconType, InputText, Tag } from '@aragon/ods';
import { useFieldArray, useForm } from 'react-hook-form';

export const ResourcesInput = () => {
    const { t } = useTranslations();

    const { control, register, watch } = useForm({
        defaultValues: {
            resources: [{ label: '', link: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'resources',
    });

    const resources = watch('resources');

    const isLastItemEmpty =
        resources.length > 0 && (!resources[resources.length - 1]?.label || !resources[resources.length - 1]?.link);

    return (
        <div className="flex flex-col gap-2 md:gap-3">
            <label className="flex flex-col gap-0.5 md:gap-1">
                <div className="flex flex-row items-center gap-3">
                    <p className="text-base font-normal leading-tight text-neutral-800 md:text-lg">
                        {t('app.createProposal.createProposalForm.resources.title')}
                    </p>
                    <Tag variant="neutral" label="Optional" />
                </div>

                <p className="text-sm font-normal leading-normal text-neutral-500 md:text-base">
                    {t('app.createProposal.createProposalForm.resources.helpText')}
                </p>
            </label>

            <Card className="flex flex-col gap-3 p-6 md:gap-2">
                {fields.map((item, index) => (
                    <li className="flex items-center gap-2" key={item.id}>
                        <InputText placeholder="Type a label" {...register(`resources.${index}.label`)} />
                        <InputText placeholder="https://" {...register(`resources.${index}.link`)} />
                        <Button
                            variant="tertiary"
                            iconLeft={IconType.DOTS_VERTICAL}
                            type="button"
                            onClick={() => remove(index)}
                            disabled={!resources[index]?.label && !resources[index]?.link}
                        />
                    </li>
                ))}
            </Card>
            <Button
                className="w-fit"
                iconLeft={IconType.PLUS}
                type="button"
                onClick={() => append({ label: '', link: '' })}
                disabled={isLastItemEmpty}
            >
                Add
            </Button>
        </div>
    );
};
