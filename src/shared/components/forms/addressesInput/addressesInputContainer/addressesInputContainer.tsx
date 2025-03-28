import { useTranslations } from '@/shared/components/translationsProvider';
import {
    Button,
    type ICompositeAddress,
    IconType,
    type IInputComponentProps,
    InputContainer,
} from '@aragon/gov-ui-kit';
import { Children, cloneElement, type ComponentProps, isValidElement } from 'react';
import { useFieldArray } from 'react-hook-form';
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
}

export type AddressListInputBaseForm = Record<string, ICompositeAddress[]>;

export const AddressesInputContainer: React.FC<IAddressesInputContainerProps> = (props) => {
    const { children, fieldPrefix, name, allowEmptyList, onAddClick, label, helpText } = props;

    const { t } = useTranslations();

    const membersFieldName = fieldPrefix ? `${fieldPrefix}.${name}` : name;

    const {
        fields: membersField,
        append: addMember,
        remove: removeMember,
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
            <div className="flex w-full grow flex-col gap-6">
                <InputContainer
                    id="addresses"
                    label={label}
                    helpText={helpText}
                    useCustomWrapper={true}
                    className="gap-3 md:gap-2"
                >
                    {childrenWithKeys}
                </InputContainer>
                <Button
                    size="md"
                    variant="tertiary"
                    className="w-fit"
                    iconLeft={IconType.PLUS}
                    onClick={handleAddMember}
                >
                    {t('app.shared.addressesInput.container.add')}
                </Button>
            </div>
        </AddressesInputContextProvider>
    );
};
