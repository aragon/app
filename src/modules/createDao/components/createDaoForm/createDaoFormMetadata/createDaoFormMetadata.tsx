import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, TextArea } from '@aragon/ods';
import type { ICreateDaoFormData } from '../createDaoFormDefinitions';

export interface ICreateDaoFormMetadataProps {
    /**
     * Prefix to prepend to all the metadata form fields.
     */
    fieldPrefix?: string;
}

const nameMaxLength = 128;

export const CreateDaoFormMetadata: React.FC<ICreateDaoFormMetadataProps> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();

    const nameField = useFormField<ICreateDaoFormData, 'name'>('name', {
        label: t('app.createDao.createDaoForm.metadata.name.label'),
        fieldPrefix,
        rules: { required: true },
        defaultValue: '',
    });

    const descriptionField = useFormField<ICreateDaoFormData, 'description'>('description', {
        label: t('app.createDao.createDaoForm.metadata.description.label'),
        fieldPrefix,
        rules: { required: true },
        defaultValue: '',
    });

    return (
        <div className="flex flex-col gap-10">
            <InputText
                helpText={t('app.createDao.createDaoForm.metadata.name.helpText', { max: nameMaxLength })}
                placeholder={t('app.createDao.createDaoForm.metadata.name.placeholder')}
                maxLength={nameMaxLength}
                {...nameField}
            />
            <TextArea
                helpText={t('app.createDao.createDaoForm.metadata.description.helpText')}
                placeholder={t('app.createDao.createDaoForm.metadata.description.placeholder')}
                {...descriptionField}
            />
        </div>
    );
};
