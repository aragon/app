import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, TextArea } from '@aragon/ods';

export interface ICreateDaoFormMetadataProps {
    /**
     * Prefiex to prepend to all the metadata form fields.
     */
    fieldPrefix?: string;
}

export const CreateDaoFormMetadata: React.FC<ICreateDaoFormMetadataProps> = (props) => {
    const { fieldPrefix } = props;

    const nameField = useFormField('name', {
        label: 'Name',
        fieldPrefix,
        rules: { required: true },
        defaultValue: '',
    });

    const descriptionField = useFormField('description', {
        label: 'Description',
        fieldPrefix,
        rules: { required: true },
        defaultValue: '',
    });

    return (
        <div className="flex flex-col gap-10">
            <InputText
                helpText="Maximum of 128 characters"
                placeholder="Name of the DAO"
                maxLength={128}
                {...nameField}
            />
            <TextArea
                helpText="Describe your DAO's purpose in a few sentences. This is listed on the Explore page so new contributors can find you."
                placeholder="Description of the DAO"
                {...descriptionField}
            />
        </div>
    );
};
