import {
    Button,
    Dropdown,
    type ICompositeAddress,
    IconType,
    type IInputComponentProps,
    InputContainer,
} from '@aragon/gov-ui-kit';
import {
    Children,
    type ComponentProps,
    cloneElement,
    isValidElement,
} from 'react';
import { useFieldArray } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AddressesInputContextProvider } from '../addressesInputContext';

export interface IAddressesInputContainerProps
    extends ComponentProps<'div'>,
        Pick<IInputComponentProps, 'label' | 'helpText'> {
    /**
     * The prefix of the field in the form.
     */
    fieldPrefix?: string;
    /**
     * The name of the field in the form.
     */
    name: string;
    /**
     * Flag to determine if the list can be empty.
     */
    allowEmptyList?: boolean;
    /**
     * Callback to overwrite the general add button behavior.
     */
    onAddClick?: () => void;
    /**
     * Whether to show the "Reset all" option in the more actions menu.
     */
    showResetAllAction?: boolean;
}

export type AddressListInputBaseForm = Record<string, ICompositeAddress[]>;

export const AddressesInputContainer: React.FC<
    IAddressesInputContainerProps
> = (props) => {
    const {
        children,
        fieldPrefix,
        name,
        allowEmptyList,
        onAddClick,
        label,
        helpText,
        showResetAllAction = true,
    } = props;

    const { t } = useTranslations();

    const membersFieldName = fieldPrefix ? `${fieldPrefix}.${name}` : name;

    const {
        fields: membersField,
        append: addMember,
        remove: removeMember,
        replace: replaceMembers,
    } = useFieldArray<AddressListInputBaseForm>({
        name: membersFieldName,
    });

    const handleRemoveMember = (index: number) => {
        if (allowEmptyList) {
            removeMember(index);
        } else if (membersField.length > 1) {
            removeMember(index);
        }
    };

    const handleAddMember = () => {
        if (onAddClick) {
            onAddClick();
        } else {
            addMember({ address: '' });
        }
    };

    const handleResetAllMembers = () => {
        if (membersField.length === 0) {
            return;
        }

        replaceMembers(
            membersField.map(() => ({
                address: '',
            })),
        );
    };

    const handleRemoveAllMembers = () => {
        if (membersField.length === 0) {
            return;
        }

        replaceMembers([]);
    };

    const contextValue = {
        fieldName: membersFieldName,
        onRemoveMember: handleRemoveMember,
    };

    // This is needed because in the parent we are using, useWatch, but this hook
    // does not expose the RHF IDs of the fields, which results in the lists being
    // out of sync when removing items, so here we append the key to each child element
    const childrenWithKeys = Children.map(children, (child, index) => {
        if (isValidElement(child) && index < membersField.length) {
            const fieldId = membersField[index].id;

            return cloneElement(child, {
                key: fieldId,
                ...(child.props as object),
            });
        }
        return null;
    });

    return (
        <AddressesInputContextProvider value={contextValue}>
            <div className="flex w-full shrink-0 grow flex-col gap-3">
                <InputContainer
                    className="gap-3"
                    helpText={helpText}
                    id="addresses"
                    label={label}
                    useCustomWrapper={true}
                >
                    {childrenWithKeys}
                </InputContainer>
                <div className="flex w-full justify-between">
                    <Button
                        className="w-fit"
                        iconLeft={IconType.PLUS}
                        onClick={handleAddMember}
                        responsiveSize={{ md: 'md' }}
                        size="sm"
                        variant="secondary"
                    >
                        {t('app.shared.addressesInput.container.add')}
                    </Button>
                    {membersField.length > 1 && (
                        <Dropdown.Container
                            align="end"
                            customTrigger={
                                <Button
                                    iconRight={IconType.DOTS_VERTICAL}
                                    responsiveSize={{ md: 'md' }}
                                    size="sm"
                                    variant="tertiary"
                                >
                                    {t(
                                        'app.shared.addressesInput.container.more',
                                    )}
                                </Button>
                            }
                        >
                            {showResetAllAction && (
                                <Dropdown.Item onClick={handleResetAllMembers}>
                                    {t(
                                        'app.shared.addressesInput.container.resetAll',
                                    )}
                                </Dropdown.Item>
                            )}
                            <Dropdown.Item onClick={handleRemoveAllMembers}>
                                {t(
                                    'app.shared.addressesInput.container.removeAll',
                                )}
                            </Dropdown.Item>
                        </Dropdown.Container>
                    )}
                </div>
            </div>
        </AddressesInputContextProvider>
    );
};
