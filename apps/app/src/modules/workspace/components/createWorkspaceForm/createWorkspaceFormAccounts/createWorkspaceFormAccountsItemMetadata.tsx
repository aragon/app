import { Heading, InputText, TextArea } from '@aragon/gov-ui-kit';
import { AvatarInput } from '@/shared/components/forms/avatarInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

export interface ICreateWorkspaceFormAccountsItemMetadataProps {
    /**
     * Name of the metadata field of the account, e.g. `accounts.0.metadata`.
     */
    name: string;
}

type AccountMetadataBaseForm = Record<string, string>;

const nameMaxLength = 128;
const descriptionMaxLength = 480;

/**
 * Optional metadata fields of a workspace account. Only rendered when the user opens the metadata section, so that
 * accounts without metadata register no metadata fields at all.
 */
export const CreateWorkspaceFormAccountsItemMetadata: React.FC<
    ICreateWorkspaceFormAccountsItemMetadataProps
> = (props) => {
    const { name } = props;

    const { t } = useTranslations();

    const nameField = useFormField<AccountMetadataBaseForm, string>(
        `${name}.name`,
        {
            label: t(
                'app.workspace.createWorkspaceForm.accounts.metadata.name.label',
            ),
            rules: { required: true, maxLength: nameMaxLength },
            trimOnBlur: true,
            defaultValue: '',
        },
    );

    const descriptionField = useFormField<AccountMetadataBaseForm, string>(
        `${name}.description`,
        {
            label: t(
                'app.workspace.createWorkspaceForm.accounts.metadata.description.label',
            ),
            rules: { maxLength: descriptionMaxLength },
            trimOnBlur: true,
            sanitizeMode: 'multiline',
            defaultValue: '',
        },
    );

    return (
        <div className="flex flex-col gap-6 border-neutral-100 border-t pt-4">
            <Heading as="h4" size="h5">
                {t('app.workspace.createWorkspaceForm.accounts.metadata.title')}
            </Heading>
            <AvatarInput fieldPrefix={name} name="avatar" />
            <InputText maxLength={nameMaxLength} {...nameField} />
            <TextArea
                isOptional={true}
                maxLength={descriptionMaxLength}
                {...descriptionField}
                value={
                    (descriptionField.value as string | null | undefined) ?? ''
                }
            />
        </div>
    );
};
