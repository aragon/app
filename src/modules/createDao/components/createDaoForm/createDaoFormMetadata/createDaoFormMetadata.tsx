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

    const handleFileError = (error: InputFileAvatarError) => {
        let message = '';
        switch (error) {
            case InputFileAvatarError.SQUARE_ONLY:
                message = t('app.createDao.createDaoForm.metadata.logo.error.squareOnly');
                break;
            case InputFileAvatarError.WRONG_DIMENSION:
                message = t('app.createDao.createDaoForm.metadata.logo.error.wrongDimension');
                break;
            case InputFileAvatarError.FILE_INVALID_TYPE:
                message = t('app.createDao.createDaoForm.metadata.logo.error.invalidType');
                break;
            case InputFileAvatarError.TOO_MANY_FILES:
                message = t('app.createDao.createDaoForm.metadata.logo.error.tooManyFiles');
                break;
            case InputFileAvatarError.FILE_TOO_LARGE:
                message = t('app.createDao.createDaoForm.metadata.logo.error.tooLarge');
                break;
            default:
                message = t('app.createDao.createDaoForm.metadata.logo.error.unknownError');
        }

        setLogoAlert({ message, variant: 'warning' });
    };

    const handleFileSuccess = () => {
        // Clear the alert when there's no error
        setLogoAlert(undefined);
        //TODO: handle ipfs pinning
    };
    const nameField = useFormField<ICreateDaoFormData, 'name'>('name', {
        label: t('app.createDao.createDaoForm.metadata.name.label'),
        fieldPrefix,
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const logoField = useFormField<ICreateDaoFormData, 'logo'>('logo', {
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
                onFileSelect={handleFileSuccess}
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
