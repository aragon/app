import { InputText, TextArea } from '@aragon/gov-ui-kit';
import type { ChangeEvent } from 'react';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { sanitizePlainText } from '@/shared/security';
import type { ICreateProcessFormData } from '../createProcessFormDefinitions';

export interface ICreateProcessFormMetadataProps {
    /**
     * Prefix to prepend to all the metadata form fields.
     */
    fieldPrefix?: string;
    /**
     * Displays the process key field when set to true.
     * @default true
     */
    displayProcessKey?: boolean;
    /**
     * Plugin type to be used for form labels.
     * @default 'process'
     */
    pluginType?: 'plugin' | 'process';
}

const nameMaxLength = 40;

const processKeyMaxLength = 5;

const summaryMaxLength = 480;

export const CreateProcessFormMetadata: React.FC<ICreateProcessFormMetadataProps> = (props) => {
    const { fieldPrefix, displayProcessKey = true, pluginType = 'process' } = props;

    const { t } = useTranslations();

    const nameField = useFormField<ICreateProcessFormData, 'name'>('name', {
        label: t('app.createDao.createProcessForm.metadata.name.label'),
        fieldPrefix,
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const { onChange: onProcessKeyChange, ...processKeyField } = useFormField<ICreateProcessFormData, 'processKey'>('processKey', {
        label: t('app.createDao.createProcessForm.metadata.processKey.label'),
        fieldPrefix,
        rules: { required: displayProcessKey, pattern: /^[A-Z]+$/, maxLength: processKeyMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const summaryField = useFormField<ICreateProcessFormData, 'description'>('description', {
        label: t('app.createDao.createProcessForm.metadata.description.label'),
        fieldPrefix,
        rules: { maxLength: summaryMaxLength },
        trimOnBlur: true,
        sanitizeMode: 'multiline',
        defaultValue: '',
    });

    const handleKeyFieldChange = (event: ChangeEvent<HTMLInputElement>) =>
        onProcessKeyChange(sanitizePlainText(event.target.value).toUpperCase());

    const typeLabel = t(`app.createDao.createProcessForm.metadata.type.${pluginType}`);

    return (
        <div className="flex w-full flex-col gap-10">
            <InputText maxLength={nameMaxLength} {...nameField} />
            {displayProcessKey && (
                <InputText
                    helpText={t('app.createDao.createProcessForm.metadata.processKey.helpText')}
                    maxLength={processKeyMaxLength}
                    onChange={handleKeyFieldChange}
                    {...processKeyField}
                />
            )}
            <TextArea
                helpText={t('app.createDao.createProcessForm.metadata.description.helpText', { type: typeLabel })}
                isOptional={true}
                maxLength={summaryMaxLength}
                {...summaryField}
            />
            <ResourcesInput
                fieldPrefix={fieldPrefix}
                helpText={t('app.createDao.createProcessForm.metadata.resources.helpText', { type: typeLabel })}
                name="resources"
            />
        </div>
    );
};
