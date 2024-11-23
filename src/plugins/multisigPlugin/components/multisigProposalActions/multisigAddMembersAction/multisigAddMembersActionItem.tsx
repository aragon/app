import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
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
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export interface IMultisigAddMembersActionItemProps {
    /**
     * The index of the member.
     */
    index: number;
    /**
     * Callback triggered on remove member click.
     */
    onRemoveMember?: () => void;
    /**
     * Address of the current DAO plugin.
     */
    pluginAddress: string;
    /**
     * Field name of the action form.
     */
    fieldName: string;
    /**
     * Defines if the current field is already on the list.
     */
    isAlreadyInList: boolean;
}

const validateMember = (member: ICompositeAddress, isAlreadyInList: boolean, isMember?: boolean) => {
    const errorNamespace = 'app.plugins.multisig.multisigAddMembersAction.addressInput.error';

    if (!addressUtils.isAddress(member.address)) {
        return `${errorNamespace}.invalid`;
    } else if (isMember) {
        return `${errorNamespace}.alreadyMember`;
    } else if (isAlreadyInList) {
        return `${errorNamespace}.alreadyInList`;
    }

    return true;
};

export const MultisigAddMembersActionItem: React.FC<IMultisigAddMembersActionItemProps> = (props) => {
    const { index, onRemoveMember, pluginAddress, fieldName, isAlreadyInList } = props;

    const { t } = useTranslations();
    const { trigger } = useFormContext();

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
            validate: (value) => validateMember(value, isAlreadyInList, isMember),
        },
    });

    const [addressInput, setAddressInput] = useState<string | undefined>(value.address);

    const memberExistsParams = { memberAddress: value.address, pluginAddress };
    const { data: isMember } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: addressUtils.isAddress(value.address) },
    );

    const handleAddressAccept = useCallback(
        (value?: IAddressInputResolvedValue) => onAddressChange({ address: value?.address ?? '', name: value?.name }),
        [onAddressChange],
    );

    // Trigger member validation to check if added user is already a member of the DAO or not.
    useEffect(() => {
        if (isMember != null) {
            trigger(memberFieldName);
        }
    }, [trigger, memberFieldName, isMember]);

    // Only trigger already-in-list validation if value is a valid address to avoid displaying an error on mount.
    useEffect(() => {
        if (addressUtils.isAddress(value.address)) {
            trigger(memberFieldName);
        }
    }, [trigger, memberFieldName, isAlreadyInList, value.address]);

    return (
        <Card className="flex flex-col gap-3 border border-neutral-100 p-6 shadow-neutral-sm md:flex-row md:gap-2">
            <AddressInput
                chainId={1}
                placeholder={t('app.plugins.multisig.multisigAddMembersAction.addressInput.placeholder')}
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
