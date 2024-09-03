import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType, InputContainer } from '@aragon/ods';
import { type FieldPath, type FieldValues, type UseControllerReturn, useFieldArray } from 'react-hook-form';
import { ResourceInputItem } from './resourceInputItem';

export interface IResourcesInputProps {
    /**
     * The name of the field in the form.
     */
    name: string;
    /**
     * The name of the field in the form.
     */
    helpText: string;
    /**
     * Callback to be fired when the ResourceInputItem is blurred.
     */
    trim?: <TFieldValues extends FieldValues>(
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
        field: UseControllerReturn<TFieldValues, FieldPath<TFieldValues>>['field'],
    ) => void;
}

export const ResourcesInput: React.FC<IResourcesInputProps> = (props) => {
    const { name, helpText, trim } = props;
    const { t } = useTranslations();

    const { fields, append, remove } = useFieldArray({
        name: name,
    });

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
                        <ResourceInputItem key={field.id} index={index} remove={remove} trim={trim} />
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
