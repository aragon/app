import { AddressInput } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useDebugContext } from '@/shared/components/debugProvider';
import type { IAddressInputControlProps } from './addressInputControl.api';

export const AddressInputControl: React.FC<IAddressInputControlProps> = (
    props,
) => {
    const { label, name, onChange } = props;

    const { values, updateValue } = useDebugContext();

    const [inputValue, setInputValue] = useState<string | undefined>(
        (values[name] as string | undefined) ?? undefined,
    );

    const handleAccept = (resolved?: { address?: string }) => {
        const address = resolved?.address;
        updateValue(name, address);
        onChange?.(address);
    };

    return (
        <AddressInput
            label={label}
            onAccept={handleAccept}
            onChange={setInputValue}
            value={inputValue}
        />
    );
};
