import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType, InputContainer, Tag } from '@aragon/ods';
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
            <InputContainer
                id="resourcesInput"
                label={t('app.governance.createProposalForm.metadata.resources.title')}
                isOptional={true}
                helpText={t('app.governance.createProposalForm.metadata.resources.helpText')}
                useCustomWrapper={true}
            />
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
