import type { ICreateProcessFormBody } from '@/modules/createDao/components/createProcessForm';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils, Button, Dropdown, IconType, InputNumber } from '@aragon/gov-ui-kit';
import { useCallback, useState } from 'react';

interface ITokenSetupMemberhipCreateTokenMemberProps {
    /**
     * Prefix to be appended to all form fields.
     */
    fieldNamePrefix: string;
    /**
     * Initial value of the member address.
     */
    initialValue: string;
    /**
     * Callback to remove the member.
     */
    onRemoveMember: (index: number) => void;
    /**
     * Index of the member in the list.
     */
    index: number;
    /**
     * Whether the member can be removed.
     */
    canRemove: boolean;
}

export interface IAddressResolvedValue {
    address?: string;
    name?: string;
}

export const TokenSetupMemberhipCreateTokenMember: React.FC<ITokenSetupMemberhipCreateTokenMemberProps> = (props) => {
    const { fieldNamePrefix, onRemoveMember, index, initialValue, canRemove } = props;

    const [memberInput, setMemberInput] = useState<string | undefined>(initialValue);

    const {
        onChange: onMemberChange,
        value,
        ...memberField
    } = useFormField<ICreateProcessFormBody, `members.${number}.address`>(
        `members.${index.toString()}.address` as `members.${number}.address`,
        {
            label: 'Address',
            rules: { required: true, validate: (value) => addressUtils.isAddress(value) },
            fieldPrefix: fieldNamePrefix,
        },
    );

    const tokenAmountField = useFormField<ICreateProcessFormBody, `members.${number}.tokenAmount`>(
        `members.${index.toString()}.tokenAmount` as `members.${number}.tokenAmount`,
        {
            label: 'Tokens',
            rules: { required: true, validate: (value) => Number(value) > 0, min: 0 },
            fieldPrefix: fieldNamePrefix,
        },
    );

    const handleAddressAccept = useCallback(
        (value: IAddressResolvedValue | undefined) => onMemberChange(value?.address ?? ''),
        [onMemberChange],
    );

    return (
        <div className="flex items-start gap-x-4 rounded-xl border border-neutral-100 p-6">
            <div className="flex w-full gap-x-4">
                <AddressInput
                    placeholder="ENS or 0x…"
                    chainId={1}
                    value={memberInput}
                    onChange={setMemberInput}
                    onAccept={handleAddressAccept}
                    className="basis-[65%]"
                    {...memberField}
                />
                <InputNumber className="basis-[35%]" min={0} {...tokenAmountField} />
            </div>

            {canRemove && (
                <Dropdown.Container
                    customTrigger={
                        <Button variant="tertiary" iconLeft={IconType.DOTS_VERTICAL} className="mt-[34.5px] shrink-0" />
                    }
                >
                    <Dropdown.Item onClick={() => onRemoveMember(index)}>Remove</Dropdown.Item>
                </Dropdown.Container>
            )}
        </div>
    );
};
