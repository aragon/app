'use client';

import {
    AddressInput,
    addressUtils,
    type IAddressInputResolvedValue,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { zeroAddress } from 'viem';
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
    /**
     * Condition contracts must not use the unconditional zero-address sentinel.
     */
    isCondition?: boolean;
}

/**
 * Address field of a permission action. Uses `AddressInput` rather than a plain text
 * field so an ENS name resolves and is stored as its address — the encoder only ever
 * sees a checksummed address.
 */
export const PermissionAddressInput: React.FC<IPermissionAddressInputProps> = (
    props,
) => {
    const { name, fieldPrefix, label, helpText, chainId, isCondition } = props;

    const { onChange, value, ...addressField } = useFormField<
        Record<string, string>,
        string
    >(name, {
        label,
        defaultValue: '',
        fieldPrefix,
        rules: {
            required: true,
            validate: (fieldValue) => {
                if (
                    !addressUtils.isAddress(fieldValue as string, {
                        strict: true,
                    })
                ) {
                    return 'app.actions.core.permissionAddressInput.invalidAddress';
                }

                if (isCondition && fieldValue === zeroAddress) {
                    return 'app.actions.core.permissionAddressInput.conditionRequired';
                }

                return true;
            },
        },
        sanitizeOnBlur: false,
    });

    const [inputValue, setInputValue] = useState<string | undefined>(value);

    // The form holds what is on screen, so a half-typed address reads as invalid, not empty.
    const handleChange = (newValue?: string) => {
        setInputValue(newValue);
        onChange(newValue ?? '');
    };

    const handleAccept = (resolved?: IAddressInputResolvedValue) => {
        if (resolved?.address != null) {
            onChange(resolved.address);
        }
    };

    return (
        <AddressInput
            chainId={chainId}
            helpText={helpText}
            onAccept={handleAccept}
            onChange={handleChange}
            value={inputValue}
            {...addressField}
        />
    );
};
