import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, Card, IconType, Tag } from '@aragon/ods';
import { useFieldArray, useForm } from 'react-hook-form';
import { ResourceItem } from '../resourceItem';

export interface IResourcesInputProps {}

export const ResourcesInput: React.FC<IResourcesInputProps> = () => {
    const { t } = useTranslations();

    const { control } = useForm({
        defaultValues: {
            resources: [{ label: '', link: '' }],
        },
        mode: 'onBlur',
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'resources',
    });

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

            {fields.length > 0 && (
                <Card className="flex flex-col gap-3 p-6 md:gap-2">
                    {fields.map((field, index) => (
                        <ResourceItem key={field.id} index={index} remove={remove} />
                    ))}
                </Card>
            )}
            <Button
                className="w-fit"
                iconLeft={IconType.PLUS}
                type="button"
                onClick={() => append({ label: '', link: '' })}
            >
                Add
            </Button>
        </div>
    );
};
