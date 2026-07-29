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
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
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

const getNestedValue = (obj: unknown, path: string): unknown => {
    const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
    return normalizedPath
        .split('.')
        .filter(Boolean)
        .reduce<unknown>((acc, part) => {
            if (acc == null || typeof acc !== 'object') {
                return undefined;
            }
            return (acc as Record<string, unknown>)[part];
        }, obj);
};

const hasTruthyLeaf = (value: unknown): boolean => {
    if (value === true) {
        return true;
    }
    if (Array.isArray(value)) {
        return value.some(hasTruthyLeaf);
    }
    if (value != null && typeof value === 'object') {
        return Object.values(value as Record<string, unknown>).some(
            hasTruthyLeaf,
        );
    }
    return false;
};

const hasNestedValue = (value: unknown): boolean => {
    if (value == null) {
        return false;
    }
    if (Array.isArray(value)) {
        return value.some(hasNestedValue);
    }
    if (typeof value === 'object') {
        return Object.values(value as Record<string, unknown>).some(
            hasNestedValue,
        );
    }
    return true;
};

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
    const { formState } = useFormContext();

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

        if (allowEmptyList) {
            replaceMembers([]);
            return;
        }

        replaceMembers([{ address: '' }]);
    };

    const contextValue = {
        fieldName: membersFieldName,
        onRemoveMember: handleRemoveMember,
    };
    const watchedMembers = useWatch<AddressListInputBaseForm>({
        name: membersFieldName,
        defaultValue: [],
    });
    const hasDirtyMembers = hasTruthyLeaf(
        getNestedValue(formState.dirtyFields, membersFieldName),
    );
    const hasMemberErrors = hasNestedValue(
        getNestedValue(formState.errors, membersFieldName),
    );
    const hasNonEmptyMembers = watchedMembers.some(
        (member) => (member?.address ?? '').trim() !== '',
    );

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
                            {showResetAllAction &&
                                ((hasDirtyMembers && hasNonEmptyMembers) ||
                                    hasMemberErrors) && (
                                    <Dropdown.Item
                                        onClick={handleResetAllMembers}
                                    >
                                        {t(
                                            'app.shared.addressesInput.container.resetFields',
                                        )}
                                    </Dropdown.Item>
                                )}
                            <Dropdown.Item onClick={handleRemoveAllMembers}>
                                {t(
                                    'app.shared.addressesInput.container.clearAll',
                                )}
                            </Dropdown.Item>
                        </Dropdown.Container>
                    )}
                </div>
            </div>
        </AddressesInputContextProvider>
    );
};
