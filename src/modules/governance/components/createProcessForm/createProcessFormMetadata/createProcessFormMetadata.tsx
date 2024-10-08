import { useProcessFields } from '@/modules/governance/components/createProcessForm/hooks/useProcessFields';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { InputText, TextArea } from '@aragon/ods';

export interface ICreateProcessFormMetadataProps {}

export const CreateProcessFormMetadata: React.FC<ICreateProcessFormMetadataProps> = () => {
    const { nameField, idField, summaryField } = useProcessFields('process');

    return (
        <div className="flex flex-col gap-10">
            <InputText
                helpText="Give your governance process a name, so member can differentiate it."
                placeholder="Type a name"
                maxLength={18}
                {...nameField}
            />
            <InputText
                helpText="Define a prefix for this governance process to have an unique ID. Something like DPF, which leads to PDF-01 and counting up for each proposal."
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
                name="process.resources"
                helpText="Add any additional external resources that help members understand the governance process."
            />
        </div>
    );
};
