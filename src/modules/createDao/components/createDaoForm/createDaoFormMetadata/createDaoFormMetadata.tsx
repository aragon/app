import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    type IInputContainerAlert,
    type IInputFileAvatarValue,
    InputFileAvatar,
    InputFileAvatarError,
    InputText,
    TextArea,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { ICreateDaoFormData } from '../createDaoFormDefinitions';

export interface ICreateDaoFormMetadataProps {
    /**
     * Prefix to prepend to all the metadata form fields.
     */
    fieldPrefix?: string;
}

const nameMaxLength = 128;
const descriptionMaxLength = 480;
const maxFileSize = 3 * 1024 * 1024; // 3 MB in bytes

export const CreateDaoFormMetadata: React.FC<ICreateDaoFormMetadataProps> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();

    const { setValue } = useFormContext();

    const [avatarAlert, setAvatarAlert] = useState<IInputContainerAlert | undefined>(undefined);

    const getFieldName = (field: string): string => {
        return fieldPrefix ? `${fieldPrefix}.${field}` : field;
    };

    // Map error types to translations
    const errorMessages: Record<InputFileAvatarError, string> = {
        [InputFileAvatarError.SQUARE_ONLY]: t('app.createDao.createDaoForm.metadata.avatar.error.squareOnly'),
        [InputFileAvatarError.WRONG_DIMENSION]: t('app.createDao.createDaoForm.metadata.avatar.error.wrongDimension'),
        [InputFileAvatarError.FILE_INVALID_TYPE]: t('app.createDao.createDaoForm.metadata.avatar.error.invalidType'),
        [InputFileAvatarError.TOO_MANY_FILES]: t('app.createDao.createDaoForm.metadata.avatar.error.tooManyFiles'),
        [InputFileAvatarError.FILE_TOO_LARGE]: t('app.createDao.createDaoForm.metadata.avatar.error.tooLarge'),
        [InputFileAvatarError.UNKNOWN_ERROR]: t('app.createDao.createDaoForm.metadata.avatar.error.unknownError'),
    };

    const handleAvatarError = (error: InputFileAvatarError) => {
        const message = errorMessages[error];
        setAvatarAlert({ message, variant: 'critical' });
    };

    const onFileChange = (newFile?: IInputFileAvatarValue) => {
        setValue(getFieldName('avatar'), { url: newFile?.url, file: newFile?.file });
        setAvatarAlert(undefined);
    };

    const nameField = useFormField<ICreateDaoFormData, 'name'>('name', {
        label: t('app.createDao.createDaoForm.metadata.name.label'),
        fieldPrefix,
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const avatarField = useFormField<ICreateDaoFormData, 'avatar'>('avatar', {
        label: t('app.createDao.createDaoForm.metadata.avatar.label'),
        fieldPrefix,
    });

    const descriptionField = useFormField<ICreateDaoFormData, 'description'>('description', {
        label: t('app.createDao.createDaoForm.metadata.description.label'),
        fieldPrefix,
        rules: { maxLength: descriptionMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    // @ts-expect-error complaining because LocalInputFileAvatarValue can be undefined
    const avatarValue = useWatch<ICreateDaoFormData['avatar']>({
        name: getFieldName('avatar'),
    });

    // This is needed to get the existing DAO logo for the image preview
    const parsedAvatarValue = typeof avatarValue === 'string' ? { url: ipfsUtils.cidToSrc(avatarValue) } : avatarValue;

    return (
        <div className="flex flex-col gap-10">
            <InputText
                helpText={t('app.createDao.createDaoForm.metadata.name.helpText')}
                placeholder={t('app.createDao.createDaoForm.metadata.name.placeholder')}
                maxLength={nameMaxLength}
                {...nameField}
            />
            <InputFileAvatar
                {...avatarField}
                value={parsedAvatarValue}
                onChange={onFileChange}
                helpText={t('app.createDao.createDaoForm.metadata.avatar.helpText')}
                maxDimension={1024}
                maxFileSize={maxFileSize}
                isOptional={true}
                onFileError={handleAvatarError}
                alert={avatarAlert}
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
