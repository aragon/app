import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { addressesListUtils } from '@/shared/utils/addressesListUtils';
import {
    AddressInput,
    addressUtils,
    Button,
    Card,
    Dropdown,
    IconType,
    type IAddressInputResolvedValue,
    type ICompositeAddress,
} from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useState, type ComponentProps } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { AddressListInputBaseForm } from '../addressesInputContainer/addressesInputContainer';
import { useAddressesInputContext } from '../addressesInputContext';

export interface IAddressesInputItemProps extends ComponentProps<'div'> {
    /**
     * The index of the member.
     */
    index: number;
    /**
     * Flag indicating if the input should be disabled.
     */
    disabled?: boolean;
    /**
     * Custom validator function that extends the default validation.
     */
    customValidator?: (member: IAddressInputResolvedValue) => string | true;
}

export const AddressesInputItem: React.FC<IAddressesInputItemProps> = (props) => {
    const { index, disabled, customValidator } = props;

    const { t } = useTranslations();

    const { trigger } = useFormContext();

    const { fieldName, onRemoveMember } = useAddressesInputContext();

    const membersField = useWatch<AddressListInputBaseForm>({ name: fieldName });

    const canRemove = membersField.length > 1;

    const memberFieldName = `${fieldName}.[${index.toString()}]`;
    const {
        value,
        onChange: onAddressChange,
        label,
        ...addressField
    } = useFormField<Record<string, ICompositeAddress>, string>(memberFieldName, {
        label: t('app.shared.addressesInput.item.input.label'),
        rules: {
            validate: (member) =>
                addressesListUtils.validateAddress(member.address, membersField, index, customValidator),
        },
    });

    const [addressInput, setAddressInput] = useState<string | undefined>(value.address);

    const handleAddressAccept = useCallback(
        (value?: IAddressInputResolvedValue) => onAddressChange({ address: value?.address, name: value?.name }),
        [onAddressChange],
    );

    // Only trigger already-in-list validation if value is a valid address to avoid displaying an error on mount.
    useEffect(() => {
        if (addressUtils.isAddress(value.address)) {
            void trigger(memberFieldName);
        }
    }, [trigger, memberFieldName, value.address]);

    return (
        <Card className="shadow-neutral-sm flex flex-col gap-3 border border-neutral-100 p-6 md:flex-row md:gap-2">
            <AddressInput
                onChange={setAddressInput}
                value={addressInput}
                onAccept={handleAddressAccept}
                placeholder={t('app.shared.addressesInput.item.input.placeholder')}
                disabled={disabled}
                {...addressField}
            />

            <Dropdown.Container
                constrainContentWidth={false}
                size="md"
                customTrigger={<Button variant="tertiary" size="lg" iconLeft={IconType.DOTS_VERTICAL} />}
                disabled={!canRemove}
            >
                <Dropdown.Item onClick={() => onRemoveMember(index)}>
                    {t('app.shared.addressesInput.item.remove')}
                </Dropdown.Item>
            </Dropdown.Container>
        </Card>
    );
};
