import { Button, Card, Dropdown, IconType } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import { CreateWorkspaceFormNetworkAddressFields } from '../createWorkspaceFormNetworkAddressFields';
import { CreateWorkspaceFormAccountsItemMetadata } from './createWorkspaceFormAccountsItemMetadata';

export interface ICreateWorkspaceFormAccountsItemProps {
    /**
     * Name of the accounts field-array.
     */
    name: string;
    /**
     * Index of the account in the list.
     */
    index: number;
    /**
     * Callback to remove the account from the list.
     */
    remove: (index: number) => void;
    /**
     * Disables the remove action when set to true, used to enforce at least one account.
     */
    disableRemove?: boolean;
}

export const CreateWorkspaceFormAccountsItem: React.FC<
    ICreateWorkspaceFormAccountsItemProps
> = (props) => {
    const { name, index, remove, disableRemove } = props;

    const { t } = useTranslations();

    const { getValues, setValue } = useFormContext();

    const metadataFieldName = `${name}.${index.toString()}.metadata`;

    const [showMetadata, setShowMetadata] = useState(
        () => getValues(metadataFieldName) != null,
    );

    const handleToggleMetadata = () => {
        if (showMetadata) {
            // Clear the block so that an account the user decided not to describe stores no metadata at all.
            setValue(metadataFieldName, undefined, { shouldDirty: true });
        }

        setShowMetadata(!showMetadata);
    };

    return (
        <Card className="flex flex-col gap-4 border border-neutral-100 p-6 shadow-neutral-sm">
            <div className="flex items-start gap-3">
                <div className="min-w-0 grow">
                    <CreateWorkspaceFormNetworkAddressFields
                        index={index}
                        listName={name}
                        validateAccount={true}
                    />
                </div>
                <div className="mt-0 md:mt-9">
                    <Dropdown.Container
                        constrainContentWidth={false}
                        customTrigger={
                            <Button
                                iconLeft={IconType.DOTS_VERTICAL}
                                size="lg"
                                variant="tertiary"
                            />
                        }
                        size="md"
                    >
                        <Dropdown.Item
                            disabled={disableRemove}
                            onClick={() => remove(index)}
                        >
                            {t(
                                'app.workspace.createWorkspaceForm.accounts.remove',
                            )}
                        </Dropdown.Item>
                    </Dropdown.Container>
                </div>
            </div>

            <Button
                className="w-fit"
                iconLeft={showMetadata ? IconType.CLOSE : IconType.PLUS}
                onClick={handleToggleMetadata}
                size="sm"
                variant="tertiary"
            >
                {t(
                    `app.workspace.createWorkspaceForm.accounts.metadata.${showMetadata ? 'hide' : 'show'}`,
                )}
            </Button>

            {showMetadata && (
                <CreateWorkspaceFormAccountsItemMetadata
                    name={metadataFieldName}
                />
            )}
        </Card>
    );
};
