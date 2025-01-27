import { AddressInput, addressUtils, Button, Dropdown, IconType } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

export interface IMultisigMemberInputRowProps {
    fieldNamePrefix: string;
    onRemoveMember: () => void;
    canRemove: boolean;
}

export const MultisigMemberInputRow: React.FC<IMultisigMemberInputRowProps> = (props) => {
    const { fieldNamePrefix, onRemoveMember, canRemove } = props;

    const { control } = useFormContext();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const inputValue = useWatch({ name: fieldNamePrefix });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const [memberInput, setMemberInput] = useState<string | undefined>(inputValue?.address);

    return (
        <div className="flex items-start gap-4 rounded-xl border border-neutral-100 p-6">
            <Controller
                name={fieldNamePrefix}
                control={control}
                defaultValue=""
                rules={{
                    required: 'Address is required',
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
                    validate: (value) => addressUtils.isAddress(value?.address) || 'Valid 0x... or ENS Address',
                }}
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
                    customTrigger={
                        <Button variant="tertiary" iconLeft={IconType.DOTS_VERTICAL} className="mt-[34.5px] shrink-0" />
                    }
                >
                    <Dropdown.Item onClick={onRemoveMember}>Remove</Dropdown.Item>
                </Dropdown.Container>
            )}
        </div>
    );
};
