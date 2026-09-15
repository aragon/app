'use client';

import {
    addressUtils,
    Button,
    IconType,
    InputContainer,
    InputText,
    type IProposalActionsDecoderParameterComponentProps,
    Toggle,
    ToggleGroup,
} from '@aragon/gov-ui-kit';
import { useEffect, useRef } from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { AutocompleteInput } from '@/shared/components/forms/autocompleteInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type IPermissionChange,
    PermissionOperation,
    permissionOperationUtils,
} from './permissionOperationUtils';
import {
    customPermissionItemId,
    permissionItems,
    permissionOptions,
} from './permissionPickerItems';

const copyPrefix =
    'app.governance.actionComposer.permissionManagerAction.multiTarget';

const permissionIdRegex = /^0x[0-9a-f]{64}$/iu;

const zeroAddress = `0x${'0'.repeat(40)}`;

const operationOrder = [
    PermissionOperation.GRANT,
    PermissionOperation.REVOKE,
    PermissionOperation.GRANT_WITH_CONDITION,
];

const operationKey: Record<PermissionOperation, string> = {
    [PermissionOperation.GRANT]: 'grant',
    [PermissionOperation.REVOKE]: 'revoke',
    [PermissionOperation.GRANT_WITH_CONDITION]: 'grantWithCondition',
};

const emptyChange: IPermissionChange = {
    operation: PermissionOperation.GRANT,
    where: '' as IPermissionChange['where'],
    who: '' as IPermissionChange['who'],
    permissionId: '' as IPermissionChange['permissionId'],
};

interface IRowFieldRenderProps {
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    alert?: { message: string; variant: 'critical' };
}

/**
 * One row field, registered with react-hook-form so the form's own mode decides when an
 * error appears — the same mechanism the kit's decoder field uses. Validating and
 * displaying errors by hand here is what previously lost the kit's behaviour.
 */
const RowField: React.FC<{
    name: string;
    type: string;
    fieldPath: string;
    render: (props: IRowFieldRenderProps) => React.ReactNode;
}> = ({ name, type, fieldPath, render }) => {
    const { t } = useTranslations();
    const { trigger } = useFormContext();

    const { field, fieldState } = useController({
        name: fieldPath,
        rules: {
            validate: (value: unknown) => {
                const stringValue = value?.toString() ?? '';

                if (!stringValue) {
                    return t(`${copyPrefix}.required`);
                }

                if (type === 'address') {
                    if (
                        !addressUtils.isAddress(stringValue, { strict: true })
                    ) {
                        return t(`${copyPrefix}.invalidAddress`);
                    }

                    // The zero address is the "no condition" sentinel, so it is a valid
                    // address but a meaningless condition.
                    if (name === 'condition' && stringValue === zeroAddress) {
                        return t(`${copyPrefix}.conditionRequired`);
                    }

                    return true;
                }

                if (name === 'permissionId') {
                    return (
                        permissionIdRegex.test(stringValue) ||
                        t(
                            'app.governance.actionComposer.permissionManagerAction.permission.invalid',
                        )
                    );
                }

                return true;
            },
        },
    });

    return render({
        value: (field.value as string | undefined) ?? '',
        onChange: (value: string) => {
            field.onChange(value);

            // Re-check a field that is already complaining so the message clears as the
            // value is corrected. React Hook Form only does this automatically after a
            // submit, and the form may have been validated by other means.
            if (fieldState.error) {
                void trigger(fieldPath);
            }
        },
        onBlur: field.onBlur,
        alert: fieldState.error
            ? {
                  message: fieldState.error.message ?? '',
                  variant: 'critical',
              }
            : undefined,
    });
};

export interface IPermissionChangesEditorProps
    extends IProposalActionsDecoderParameterComponentProps {
    /**
     * Set for actions that hoist the target out of the rows, i.e.
     * `applySingleTargetPermissions`. The value itself is read from the form.
     */
    hoistsTarget?: boolean;
}

/**
 * Editable counterpart of the permission changes list. Rows are added and removed by
 * writing the whole array, which is also what the decoder re-encodes from; individual
 * fields register themselves so validation stays react-hook-form's job.
 */
export const PermissionChangesEditor: React.FC<
    IPermissionChangesEditorProps
