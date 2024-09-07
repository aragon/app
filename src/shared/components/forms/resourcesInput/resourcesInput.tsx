import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType, InputContainer } from '@aragon/ods';
import { useFieldArray } from 'react-hook-form';
import type { IResourcesInputProps, IResourcesInputResource } from './resourcesInput.api';
import { ResourcesInputItem } from './resourcesInputItem';

export type ResourcesInputBaseForm = Record<string, IResourcesInputResource[]>;

export const ResourcesInput: React.FC<IResourcesInputProps> = (props) => {
    const { name, helpText } = props;

    const { t } = useTranslations();
    const { fields, append, remove } = useFieldArray<ResourcesInputBaseForm>({ name });

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
                onClick={() => append({ name: '', url: '' })}
            >
                {t('app.shared.resourcesInput.add')}
            </Button>
        </div>
    );
};
