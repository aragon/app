import type { ICreateProcessFormBody } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, TextArea } from '@aragon/ods';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormPluginMetadataProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormPluginMetadata: React.FC<ICreateProcessFormPluginMetadataProps> = (props) => {
    const { fieldPrefix } = props;

    const bodyNameField = useFormField<ICreateProcessFormBody, `name`>(`name`, {
        label: 'Name',
        defaultValue: '',
        fieldPrefix,
        trimOnBlur: true,
        rules: { required: true },
    });

    const bodySummaryField = useFormField<ICreateProcessFormBody, 'description'>('description', {
        label: 'Summary',
        fieldPrefix,
        defaultValue: '',
    });

    return (
        <>
            <InputText maxLength={40} label="Body name" placeholder="Type a name" {...bodyNameField} />
            <TextArea
                helpText="Summarize your stage body in 2-3 sentences. This gives your members a sense of what the body will be responsible for."
                placeholder="Type a summary"
                isOptional={true}
                maxLength={480}
                {...bodySummaryField}
            />
            <ResourcesInput
                name={`${fieldPrefix}.resources`}
                helpText="Add any additional external resources that help members understand the purpose of this body."
            />
        </>
    );
};
