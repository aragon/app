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
        label: 'Summary',
        defaultValue: '',
    });

    return (
        <div className="flex flex-col gap-10">
            <InputText
                helpText="Give your governance process a name, so member can differentiate it."
                placeholder="Type a name"
                maxLength={128}
                {...nameField}
            />
            <InputText
                helpText="Define a prefix for this governance process to have an unique ID. Something like DPF, which leads to PDF-42 and counting up for each proposal."
                placeholder="Type an ID"
                maxLength={5}
                addon="-42"
                addonPosition="right"
                {...idField}
            />
            <TextArea
                helpText="Summarize your governance process in 2-3 sentences. This gives your voters a sense of the governance process and will help members to understand."
                placeholder={t('app.governance.createProcessForm.metadata.summary.placeholder')}
                isOptional={true}
                maxLength={480}
                {...summaryField}
            />
            <ResourcesInput
                name="resources"
                helpText={t('app.governance.createProcessForm.metadata.resources.helpText')}
            />
        </div>
    );
};
