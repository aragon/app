import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType, Tag } from '@aragon/ods';
import { useFieldArray, useForm } from 'react-hook-form';
import { ResourceItem } from '../resourceItem';

export interface IResourcesInputProps {}

export const ResourcesInput: React.FC<IResourcesInputProps> = () => {
    const { t } = useTranslations();

    const { control } = useForm();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'resources',
    });

    return (
        <div className="flex flex-col gap-2 md:gap-3">
            <label className="flex flex-col gap-0.5 md:gap-1">
                <div className="flex flex-row items-center gap-3">
                    <p className="text-base font-normal leading-tight text-neutral-800 md:text-lg">
                        {t('app.governance.createProposalForm.metadata.resources.title')}
                    </p>
                    <Tag variant="neutral" label="Optional" />
                </div>

                <p className="text-sm font-normal leading-normal text-neutral-500 md:text-base">
                    {t('app.governance.createProposalForm.metadata.resources.helpText')}
                </p>
            </label>

            {fields.length > 0 && (
                <div className="flex flex-col gap-3 md:gap-2">
                    {fields.map((field, index) => (
                        <ResourceItem key={field.id} index={index} remove={remove} />
                    ))}
                </div>
            )}
            <Button className="w-fit" iconLeft={IconType.PLUS} onClick={() => append({ label: '', link: '' })}>
                {t('app.governance.createProposalForm.metadata.resources.add')}
            </Button>
        </div>
    );
};
