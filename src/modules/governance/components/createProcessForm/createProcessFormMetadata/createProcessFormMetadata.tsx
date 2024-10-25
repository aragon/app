import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, TextArea } from '@aragon/gov-ui-kit';
import type { ChangeEvent } from 'react';
import type { ICreateProcessFormData } from '../createProcessFormDefinitions';

export interface ICreateProcessFormMetadataProps {}

export const CreateProcessFormMetadata: React.FC<ICreateProcessFormMetadataProps> = () => {
    const { t } = useTranslations();

    const nameField = useFormField<ICreateProcessFormData, 'name'>('name', {
        label: t('app.governance.createProcessForm.metadata.name.label'),
        trimOnBlur: true,
        rules: { required: true, maxLength: 18 },
        defaultValue: '',
    });

    const { onChange: onKeyChange, ...keyField } = useFormField<ICreateProcessFormData, 'key'>('key', {
        label: t('app.governance.createProcessForm.metadata.key.label'),
        trimOnBlur: true,
        rules: {
            required: true,
            pattern: { value: /^[A-Z]+$/, message: 'Only alphabetic characters are allowed' },
        },
        defaultValue: '',
    });

    const summaryField = useFormField<ICreateProcessFormData, 'description'>('description', {
        label: t('app.governance.createProcessForm.metadata.description.label'),
        defaultValue: '',
    });

    const handleKeyFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
        const upperValue = event.target.value.toUpperCase();
        onKeyChange({ ...event, target: { ...event.target, value: upperValue } });
    };

    return (
        <div className="flex flex-col gap-10">
            <InputText
                helpText={t('app.governance.createProcessForm.metadata.name.helpText')}
                placeholder={t('app.governance.createProcessForm.metadata.name.placeholder')}
                maxLength={18}
                {...nameField}
            />
            <InputText
                helpText={t('app.governance.createProcessForm.metadata.key.helpText')}
                placeholder={t('app.governance.createProcessForm.metadata.key.placeholder')}
                maxLength={5}
                addon={keyField.value != '' ? '-01' : undefined}
                addonPosition="right"
                onChange={handleKeyFieldChange}
                {...keyField}
            />
            <TextArea
                helpText={t('app.governance.createProcessForm.metadata.description.helpText')}
                placeholder={t('app.governance.createProcessForm.metadata.description.placeholder')}
                isOptional={true}
                maxLength={480}
                {...summaryField}
            />
            <ResourcesInput
                name="resources"
                helpText={t('app.governance.createProcessForm.metadata.resources.helpText')}
            />
        </div>
    );
};
