import { InputText, TextArea } from '@aragon/gov-ui-kit';
import type { ChangeEvent } from 'react';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { sanitizePlainText } from '@/shared/security';
import type { ICreatePolicyFormData } from '../createPolicyFormDefinitions';

export interface ICreatePolicyFormMetadataProps {
    /**
     * Prefix to prepend to all the metadata form fields.
     */
    fieldPrefix?: string;
}

const nameMaxLength = 40;

const policyKeyMaxLength = 5;

const descriptionMaxLength = 480;

export const CreatePolicyFormMetadata: React.FC<ICreatePolicyFormMetadataProps> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();

    const nameField = useFormField<ICreatePolicyFormData, 'name'>('name', {
        label: t('app.capitalFlow.createPolicyForm.metadata.name.label'),
        fieldPrefix,
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const { onChange: onPolicyKeyChange, ...policyKeyField } = useFormField<ICreatePolicyFormData, 'policyKey'>('policyKey', {
        label: t('app.capitalFlow.createPolicyForm.metadata.policyKey.label'),
        fieldPrefix,
        rules: { required: true, pattern: /^[A-Z]+$/, maxLength: policyKeyMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const descriptionField = useFormField<ICreatePolicyFormData, 'description'>('description', {
        label: t('app.capitalFlow.createPolicyForm.metadata.description.label'),
        fieldPrefix,
        rules: { maxLength: descriptionMaxLength },
        trimOnBlur: true,
        sanitizeMode: 'multiline',
        defaultValue: '',
    });

    const handleKeyFieldChange = (event: ChangeEvent<HTMLInputElement>) =>
        onPolicyKeyChange(sanitizePlainText(event.target.value).toUpperCase());

    return (
        <div className="flex w-full flex-col gap-10">
            <InputText maxLength={nameMaxLength} {...nameField} />
            <InputText
                helpText={t('app.capitalFlow.createPolicyForm.metadata.policyKey.helpText')}
                maxLength={policyKeyMaxLength}
                onChange={handleKeyFieldChange}
                {...policyKeyField}
            />
            <TextArea
                helpText={t('app.capitalFlow.createPolicyForm.metadata.description.helpText')}
                isOptional={true}
                maxLength={descriptionMaxLength}
                {...descriptionField}
            />
            <ResourcesInput
                fieldPrefix={fieldPrefix}
                helpText={t('app.capitalFlow.createPolicyForm.metadata.resources.helpText')}
                name="resources"
            />
        </div>
    );
};
