import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    AddressInput,
    addressUtils,
    Button,
    Card,
    Dropdown,
    type ICompositeAddress,
    IconType,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';

export interface IAddMemberItemProps {
    /**
     * The index of the resource item in the list.
     */
    index: number;
    /**
     * Callback to remove the resource item.
     */
    remove: (index: number) => void;
    /**
     * Action data.
     */
    action: IProposalActionData<IProposalAction>;
    /**
     * Field name of the main form.
     */
    fieldName: string;
}

export const AddMemberItem: React.FC<IAddMemberItemProps> = (props) => {
    const { index, remove, action, fieldName } = props;

    const { t } = useTranslations();

    const addressFieldName = `${fieldName}.[${index}]`;
    const {
        value,
        onChange: onAddressChange,
        ...addressField
    } = useFormField<Record<string, ICompositeAddress>, string>(addressFieldName, {
        rules: {
            required: true,
            validate: (value) => addressUtils.isAddress(value?.address) && !isMember,
        },
    });

    const [addressInput, setAddressInput] = useState<string | undefined>(value?.address);

    const memberExistsParams = { memberAddress: addressInput ?? '', pluginAddress: action.pluginAddress };
    const { data: isMember } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: action.pluginAddress != null },
    );

    return (
        <Card className="flex flex-col gap-3 border border-neutral-100 p-6 shadow-neutral-sm md:flex-row md:gap-2">
            <AddressInput
                placeholder={t('app.plugins.multisig.addMembersAction.addressInput.placeholder')}
                onChange={setAddressInput}
                value={addressInput}
                onAccept={onAddressChange}
                {...addressField}
            />
            <Dropdown.Container
                constrainContentWidth={false}
                size="md"
                customTrigger={<Button variant="tertiary" size="lg" iconLeft={IconType.DOTS_VERTICAL} />}
            >
                <Dropdown.Item onClick={() => remove(index)}>
                    {t('app.plugins.multisig.addMembersAction.removeMember')}
                </Dropdown.Item>
            </Dropdown.Container>
        </Card>
    );
};
