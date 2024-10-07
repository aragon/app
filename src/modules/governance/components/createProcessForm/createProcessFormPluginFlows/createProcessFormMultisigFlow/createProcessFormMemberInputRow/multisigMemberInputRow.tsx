import { AddressInput, Button, Dropdown, IconType } from '@aragon/ods';
import React, { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

export interface IMultisigMemberInputRowProps {
    index: number;
    fieldNamePrefix: string;
    handleRemoveMember: (index: number) => void;
    canRemove: boolean;
}

export const MultisigMemberInputRow: React.FC<IMultisigMemberInputRowProps> = ({
    index,
    fieldNamePrefix,
    handleRemoveMember,
    canRemove,
}) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const addressFieldName = `${fieldNamePrefix}.address`;

    const inputValue = useWatch({ name: addressFieldName });
    const [memberInput, setMemberInput] = useState<string | undefined>(inputValue?.address);

    return (
        <div className="flex items-center gap-4 rounded-xl border border-neutral-100 p-6">
            <Controller
                name={addressFieldName}
                control={control}
                rules={{ required: 'Address is required' }}
                render={({ field: { onChange: onMemberChange }, fieldState: { error } }) => (
                    <AddressInput
                        className="grow"
                        label="Address"
                        placeholder="ENS or 0x…"
                        chainId={1}
                        value={memberInput}
                        onChange={setMemberInput}
                        onAccept={onMemberChange}
                        alert={error?.message ? { message: error.message, variant: 'critical' } : undefined}
                    />
                )}
            />
            {canRemove && (
                <Dropdown.Container
                    customTrigger={<Button variant="tertiary" iconLeft={IconType.DOTS_VERTICAL} className="self-end" />}
                >
                    <Dropdown.Item onClick={() => handleRemoveMember(index)}>Remove</Dropdown.Item>
                </Dropdown.Container>
            )}
        </div>
    );
};
