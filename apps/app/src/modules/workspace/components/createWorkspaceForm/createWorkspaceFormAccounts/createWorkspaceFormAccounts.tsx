import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useFieldArray } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    createWorkspaceFormEmptyNetworkAddress,
    type ICreateWorkspaceFormAccount,
} from '../createWorkspaceFormDefinitions';
import { CreateWorkspaceFormAccountsItem } from './createWorkspaceFormAccountsItem';

export interface ICreateWorkspaceFormAccountsProps {
    /**
     * Prefix to prepend to the accounts form field.
     */
    fieldPrefix?: string;
}

export type CreateWorkspaceFormAccountsBaseForm = Record<
    string,
    ICreateWorkspaceFormAccount[]
>;

const fieldName = 'accounts';

export const CreateWorkspaceFormAccounts: React.FC<
    ICreateWorkspaceFormAccountsProps
> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();

    const accountsFieldName = fieldPrefix
        ? `${fieldPrefix}.${fieldName}`
        : fieldName;

    const { fields, append, remove } =
        useFieldArray<CreateWorkspaceFormAccountsBaseForm>({
            name: accountsFieldName,
        });

    // The first account row comes from the form default values, see `createWorkspaceFormDefaultValues`.
    const handleAddAccount = () =>
        append(createWorkspaceFormEmptyNetworkAddress);

    return (
        <div className="flex flex-col gap-3">
            <InputContainer
                className="gap-3"
                helpText={t(
                    'app.workspace.createWorkspaceForm.accounts.helpText',
                )}
                id="workspaceAccounts"
                label={t('app.workspace.createWorkspaceForm.accounts.label')}
                useCustomWrapper={true}
            >
                {fields.map((field, index) => (
                    <CreateWorkspaceFormAccountsItem
                        disableRemove={fields.length === 1}
                        index={index}
                        key={field.id}
                        name={accountsFieldName}
                        remove={remove}
                    />
                ))}
            </InputContainer>
            <Button
                className="w-fit"
                iconLeft={IconType.PLUS}
                onClick={handleAddAccount}
                size="md"
                variant="tertiary"
            >
                {t('app.workspace.createWorkspaceForm.accounts.add')}
            </Button>
        </div>
    );
};
