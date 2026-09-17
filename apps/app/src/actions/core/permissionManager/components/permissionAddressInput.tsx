'use client';

import { AddressInput, addressUtils } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useFormField } from '@/shared/hooks/useFormField';

export interface IPermissionAddressInputProps {
    /**
     * Name of the form field holding the address, relative to `fieldPrefix`.
     */
    name: string;
    /**
     * Prefix of the action the field belongs to.
     */
    fieldPrefix: string;
    /**
     * Label of the field.
     */
    label: string;
    /**
     * Supporting text explaining what the address does in this action.
     */
    helpText: string;
    /**
     * Chain the address is resolved against.
     */
    chainId?: number;
}

/**
 * Address field of a permission action. Uses `AddressInput` rather than a plain text
 * field so an ENS name resolves and is stored as its address — the encoder only ever
 * sees a checksummed address.
 */
export const PermissionAddressInput: React.FC<IPermissionAddressInputProps> = (
    props,
) => {
    const { name, fieldPrefix, label, helpText, chainId } = props;

    const { onChange, value, ...addressField } = useFormField<
        Record<string, string>,
        string
    >(name, {
        label,
        defaultValue: '',
        fieldPrefix,
        rules: {
            required: true,
            validate: (fieldValue) =>
                addressUtils.isAddress(fieldValue as string, { strict: true }),
        },
        sanitizeOnBlur: false,
    });

    const [inputValue, setInputValue] = useState<string | undefined>(value);

    return (
        <AddressInput
            chainId={chainId}
            helpText={helpText}
            onAccept={(resolved) => onChange(resolved?.address ?? '')}
            onChange={setInputValue}
            value={inputValue}
            {...addressField}
        />
    );
};
