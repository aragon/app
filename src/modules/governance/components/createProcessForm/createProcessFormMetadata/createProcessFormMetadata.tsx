import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, TextArea } from '@aragon/ods';
import type { ICreateProcessFormData } from '../createProcessFormDefinitions';

export interface ICreateProcessFormMetadataProps {}

export const CreateProcessFormMetadata: React.FC<ICreateProcessFormMetadataProps> = () => {
    const nameField = useFormField<ICreateProcessFormData, 'processName'>('processName', {
        label: 'Name',
        trimOnBlur: true,
        rules: { required: true },
        defaultValue: '',
    });

    const idField = useFormField<ICreateProcessFormData, 'processId'>('processId', {
        label: 'ID',
        trimOnBlur: true,
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
                addon={idField.value != '' ? '-01' : undefined}
                addonPosition="right"
                {...idField}
                onChange={(e) => {
                    const upperValue = e.target.value.toUpperCase();
                    idField.onChange({
                        ...e,
                        target: {
                            ...e.target,
                            value: upperValue,
                        },
                    });
                }}
            />
            <TextArea
                helpText="Summarize your governance process in 2-3 sentences. This gives your voters a sense of the governance process and will help members to understand."
                placeholder="Type a summary"
                isOptional={true}
                maxLength={480}
                {...summaryField}
            />
            <ResourcesInput
                name="resources"
                helpText="Add any additional external resources that help members understand the governance process."
            />
        </div>
    );
};
