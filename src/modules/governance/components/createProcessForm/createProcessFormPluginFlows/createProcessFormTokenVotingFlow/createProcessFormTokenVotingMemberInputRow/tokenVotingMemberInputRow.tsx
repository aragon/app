import { AddressInput, addressUtils, Button, Dropdown, IconType, InputNumber } from '@aragon/ods';
import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

export interface ITokenVotingMemberInputRowProps {
    index: number;
    fieldNamePrefix: string;
    handleRemoveMember: (index: number) => void;
    canRemove: boolean;
}

export const TokenVotingMemberInputRow: React.FC<ITokenVotingMemberInputRowProps> = ({
    index,
    fieldNamePrefix,
    handleRemoveMember,
    canRemove,
}) => {
    const { control } = useFormContext();

    const addressFieldName = `${fieldNamePrefix}.address`;
    const tokenAmountFieldName = `${fieldNamePrefix}.tokenAmount`;

    const inputValue = useWatch({ name: addressFieldName });
    const [receiverInput, setReceiverInput] = useState<string | undefined>(inputValue?.address);

    return (
        <div className="flex items-start gap-x-4 rounded-xl border border-neutral-100 p-6">
            <div className="flex w-full gap-x-4">
                <Controller
                    name={addressFieldName}
                    control={control}
                    rules={{
                        required: 'Address is required',
                        validate: (value) => addressUtils.isAddress(value?.address) || 'Invalid address',
                    }}
                    render={({ field: { onChange: onReceiverChange }, fieldState: { error } }) => (
                        <AddressInput
                            label="Address"
                            placeholder="ENS or 0x…"
                            chainId={1}
                            value={receiverInput}
                            onChange={setReceiverInput}
                            onAccept={onReceiverChange}
                            alert={error?.message ? { message: error.message, variant: 'critical' } : undefined}
                            className="w-1/2"
                        />
                    )}
                />
                <Controller
                    name={tokenAmountFieldName}
                    control={control}
                    rules={{
                        required: 'Token amount is required',
                        validate: (value) => (value > 0 ? true : 'Amount must be greater than 0'),
                    }}
                    defaultValue={undefined}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <InputNumber
                            label="Tokens"
                            value={value !== undefined ? value : ''}
                            onChange={(newValue: string) => {
                                const parsedValue = parseFloat(newValue);
                                if (isNaN(parsedValue)) {
                                    onChange(undefined);
                                } else {
                                    onChange(parsedValue);
                                }
                            }}
                            alert={error?.message ? { message: error.message, variant: 'critical' } : undefined}
                            className="w-1/2"
                            min={0}
                        />
                    )}
                />
            </div>

            {canRemove && (
                <Dropdown.Container
                    customTrigger={
                        <Button variant="tertiary" iconLeft={IconType.DOTS_VERTICAL} className="mt-[34.5px] shrink-0" />
                    }
                >
                    <Dropdown.Item onClick={() => handleRemoveMember(index)}>Remove</Dropdown.Item>
                </Dropdown.Container>
            )}
        </div>
    );
};
