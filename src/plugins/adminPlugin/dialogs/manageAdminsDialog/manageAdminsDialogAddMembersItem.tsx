import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
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
import { useCallback, useState } from 'react';

export interface IManageAdminsAddMembersItemProps {
    /**
     * The index of the member.
     */
    index: number;
    /**
     * Callback triggered on remove member click.
     */
    onRemoveMember?: () => void;
    /**
     * Field name of the form.
     */
    fieldName: string;
    /**
     * Defines if the current field is already on the list.
     */
    isAlreadyInList: boolean;
}

const validateMember = (member: ICompositeAddress, isAlreadyInList: boolean) => {
    const errorNamespace = 'app.plugins.multisig.multisigAddMembersAction.addressInput.error';
    console.log('member', member);
    if (!member.address) {
        return true;
    }
    if (!addressUtils.isAddress(member.address)) {
        return `${errorNamespace}.invalid`;
    } else if (isAlreadyInList) {
        return `${errorNamespace}.alreadyInList`;
    }

    return true;
};

export const ManageAdminsAddMembersItem: React.FC<IManageAdminsAddMembersItemProps> = (props) => {
    const { index, onRemoveMember, fieldName, isAlreadyInList } = props;

    const { t } = useTranslations();

    const memberFieldName = `${fieldName}.[${index.toString()}]`;
    const {
        value,
        onChange: onAddressChange,
        label,
        ...addressField
    } = useFormField<Record<string, ICompositeAddress>, string>(memberFieldName, {
        label: t('app.plugins.multisig.multisigAddMembersAction.addressInput.label'),
        rules: {
            required: true,
            validate: (value) => validateMember(value, isAlreadyInList),
        },
    });

    console.log('memberFieldName', memberFieldName, 'value', value);

    const [addressInput, setAddressInput] = useState<string | undefined>(value.address);

    const handleAddressAccept = useCallback(
        (value?: IAddressInputResolvedValue) => onAddressChange({ address: value?.address ?? '' }),
        [onAddressChange],
    );

    return (
        <Card className="flex flex-col gap-3 border border-neutral-100 p-6 shadow-neutral-sm md:flex-row md:gap-2">
            <AddressInput
                chainId={1}
                onChange={setAddressInput}
                value={addressInput}
                onAccept={handleAddressAccept}
                {...addressField}
            />
            {onRemoveMember != null && (
                <Dropdown.Container
                    constrainContentWidth={false}
                    size="md"
                    customTrigger={<Button variant="tertiary" size="lg" iconLeft={IconType.DOTS_VERTICAL} />}
                >
                    <Dropdown.Item onClick={onRemoveMember}>
                        {t('app.plugins.multisig.multisigAddMembersAction.removeMember')}
                    </Dropdown.Item>
                </Dropdown.Container>
            )}
        </Card>
    );
};
