import {
    AddressInput,
    addressUtils,
    Button,
    Card,
    Dropdown,
    type IAddressInputResolvedValue,
    type ICompositeAddress,
    IconType,
} from '@aragon/gov-ui-kit';
import { type ComponentProps, useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { addressesListUtils } from '@/shared/utils/addressesListUtils';
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
    /**
     * Chain id used to build the explorer link for the address input.
     */
    chainId?: number;
}

export const AddressesInputItem: React.FC<IAddressesInputItemProps> = (
    props,
) => {
    const { index, disabled, customValidator, chainId } = props;

    const { t } = useTranslations();

    const { trigger } = useFormContext();

    const { fieldName, onRemoveMember } = useAddressesInputContext();

    const membersField = useWatch<AddressListInputBaseForm>({
        name: fieldName,
        defaultValue: [],
    });

    const canRemove = membersField.length > 1;

    const memberFieldName = `${fieldName}.[${index.toString()}]`;
    const {
        value,
        onChange: onAddressChange,
        label,
        ...addressField
    } = useFormField<Record<string, ICompositeAddress>, string>(
        memberFieldName,
        {
            label: t('app.shared.addressesInput.item.input.label'),
            rules: {
                required: true,
                validate: (member) =>
                    addressesListUtils.validateAddress(
                        member.address,
                        membersField,
                        index,
                        customValidator,
                    ),
            },
            sanitizeOnBlur: false,
        },
    );

    const [addressInput, setAddressInput] = useState<string | undefined>(
        value.address,
    );

    const handleAddressAccept = useCallback(
        (value?: IAddressInputResolvedValue) =>
            onAddressChange({ address: value?.address, name: value?.name }),
        [onAddressChange],
    );

    // Only trigger already-in-list validation if value is a valid address to avoid displaying an error on mount.
    useEffect(() => {
        if (addressUtils.isAddress(value.address)) {
            void trigger(memberFieldName);
        }
    }, [trigger, memberFieldName, value.address]);

    return (
        <Card className="flex flex-col gap-3 border border-neutral-100 p-6 shadow-neutral-sm md:flex-row md:gap-2">
            <AddressInput
                chainId={chainId}
                disabled={disabled}
                onAccept={handleAddressAccept}
                onChange={setAddressInput}
                placeholder={t(
                    'app.shared.addressesInput.item.input.placeholder',
                )}
                value={addressInput}
                {...addressField}
            />

            <Dropdown.Container
                constrainContentWidth={false}
                customTrigger={
                    <Button
                        iconLeft={IconType.DOTS_VERTICAL}
                        size="lg"
                        variant="tertiary"
                    />
                }
                disabled={!canRemove}
                size="md"
            >
                <Dropdown.Item onClick={() => onRemoveMember(index)}>
                    {t('app.shared.addressesInput.item.remove')}
                </Dropdown.Item>
            </Dropdown.Container>
        </Card>
    );
};
