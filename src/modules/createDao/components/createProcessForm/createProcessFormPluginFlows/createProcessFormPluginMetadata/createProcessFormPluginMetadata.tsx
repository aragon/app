import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, TextArea } from '@aragon/gov-ui-kit';
import type { ICreateProcessFormBody } from '../../createProcessFormDefinitions';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormPluginMetadataProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormPluginMetadata: React.FC<ICreateProcessFormPluginMetadataProps> = (props) => {
    const { fieldPrefix } = props;

    const bodyNameField = useFormField<ICreateProcessFormBody, `name`>(`name`, {
        label: 'Body name',
        defaultValue: '',
        fieldPrefix,
        trimOnBlur: true,
        rules: { required: true },
    });

    const bodySummaryField = useFormField<ICreateProcessFormBody, 'description'>('description', {
        label: 'Description',
        fieldPrefix,
        defaultValue: '',
    });

    return (
        <>
            <InputText maxLength={40} label="Body name" placeholder="" {...bodyNameField} />
            <TextArea
                helpText="This is shown on the members list to help visitors understand what the body is responsible for."
                placeholder=""
                isOptional={true}
                maxLength={480}
                {...bodySummaryField}
            />
            <ResourcesInput
                name={`${fieldPrefix}.resources`}
                helpText="These are shown as links on the members list."
            />
        </>
    );
};
