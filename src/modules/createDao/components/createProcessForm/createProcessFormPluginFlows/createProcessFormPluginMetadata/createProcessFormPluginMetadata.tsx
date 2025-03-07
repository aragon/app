import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, TextArea } from '@aragon/gov-ui-kit';
import type { ICreateProcessFormBody } from '../../createProcessFormDefinitions';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormPluginMetadataProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormPluginMetadata: React.FC<ICreateProcessFormPluginMetadataProps> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();
    const keyNamespace = 'app.createDao.createProcessForm.pluginMetadata';

    const bodyNameField = useFormField<ICreateProcessFormBody, `name`>(`name`, {
        label: t(`${keyNamespace}.bodyNameFieldLabel`),
        defaultValue: '',
        fieldPrefix,
        trimOnBlur: true,
        rules: { required: true },
    });

    const bodySummaryField = useFormField<ICreateProcessFormBody, 'description'>('description', {
        label: t(`${keyNamespace}.bodySummaryFieldLabel`),
        fieldPrefix,
        defaultValue: '',
    });

    return (
        <>
            <InputText maxLength={40} {...bodyNameField} />
            <TextArea
                helpText={t(`${keyNamespace}.bodySummaryFieldHelpText`)}
                isOptional={true}
                maxLength={480}
                {...bodySummaryField}
            />
            <ResourcesInput name={`${fieldPrefix}.resources`} helpText={t(`${keyNamespace}.resourcesInputHelpText`)} />
        </>
    );
};
