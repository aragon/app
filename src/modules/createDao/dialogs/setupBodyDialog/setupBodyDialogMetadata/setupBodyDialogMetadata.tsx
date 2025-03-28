import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, TextArea } from '@aragon/gov-ui-kit';
import type { ISetupBodyForm } from '../setupBodyDialogDefinitions';

export interface ISetupBodyDialogMetadataProps {}

const nameMaxLength = 40;
const summaryMaxLength = 480;

export const SetupBodyDialogMetadata: React.FC<ISetupBodyDialogMetadataProps> = () => {
    const { t } = useTranslations();

    const nameField = useFormField<ISetupBodyForm, 'name'>('name', {
        label: t('app.createDao.setupBodyDialog.metadata.name.label'),
        trimOnBlur: true,
        defaultValue: '',
        rules: { required: true },
    });

    const summaryField = useFormField<ISetupBodyForm, 'description'>('description', {
        label: t('app.createDao.setupBodyDialog.metadata.summary.label'),
        defaultValue: '',
    });

    return (
        <div className="flex flex-col gap-6">
            <InputText maxLength={nameMaxLength} {...nameField} />
            <TextArea
                helpText={t('app.createDao.setupBodyDialog.metadata.summary.helpText')}
                isOptional={true}
                maxLength={summaryMaxLength}
                {...summaryField}
            />
            <ResourcesInput
                name="resources"
                helpText={t('app.createDao.setupBodyDialog.metadata.resources.helpText')}
            />
        </div>
    );
};
