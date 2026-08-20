'use client';

import {
    AddressInput,
    addressUtils,
    Button,
    type ICompositeAddress,
    IconType,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ICreateWorkspaceFormData } from './createWorkspaceDialogDefinitions';

export interface ICreateWorkspaceTargetFieldProps {
    /**
     * Index of the target on the form field array.
     */
    index: number;
    /**
     * Chain ID used to resolve ENS names of the address input.
     */
    chainId?: number;
    /**
     * Displays the remove action when set to true.
     */
    canRemove?: boolean;
    /**
     * Callback called on remove action click.
     */
    onRemove: () => void;
}

export const CreateWorkspaceTargetField: React.FC<
    ICreateWorkspaceTargetFieldProps
> = (props) => {
    const { index, chainId, canRemove, onRemove } = props;

    const { t } = useTranslations();
    const { getValues } = useFormContext<ICreateWorkspaceFormData>();

    const [addressInput, setAddressInput] = useState<string | undefined>();

    // The service rejects a workspace with repeated targets, so duplicates are caught on the form.
    const validateTarget = (value?: ICompositeAddress) => {
        if (!addressUtils.isAddress(value?.address)) {
            return false;
        }

        const isDuplicate = getValues('targets').some(
            (target, targetIndex) =>
                targetIndex !== index &&
                target.value?.address != null &&
                addressUtils.isAddressEqual(
                    target.value.address,
                    value?.address,
                ),
        );

        return (
            !isDuplicate ||
            t('app.workspace.createWorkspaceDialog.targets.duplicate')
        );
    };

    const fieldName = `targets.${index}.value` as const;
    const {
        value: _value,
        onChange,
        ...targetField
    } = useFormField<ICreateWorkspaceFormData, typeof fieldName>(fieldName, {
        label: t('app.workspace.createWorkspaceDialog.targets.label', {
            index: index + 1,
        }),
        rules: { required: true, validate: validateTarget },
    });

    return (
        <div className="flex items-end gap-2">
            <div className="min-w-0 grow">
                <AddressInput
                    chainId={chainId}
                    onAccept={onChange}
                    onChange={setAddressInput}
                    placeholder={t(
                        'app.workspace.createWorkspaceDialog.targets.placeholder',
                    )}
                    value={addressInput}
                    {...targetField}
                />
            </div>
            {canRemove && (
                <Button
                    aria-label={t(
                        'app.workspace.createWorkspaceDialog.targets.remove',
                    )}
                    iconLeft={IconType.CLOSE}
                    onClick={onRemove}
                    size="lg"
                    variant="tertiary"
                />
            )}
        </div>
    );
};
