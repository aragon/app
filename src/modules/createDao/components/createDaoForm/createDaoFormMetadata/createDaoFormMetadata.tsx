import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputFileAvatar, InputFileAvatarError, InputText, TextArea } from '@aragon/gov-ui-kit';
import type { ICreateDaoFormData } from '../createDaoFormDefinitions';
import { useState } from 'react';

export interface ICreateDaoFormMetadataProps {
    /**
     * Prefix to prepend to all the metadata form fields.
     */
    fieldPrefix?: string;
}

const nameMaxLength = 128;
const descriptionMaxLength = 480;

export const CreateDaoFormMetadata: React.FC<ICreateDaoFormMetadataProps> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();

    const [logoAlert, setLogoAlert] = useState<{ message: string; variant: 'warning' } | undefined>(undefined);

    const maxFileSize = 3 * 1024 * 1024; // 3 MB in bytes

    // Map error types to translations
    const errorMessages: Record<InputFileAvatarError, string> = {
        [InputFileAvatarError.SQUARE_ONLY]: t('app.createDao.createDaoForm.metadata.logo.error.squareOnly'),
        [InputFileAvatarError.WRONG_DIMENSION]: t('app.createDao.createDaoForm.metadata.logo.error.wrongDimension'),
        [InputFileAvatarError.FILE_INVALID_TYPE]: t('app.createDao.createDaoForm.metadata.logo.error.invalidType'),
        [InputFileAvatarError.TOO_MANY_FILES]: t('app.createDao.createDaoForm.metadata.logo.error.tooManyFiles'),
        [InputFileAvatarError.FILE_TOO_LARGE]: t('app.createDao.createDaoForm.metadata.logo.error.tooLarge'),
        [InputFileAvatarError.UNKNOWN_ERROR]: t('app.createDao.createDaoForm.metadata.logo.error.unknownError'),
    };

    const handleFileError = (error: InputFileAvatarError) => {
        const message = errorMessages[error];
        setLogoAlert({ message, variant: 'warning' });
    };

    const nameField = useFormField<ICreateDaoFormData, 'name'>('name', {
        label: t('app.createDao.createDaoForm.metadata.name.label'),
        fieldPrefix,
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const {
        value: logoValue,
        onChange: onFileChange,
        ...logoField
    } = useFormField<ICreateDaoFormData, 'logo'>('logo', {
        label: t('app.createDao.createDaoForm.metadata.logo.label'),
        fieldPrefix,
    });

    const descriptionField = useFormField<ICreateDaoFormData, 'description'>('description', {
        label: t('app.createDao.createDaoForm.metadata.description.label'),
        fieldPrefix,
        rules: { maxLength: descriptionMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    return (
        <div className="flex flex-col gap-10">
            <InputText
                helpText={t('app.createDao.createDaoForm.metadata.name.helpText')}
                placeholder={t('app.createDao.createDaoForm.metadata.name.placeholder')}
                maxLength={nameMaxLength}
                {...nameField}
            />
            <InputFileAvatar
                helpText={t('app.createDao.createDaoForm.metadata.logo.helpText')}
                maxDimension={1024}
                maxFileSize={maxFileSize}
                isOptional={true}
                onFileError={handleFileError}
                onFileSelect={(value) => {
                    // clear previous error if there was one
                    setLogoAlert(undefined);
                    onFileChange(value);
                }}
                alert={logoAlert}
                {...logoField}
            />
            <TextArea
                helpText={t('app.createDao.createDaoForm.metadata.description.helpText')}
                placeholder={t('app.createDao.createDaoForm.metadata.description.placeholder')}
                maxLength={descriptionMaxLength}
                isOptional={true}
                {...descriptionField}
            />
            <ResourcesInput
                name="resources"
                fieldPrefix={fieldPrefix}
                helpText={t('app.createDao.createDaoForm.metadata.resources.helpText')}
            />
        </div>
    );
};
