import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType, InputContainer } from '@aragon/ods';
import { useFieldArray } from 'react-hook-form';
import { ResourcesInputItem } from './resourcesInputItem';

export interface IResourcesInputProps {
    /**
     * The name of the field in the form.
     */
    name: string;
    /**
     * The name of the field in the form.
     */
    helpText: string;
}

export const ResourcesInput: React.FC<IResourcesInputProps> = (props) => {
    const { name, helpText } = props;

    const { t } = useTranslations();
<<<<<<<< HEAD:src/shared/components/resourcesInput/resourcesInput.tsx
    const { fields, append, remove } = useFieldArray({ name: name });
========
    const { fields, append, remove } = useFieldArray({ name });
>>>>>>>> 2698044 (Start implementation of autocomplete component):src/shared/components/forms/resourceInput/resourceInput.tsx

    return (
        <div className="flex flex-col gap-2 md:gap-3">
            <InputContainer
                id="resourcesInput"
                label={t('app.shared.resourcesInput.title')}
                isOptional={true}
                helpText={helpText}
                useCustomWrapper={true}
            />
            {fields.length > 0 && (
                <div className="flex flex-col gap-3 md:gap-2">
                    {fields.map((field, index) => (
                        <ResourcesInputItem key={field.id} name={name} index={index} remove={remove} />
                    ))}
                </div>
            )}
            <Button
                size="md"
                variant="tertiary"
                className="w-fit"
                iconLeft={IconType.PLUS}
                onClick={() => append({ label: '', link: '' })}
            >
                {t('app.shared.resourcesInput.add')}
            </Button>
        </div>
    );
};
