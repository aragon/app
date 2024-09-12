import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, TextArea } from '@aragon/ods';
import type { ICreateProcessFormData } from '../createProcessFormDefinitions';

export interface ICreateProcessFormMetadataProps {}

export const CreateProcessFormMetadata: React.FC<ICreateProcessFormMetadataProps> = () => {
    const { t } = useTranslations();

    const nameField = useFormField<ICreateProcessFormData, 'name'>('name', {
        label: 'Name',
        rules: { required: true },
        defaultValue: '',
    });

    const idField = useFormField<ICreateProcessFormData, 'id'>('id', {
        label: 'ID',
        rules: { required: true },
        defaultValue: '',
    });

    const summaryField = useFormField<ICreateProcessFormData, 'summary'>('summary', {
        label: t('app.governance.createProcessForm.metadata.summary.title'),
    });

    return (
        <div className="flex flex-col gap-10">
            {/* <InputText
                helpText={t('app.governance.createProcessForm.metadata.title.helpText')}
                placeholder="Give your governance process a name, so member can differenciate it."
                maxLength={128}
                {...nameField}
            />
            <InputText
                helpText="Define a prefix for this governance process to have an unique ID. Something like DPF, which leads to PDF-42 and counting up for each proposal."
                placeholder="Type an ID"
                maxLength={5}
                {...idField}
            />
            <TextArea
                helpText={t('app.governance.createProcessForm.metadata.summary.helpText')}
                placeholder={t('app.governance.createProcessForm.metadata.summary.placeholder')}
                isOptional={true}
                maxLength={480}
                {...summaryField}
            />
            <ResourcesInput
                name="resources"
                helpText={t('app.governance.createProcessForm.metadata.resources.helpText')}
            /> */}
        </div>
    );
};
