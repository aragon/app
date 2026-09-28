'use client';

import {
    addressUtils,
    Button,
    IconType,
    InputContainer,
} from '@aragon/gov-ui-kit';
import { useMemo, useState } from 'react';
import { AutocompleteInput } from '@/shared/components/forms/autocompleteInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';

const customItemId = 'custom-permission-id';

const permissionIdRegex = /^0x[0-9a-f]{64}$/iu;

// OSx permission names are UPPER_SNAKE; anything else is not a name we can hash.
const permissionNameRegex = /^[A-Z][A-Z0-9_]*$/u;

export interface IPermissionIdInputProps {
    /**
     * Name of the form field holding the permission id, relative to `fieldPrefix`.
     */
    name: string;
    /**
     * Prefix of the action the field belongs to.
     */
    fieldPrefix: string;
}

/**
 * Permission field of a permission action.
 *
 * A permission is a keccak256 hash of a name, and a hash cannot be inverted, so the
 * picker offers the known dictionary and an escape hatch that accepts either a pasted
 * 32-byte id or a permission name it hashes for you. Whatever is stored is always the
 * id — the name is only ever a label. Anything but a valid id shows the picker, with
 * rejected text kept in the form so its error matches what is typed; a valid id shows
 * what was chosen, with a control to clear it.
 */
export const PermissionIdInput: React.FC<IPermissionIdInputProps> = (props) => {
    const { name, fieldPrefix } = props;

    const { t } = useTranslations();

    const { onChange, value, alert, variant, ...permissionField } =
        useFormField<Record<string, string>, string>(name, {
            label: t('app.actions.core.permissionActionCreate.permissionLabel'),
            defaultValue: '',
            fieldPrefix,
            rules: {
                required: true,
                validate: (fieldValue) =>
                    permissionIdRegex.test((fieldValue as string) ?? '') ||
                    'app.actions.core.permissionActionCreate.invalidPermissionName',
            },
            sanitizeOnBlur: false,
        });

    // Name typed for a permission outside the dictionary, so the field can still show
    // it next to the id it hashed to.
    const [customName, setCustomName] = useState<string>();

    const items = useMemo(
        () => [
            {
                id: customItemId,
                name: t('app.actions.core.permissionActionCreate.customItem'),
                icon: IconType.PLUS,
                alwaysVisible: true,
            },
            ...permissionNameUtils.getKnownPermissions().map((permission) => ({
                id: permission.id,
                name: permission.name,
                icon: IconType.SETTINGS,
                info: addressUtils.truncateHash(permission.id),
            })),
        ],
        [t],
    );

    // Picking swaps the input for the name box without a blur, so mark the field as left here.
    const handleChange = (itemId: string, inputValue: string) => {
        if (itemId !== customItemId) {
            setCustomName(undefined);
            onChange(itemId);
            permissionField.onBlur();

            return;
        }

        const text = inputValue.trim();

        if (permissionIdRegex.test(text)) {
            setCustomName(undefined);
            onChange(text);
            permissionField.onBlur();

            return;
        }

        if (permissionNameRegex.test(text)) {
            // A name is not storable on its own, so hash it and keep the name as a label.
            setCustomName(text);
            onChange(permissionNameUtils.getPermissionId(text));
            permissionField.onBlur();

            return;
        }

        // Kept as typed so the validation error sits next to the text it rejects.
        setCustomName(undefined);
        onChange(text);
        permissionField.onBlur();
    };

    const handleClear = () => {
        setCustomName(undefined);
        onChange('');
    };

    if (!permissionIdRegex.test(value ?? '')) {
        return (
            <AutocompleteInput
                alert={alert}
                defaultInputValue={value}
                helpText={t(
                    'app.actions.core.permissionActionCreate.permissionHelpText',
                )}
                items={items}
                keepInputOnSelect={true}
                label={t(
                    'app.actions.core.permissionActionCreate.permissionLabel',
                )}
                onChange={handleChange}
                placeholder={t(
                    'app.actions.core.permissionActionCreate.permissionPlaceholder',
                )}
                selectItemLabel={t(
                    'app.actions.core.permissionActionCreate.selectItem',
                )}
                variant={variant}
                {...permissionField}
            />
        );
    }

    const knownName = permissionNameUtils.getKnownPermissionName(value);
    const displayName = knownName ?? customName;

    // A validation error outranks the warning; otherwise an id outside the dictionary
    // is flagged, even when the user typed the name themselves, because nothing here
    // can confirm the target contract knows it.
    const collapsedAlert =
        alert ??
        (knownName == null
            ? {
                  message: t(
                      'app.actions.core.permissionActionCreate.unknownPermission',
                  ),
                  variant: 'warning' as const,
              }
            : undefined);

    return (
        <InputContainer
            alert={collapsedAlert}
            helpText={t(
                'app.actions.core.permissionActionCreate.permissionHelpText',
            )}
            id={`${fieldPrefix}-${name}`}
            label={t('app.actions.core.permissionActionCreate.permissionLabel')}
            variant={collapsedAlert?.variant ?? 'default'}
            wrapperClassName="h-auto"
        >
            <div className="flex min-w-0 grow flex-col gap-0.5 px-4 py-3">
                {displayName != null && (
                    <p className="truncate text-neutral-800">{displayName}</p>
                )}
                <p
                    className={`truncate font-mono text-sm ${displayName != null ? 'text-neutral-500' : 'text-neutral-800'}`}
                    title={value}
                >
                    {value}
                </p>
            </div>
            <div className="mr-2 flex shrink-0 flex-row items-center self-center">
                <Button
                    aria-label={t(
                        'app.actions.core.permissionActionCreate.changePermission',
                    )}
                    iconLeft={IconType.CLOSE}
                    onClick={handleClear}
                    size="sm"
                    variant="tertiary"
                />
            </div>
        </InputContainer>
    );
};
