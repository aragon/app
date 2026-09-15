import { InputText, TextArea } from '@aragon/gov-ui-kit';
import { AvatarInput } from '@/shared/components/forms/avatarInput';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ICreateWorkspaceFormData } from '../createWorkspaceFormDefinitions';

export interface ICreateWorkspaceFormMetadataProps {
    /**
     * Prefix to prepend to all the metadata form fields.
     */
    fieldPrefix?: string;
}

const nameMaxLength = 128;
const descriptionMaxLength = 480;

export const CreateWorkspaceFormMetadata: React.FC<
    ICreateWorkspaceFormMetadataProps
> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();

    const nameField = useFormField<ICreateWorkspaceFormData, 'name'>('name', {
        label: t('app.workspace.createWorkspaceForm.metadata.name.label'),
        fieldPrefix,
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const descriptionField = useFormField<
        ICreateWorkspaceFormData,
        'description'
    >('description', {
        label: t(
            'app.workspace.createWorkspaceForm.metadata.description.label',
        ),
        fieldPrefix,
        rules: { maxLength: descriptionMaxLength },
        trimOnBlur: true,
        sanitizeMode: 'multiline',
        defaultValue: '',
    });

    return (
        <div className="flex flex-col gap-10">
            <InputText maxLength={nameMaxLength} {...nameField} />
            <AvatarInput fieldPrefix={fieldPrefix} name="avatar" />
            <TextArea
                helpText={t(
                    'app.workspace.createWorkspaceForm.metadata.description.helpText',
                )}
                isOptional={true}
                maxLength={descriptionMaxLength}
                {...descriptionField}
                value={
                    (descriptionField.value as string | null | undefined) ?? ''
                }
            />
            <ResourcesInput
                fieldPrefix={fieldPrefix}
                helpText={t(
                    'app.workspace.createWorkspaceForm.metadata.resources.helpText',
                )}
                name="resources"
            />
        </div>
    );
};
