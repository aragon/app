import { AddressInput, Button, Dropdown, IconType, InputNumber } from '@aragon/ods';
import React, { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

export interface ITokenVotingMemberInputRowProps {
    index: number;
    fieldNamePrefix: string;
    tokenSymbol: string;
    handleRemoveMember: (index: number) => void;
    canRemove: boolean;
}

export const TokenVotingMemberInputRow: React.FC<ITokenVotingMemberInputRowProps> = ({
    index,
    fieldNamePrefix,
    tokenSymbol,
    handleRemoveMember,
    canRemove,
}) => {
    const { control } = useFormContext();

    const addressFieldName = `${fieldNamePrefix}.address`;
    const tokenAmountFieldName = `${fieldNamePrefix}.tokenAmount`;

    const inputValue = useWatch({ name: addressFieldName });
    const [receiverInput, setReceiverInput] = useState<string | undefined>(inputValue?.address);

    return (
        <div className="flex items-center gap-4 rounded-xl border border-neutral-100 p-6">
            <Controller
                name={addressFieldName}
                control={control}
                rules={{ required: 'Address is required' }}
                render={({ field: { onChange: onReceiverChange }, fieldState: { error } }) => (
                    <AddressInput
                        className="grow"
                        label="Address"
                        placeholder="ENS or 0x…"
                        chainId={1}
                        value={receiverInput}
                        onChange={setReceiverInput}
                        onAccept={onReceiverChange}
                        alert={error?.message ? { message: error.message, variant: 'critical' } : undefined}
                    />
                )}
            />

            <Controller
                name={tokenAmountFieldName}
                control={control}
                rules={{ required: 'Token amount is required', min: { value: 1, message: 'Minimum amount is 1' } }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <InputNumber
                        label="Tokens"
                        suffix={tokenSymbol}
                        min={1}
                        value={value || 1}
                        onChange={(newValue: string) => onChange(Number(newValue))}
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
