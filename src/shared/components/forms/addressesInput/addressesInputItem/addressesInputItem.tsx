import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
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
import { useFormContext } from 'react-hook-form';
import { useAddressesInputContext } from '../addressesInputContext';

export interface IAddressesInputItemProps extends ComponentProps<'div'> {
    /**
     * The index of the member.
     */
    index: number;
}

const validateMember = (member: ICompositeAddress, isAlreadyInList: boolean) => {
    const errorNamespace = 'app.shared.addressesInput.item.input.error';

    if (!addressUtils.isAddress(member.address)) {
        return `${errorNamespace}.invalid`;
    } else if (isAlreadyInList) {
        return `${errorNamespace}.alreadyInList`;
    }

    return true;
};

export const AddressesInputItem: React.FC<IAddressesInputItemProps> = (props) => {
    const { index } = props;

    const { t } = useTranslations();

    const { trigger } = useFormContext();

    const { fieldName, onRemoveMember, checkIsAlreadyInList, membersField } = useAddressesInputContext();

    const isAlreadyInList = checkIsAlreadyInList(index);
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
            required: true,
            validate: (value) => validateMember(value, isAlreadyInList),
        },
    });

    const [addressInput, setAddressInput] = useState<string | undefined>(value.address);

    const handleAddressAccept = useCallback(
        (value?: IAddressInputResolvedValue) => onAddressChange({ address: value?.address ?? '', name: value?.name }),
        [onAddressChange],
    );

    // Only trigger already-in-list validation if value is a valid address to avoid displaying an error on mount.
    useEffect(() => {
        if (addressUtils.isAddress(value.address)) {
            void trigger(memberFieldName);
        }
    }, [trigger, memberFieldName, isAlreadyInList, value.address]);

    return (
        <Card className="flex flex-col gap-3 border border-neutral-100 p-6 shadow-neutral-sm md:flex-row md:gap-2">
            <AddressInput
                chainId={1}
                onChange={setAddressInput}
                value={addressInput}
                onAccept={handleAddressAccept}
                placeholder={t('app.shared.addressesInput.item.input.placeholder')}
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