> = ({ parameter, fieldName, formPrefix, hoistsTarget }) => {
    const { t } = useTranslations();
    const { setValue } = useFormContext();

    const path = [formPrefix, fieldName].filter(Boolean).join('.');
    const watchedRows = useWatch({ name: path }) as unknown[] | undefined;
    const rows = watchedRows ?? (parameter.value as unknown[]) ?? [];

    // `applySingleTargetPermissions` hoists the target into the sibling parameter. Read
    // it from the form rather than taking it as a prop: a prop that changes while the
    // user types would give this component a new identity and remount the inputs.
    const targetPath = formPrefix?.replace(/\.\d+$/u, '.0.value');
    const watchedTarget = useWatch({ name: targetPath ?? '' }) as
        | string
        | undefined;
    const fallbackWhere = hoistsTarget ? (watchedTarget ?? '') : undefined;

    const components = parameter.components ?? [];
    const componentNames = components.map((component) => component.name);
    const changes = permissionOperationUtils.getPermissionChanges(
        { ...parameter, value: rows },
        fallbackWhere,
    );

    const writeChanges = (next: IPermissionChange[]) =>
        setValue(
            path,
            next.map((change) =>
                permissionOperationUtils.toRowValues(change, componentNames),
            ),
            { shouldDirty: true },
        );

    const hasField = (name: string) => componentNames.includes(name);

    // A freshly picked action has no rows, which would leave the form showing nothing but
    // an Add button. Seed one row so every field is on screen straight away.
    const seededRef = useRef(false);

    useEffect(() => {
        if (seededRef.current) {
            return;
        }

        // Marked on first mount regardless of what was imported: leaving it unset while
        // rows exist means deleting the last row later looks like a fresh action and
        // silently re-seeds a blank grant.
        seededRef.current = true;

        if (changes.length === 0) {
            writeChanges([
                {
                    ...emptyChange,
                    where: (fallbackWhere ?? '') as IPermissionChange['where'],
                },
            ]);
        }
    });

    // Label fields by their ABI name and type so the form maps back to the calldata
    // being signed, matching how the single grant/revoke action renders.
    const fieldLabel = (name: string) => {
        const component = components.find((item) => item.name === name);

        return component ? `${component.name} (${component.type})` : name;
    };

    // The picker clears its own input after a selection, so without this the stored value
    // is invisible — worst for a custom hash, which has no name to fall back on and could
    // only be checked by switching views.
    const permissionEcho = (change: IPermissionChange): string => {
        if (!change.permissionId) {
            return t(
                'app.governance.actionComposer.permissionManagerAction.permission.helpText',
            );
        }

        const known = permissionOptions.find(
            ({ id }) => id.toLowerCase() === change.permissionId.toLowerCase(),
        );

        return known
            ? `${known.name} · ${addressUtils.truncateHash(change.permissionId)}`
            : change.permissionId;
    };

    return (
        <div className="flex w-full flex-col gap-y-3">
            {changes.map((change, index) => {
                const selectedPermission = permissionOptions.find(
                    ({ id }) =>
                        id.toLowerCase() === change.permissionId.toLowerCase(),
                );

                return (
                    <div
                        className="flex flex-col gap-y-4 rounded-xl border border-neutral-100 p-4"
                        key={`change-${index.toString()}`}
                    >
                        <div className="flex flex-row items-start justify-between gap-2">
                            <InputContainer
                                id={`${path}.${index.toString()}.operation`}
                                label={fieldLabel('operation')}
                                useCustomWrapper={true}
                            >
                                <ToggleGroup
                                    isMultiSelect={false}
                                    onChange={(value?: string) => {
                                        const next = operationOrder.find(
                                            (operation) =>
                                                operation.toString() === value,
                                        );

                                        if (next == null) {
                                            return;
                                        }

                                        writeChanges(
                                            changes.map((item, current) =>
                                                current === index
                                                    ? {
                                                          ...item,
                                                          operation: next,
                                                          // A condition only applies to a
                                                          // conditional grant. Leaving it
                                                          // set breaks encoding when it is
                                                          // malformed, and OSx rejects an
                                                          // ordinary grant that carries one.
                                                          condition:
                                                              next ===
                                                              PermissionOperation.GRANT_WITH_CONDITION
                                                                  ? item.condition
                                                                  : undefined,
                                                      }
                                                    : item,
                                            ),
                                        );
                                    }}
                                    value={change.operation.toString()}
                                >
                                    {operationOrder
                                        .filter(
                                            (operation) =>
                                                hasField('condition') ||
                                                operation !==
                                                    PermissionOperation.GRANT_WITH_CONDITION,
                                        )
                                        .map((operation) => (
                                            <Toggle
                                                key={operation}
                                                label={t(
                                                    `app.governance.actionComposer.permissionManagerAction.operation.${operationKey[operation]}`,
                                                )}
                                                value={operation.toString()}
                                            />
                                        ))}
                                </ToggleGroup>
                            </InputContainer>
                            <Button
                                aria-label={t(`${copyPrefix}.removeChange`)}
                                iconLeft={IconType.CLOSE}
                                onClick={() =>
                                    writeChanges(
                                        changes.filter(
                                            (_, current) => current !== index,
                                        ),
                                    )
                                }
                                size="sm"
                                variant="tertiary"
                            />
                        </div>
                        {/* Fields follow the ABI component order so the form reads in the
                            same order as the calldata it produces. */}
                        {components
                            .filter(
                                (component) => component.name !== 'operation',
                            )
                            .map(({ name, type }) => {
                                // A condition only means anything on a conditional grant.
                                if (
                                    name === 'condition' &&
                                    change.operation !==
                                        PermissionOperation.GRANT_WITH_CONDITION
                                ) {
                                    return null;
                                }

                                const fieldPath = `${path}.${index.toString()}.${componentNames.indexOf(name).toString()}`;

                                if (name === 'permissionId') {
                                    return (
                                        <RowField
                                            fieldPath={fieldPath}
                                            key={name}
                                            name={name}
                                            render={({
                                                onChange,
                                                onBlur,
                                                alert,
                                            }) => (
                                                <AutocompleteInput
                                                    alert={alert}
                                                    helpText={permissionEcho(
                                                        change,
                                                    )}
                                                    items={[
                                                        ...permissionItems,
                                                        {
                                                            id: customPermissionItemId,
                                                            name: t(
                                                                'app.governance.actionComposer.permissionManagerAction.permission.customItem',
                                                            ),
                                                            icon: IconType.PLUS,
                                                            alwaysVisible: true,
                                                        },
                                                    ]}
                                                    label={fieldLabel(name)}
                                                    onBlur={onBlur}
                                                    onChange={(
                                                        value: string,
                                                        inputValue: string,
                                                    ) =>
                                                        onChange(
                                                            value ===
                                                                customPermissionItemId
                                                                ? inputValue.trim()
                                                                : value,
                                                        )
                                                    }
                                                    placeholder={
                                                        selectedPermission?.name ??
                                                        t(
                                                            'app.governance.actionComposer.permissionManagerAction.permission.placeholder',
                                                        )
                                                    }
                                                    selectItemLabel={t(
                                                        'app.governance.actionComposer.permissionManagerAction.permission.selectItem',
                                                    )}
                                                />
                                            )}
                                            type={type}
                                        />
                                    );
                                }

                                return (
                                    <RowField
                                        fieldPath={fieldPath}
                                        key={name}
                                        name={name}
                                        render={({
                                            value,
                                            onChange,
                                            onBlur,
                                            alert,
                                        }) => (
                                            <InputText
                                                alert={alert}
                                                label={fieldLabel(name)}
                                                onBlur={onBlur}
                                                onChange={(event) =>
                                                    onChange(event.target.value)
                                                }
                                                value={value}
                                            />
                                        )}
                                        type={type}
                                    />
                                );
                            })}
                    </div>
                );
            })}
            {changes.length === 0 && (
                <p className="text-neutral-500">
                    {t(`${copyPrefix}.emptyEditor`)}
                </p>
            )}
            <Button
                className="w-fit"
                iconLeft={IconType.PLUS}
                onClick={() =>
                    writeChanges([
                        ...changes,
                        {
                            ...emptyChange,
                            where: (fallbackWhere ??
                                '') as IPermissionChange['where'],
                        },
                    ])
                }
                size="sm"
                variant="tertiary"
            >
                {t(`${copyPrefix}.addChange`)}
            </Button>
        </div>
    );
};
