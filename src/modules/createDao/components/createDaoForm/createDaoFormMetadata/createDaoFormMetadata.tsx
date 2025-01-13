import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    type IInputContainerAlert,
    type IInputFileAvatarValue,
    InputFileAvatar,
    type InputFileAvatarError,
    InputText,
    TextArea,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { ICreateDaoFormData } from '../createDaoFormDefinitions';

export interface ICreateDaoFormMetadataProps {
    /**
     * Prefix to prepend to all the metadata form fields.
     */
    fieldPrefix?: string;
}

const nameMaxLength = 128;
const descriptionMaxLength = 480;
const maxAvatarFileSize = 3 * 1024 * 1024; // 3 MB in bytes
const maxAvatarDimension = 1024;

export const CreateDaoFormMetadata: React.FC<ICreateDaoFormMetadataProps> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();

    const [avatarAlert, setAvatarAlert] = useState<IInputContainerAlert | undefined>(undefined);

    const handleAvatarError = (error: InputFileAvatarError) => {
        const message = t(`app.createDao.createDaoForm.metadata.avatar.error.${error}`);
        setAvatarAlert({ message, variant: 'critical' });
    };

    const onFileChange = (newFile?: IInputFileAvatarValue) => {
        onAvatarChange({ url: newFile?.url, file: newFile?.file });
        setAvatarAlert(undefined);
    };

    const nameField = useFormField<ICreateDaoFormData, 'name'>('name', {
        label: t('app.createDao.createDaoForm.metadata.name.label'),
        fieldPrefix,
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const {
        value: avatarValue,
        onChange: onAvatarChange,
        ...avatarField
    } = useFormField<ICreateDaoFormData, 'avatar'>('avatar', {
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
                maxDimension={maxAvatarDimension}
                maxFileSize={maxAvatarFileSize}
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
