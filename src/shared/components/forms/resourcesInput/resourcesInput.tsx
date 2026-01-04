import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import type {
    IResourcesInputProps,
    IResourcesInputResource,
} from './resourcesInput.api';
import { ResourcesInputItem } from './resourcesInputItem';

export type ResourcesInputBaseForm = Record<string, IResourcesInputResource[]>;

export const ResourcesInput: React.FC<IResourcesInputProps> = (props) => {
    const { name, helpText, fieldPrefix, defaultValue } = props;

    const fieldName = fieldPrefix ? `${fieldPrefix}.${name}` : name;

    const { t } = useTranslations();
    const { fields, append, remove, replace } =
        useFieldArray<ResourcesInputBaseForm>({ name: fieldName });

    useEffect(() => {
        if (defaultValue) {
            replace(defaultValue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [replace, defaultValue]);

    return (
        <div className="flex flex-col gap-2 md:gap-3">
            <InputContainer
                helpText={helpText}
                id="resourcesInput"
                isOptional={true}
                label={t('app.shared.resourcesInput.title')}
                useCustomWrapper={true}
            />
            {fields.length > 0 && (
                <div className="flex flex-col gap-3 md:gap-2">
                    {fields.map((field, index) => (
                        <ResourcesInputItem
                            index={index}
                            key={field.id}
                            name={fieldName}
                            remove={remove}
                        />
                    ))}
                </div>
            )}
            <Button
                className="w-fit"
                iconLeft={IconType.PLUS}
                onClick={() => append({ name: '', url: '' })}
                size="md"
                variant="tertiary"
            >
                {t('app.shared.resourcesInput.add')}
            </Button>
        </div>
    );
};
