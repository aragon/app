import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils, Button, type ICompositeAddress, IconType } from '@aragon/gov-ui-kit';
import { Children, cloneElement, type ComponentProps, isValidElement, useMemo } from 'react';
import { type Control, useFieldArray, useWatch } from 'react-hook-form';
import { AddressesInputContextProvider } from '../addressesInputContext';

export interface IAddressesInputContainerProps extends ComponentProps<'div'> {
    /**
     * The prefix of the field in the form.
     */
    fieldPrefix?: string;
    /**
     * The name of the field in the form.
     */
    name: string;
    /**
     * The control object of the form.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control?: Control<any>;
    /**
     * Flag to determine if zero members are allowed in the list.
     */
    allowZeroMembers?: boolean;
}

export type AddressListInputBaseForm = Record<string, ICompositeAddress[]>;

export const AddressesInputContainer: React.FC<IAddressesInputContainerProps> = (props) => {
    const { children, fieldPrefix, name, control, allowZeroMembers } = props;

    const { t } = useTranslations();

    const membersFieldName = fieldPrefix ? `${fieldPrefix}.${name}` : name;

    const {
        fields: membersField,
        append: addMember,
        remove: removeMember,
    } = useFieldArray<AddressListInputBaseForm>({
        name: membersFieldName,
        control,
    });

    const watchMembersField = useWatch<AddressListInputBaseForm>({
        name: membersFieldName,
    });

    const controlledMembersField = useMemo(
        () => membersField.map((field, index) => ({ ...field, ...watchMembersField[index] })),
        [membersField, watchMembersField],
    );

    const handleRemoveMember = (index: number) => {
        if (allowZeroMembers) {
            removeMember(index);
        } else if (membersField.length > 1) {
            removeMember(index);
        }
    };

    const handleAddMember = () => addMember({ address: '' });

    const checkIsAlreadyInList = (index: number) =>
        controlledMembersField
            .slice(0, index)
            .some((field) => addressUtils.isAddressEqual(field.address, controlledMembersField[index].address));

    const contextValue = {
        fieldName: membersFieldName,
        onRemoveMember: handleRemoveMember,
        checkIsAlreadyInList,
        allowZeroMembers,
        membersField: controlledMembersField,
        addMember: handleAddMember,
    };

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
            <div className="flex w-full flex-col gap-3 md:gap-2">{childrenWithKeys}</div>
            <Button size="md" variant="tertiary" className="w-fit" iconLeft={IconType.PLUS} onClick={handleAddMember}>
                {t('app.shared.addressesInput.container.add')}
            </Button>
        </AddressesInputContextProvider>
    );
};
