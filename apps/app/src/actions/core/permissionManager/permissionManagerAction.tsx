'use client';

import {
    AlertCard,
    AlertInline,
    addressUtils,
    DefinitionList,
    IconType,
    type IProposalAction,
    type IProposalActionInputDataParameter,
    type IProposalActionsDecoderParameterComponentProps,
    type IProposalActionsDecoderProps,
    ProposalActionsDecoderMode,
    type ProposalActionsDecoderParameterComponent,
} from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { AutocompleteInput } from '@/shared/components/forms/autocompleteInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { MultiTargetPermissionsList } from './multiTargetPermissionsList';
import { PermissionAddressField } from './permissionAddressField';
import { PermissionChangesEditor } from './permissionChangesEditor';
import {
    customPermissionItemId,
    permissionIdRegex,
    permissionItems,
    permissionOptions,
} from './permissionPickerItems';

type PermissionManagerFormValues = Record<string, string>;

const PermissionManagerPermissionEditField: React.FC<
    IProposalActionsDecoderParameterComponentProps
> = ({ parameter, fieldName, formPrefix }) => {
    const { t } = useTranslations();
    const resolvedFieldName = [formPrefix, fieldName].filter(Boolean).join('.');
    const permissionField = useFormField<PermissionManagerFormValues, string>(
        resolvedFieldName,
        {
            // The ABI names the parameter; do not invent a label for it.
            label: parameter.name,
            rules: {
                required: true,
                pattern: {
                    value: permissionIdRegex,
                    message: t(
                        'app.governance.actionComposer.permissionManagerAction.permission.invalid',
                    ),
                },
            },
            sanitizeMode: 'none',
        },
    );
    const permissionId = permissionField.value ?? '';
    const selectedPermission = permissionOptions.find(
        ({ id }) => id.toLowerCase() === permissionId.toLowerCase(),
    );

    // The picker only lists known permissions, but a DAO can grant any bytes32. Selecting
    // the custom option writes whatever hash was typed, so plugin permissions missing from
    // the dictionary stay composable.
    const items = [
        ...permissionItems,
        {
            id: customPermissionItemId,
            name: t(
                'app.governance.actionComposer.permissionManagerAction.permission.customItem',
            ),
            icon: IconType.PLUS,
            alwaysVisible: true,
        },
    ];

    // Always show the counterpart of whatever is in the field: the hash for a picked
    // name, the name for a recognised hash, a warning when the hash is valid but unknown.
    const isValidId = permissionIdRegex.test(permissionId);
    const resolutionEcho = (() => {
        if (permissionId === '') {
            return t(
                'app.governance.actionComposer.permissionManagerAction.permission.helpText',
            );
        }

        if (selectedPermission) {
            return `${selectedPermission.name} · ${addressUtils.truncateHash(permissionId)}`;
        }

        // A custom hash has no name to fall back on, so show it verbatim: otherwise the
        // stored value cannot be checked without switching views.
        if (isValidId) {
            return `${permissionId} · ${t(
                'app.governance.actionComposer.permissionManagerAction.permission.unknown',
            )}`;
        }

        return t(
            'app.governance.actionComposer.permissionManagerAction.permission.invalid',
        );
    })();

    const handleChange = (value: string, inputValue: string) => {
        const isCustom = value === customPermissionItemId;
        permissionField.onChange(isCustom ? inputValue.trim() : value);
    };

    return (
        <AutocompleteInput
            alert={permissionField.alert}
            helpText={resolutionEcho}
            items={items}
            label={`${parameter.name} (${parameter.type})`}
            name={permissionField.name}
            onBlur={permissionField.onBlur}
            onChange={handleChange}
            placeholder={
                selectedPermission?.name ??
                t(
                    'app.governance.actionComposer.permissionManagerAction.permission.placeholder',
                )
            }
            selectItemLabel={t(
                'app.governance.actionComposer.permissionManagerAction.permission.selectItem',
            )}
            variant={permissionField.variant}
        />
    );
};

const getResolvedFieldName = (fieldName: string, formPrefix?: string): string =>
    [formPrefix, fieldName].filter(Boolean).join('.');

/**
 * Read rendering of the permission parameter. The resolved name is the value and the
 * hash is evidence beneath it, mirroring how `AddressOutput` puts ENS over an address.
 * An unrecognised hash keeps the hash as the value and raises an inline warning, so a
 * failed resolution is never indistinguishable from a build where it did not run.
 */
const PermissionManagerPermissionDisplay: React.FC<{
    parameter: IProposalActionInputDataParameter;
    permissionId: string;
}> = ({ parameter, permissionId }) => {
    const { t } = useTranslations();

    const knownPermission = permissionOptions.find(
        ({ id }) => id.toLowerCase() === permissionId.toLowerCase(),
    );
    const isUnknown = permissionId !== '' && knownPermission == null;

    const evidence = [
        parameter.notice,
        permissionId ? addressUtils.truncateHash(permissionId) : undefined,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <div className="flex flex-col gap-2">
            <DefinitionList.Container>
                <DefinitionList.Item
                    copyValue={permissionId || undefined}
                    description={evidence || undefined}
                    term={`${parameter.name} (${parameter.type})`}
                >
                    {knownPermission?.name ?? permissionId}
                </DefinitionList.Item>
            </DefinitionList.Container>
            {isUnknown && (
                <AlertInline
                    message={t(
                        'app.governance.actionComposer.permissionManagerAction.permission.unknown',
                    )}
                    variant="warning"
                />
            )}
            {knownPermission && (
                <AlertInline
                    message={t(
                        'app.governance.actionComposer.permissionManagerAction.permission.provenance',
                    )}
                    variant="info"
                />
            )}
        </div>
    );
};

const PermissionManagerPermissionWatchField: React.FC<
    IProposalActionsDecoderParameterComponentProps
> = ({ fieldName, formPrefix, parameter }) => {
    const permissionId = useWatch<Record<string, string>>({
        name: getResolvedFieldName(fieldName, formPrefix),
    });

    return (
        <PermissionManagerPermissionDisplay
            parameter={parameter}
            permissionId={permissionId ?? ''}
        />
    );
};

export const PermissionManagerPermissionField: React.FC<
    IProposalActionsDecoderParameterComponentProps
> = (props) => {
    const { mode, parameter } = props;

    if (mode === ProposalActionsDecoderMode.EDIT) {
        return <PermissionManagerPermissionEditField {...props} />;
    }

    if (mode === ProposalActionsDecoderMode.WATCH) {
        return <PermissionManagerPermissionWatchField {...props} />;
    }

    return (
        <PermissionManagerPermissionDisplay
            parameter={parameter}
            permissionId={parameter.value?.toString() ?? ''}
        />
    );
};

/**
 * A DAO `applySingleTargetPermissions` call: `(address _where, tuple[] items)`. The
 * target is hoisted out of the rows, so the list needs it from the sibling parameter.
 */
const isSingleTargetPermissionsAction = (
    action: Pick<IProposalAction, 'inputData'>,
): boolean => {
    const { function: functionName, parameters } = action.inputData ?? {};

    return (
        functionName === 'applySingleTargetPermissions' &&
        parameters?.length === 2 &&
        parameters[0]?.type === 'address' &&
        parameters[1]?.type === 'tuple[]' &&
        hasComponents(parameters[1], ['operation', 'who', 'permissionId'])
    );
};

/** A DAO `applyMultiTargetPermissions` call: one `_items` tuple array of changes. */
const hasComponents = (
    parameter: IProposalActionInputDataParameter | undefined,
    expected: string[],
): boolean => {
    if (parameter == null) {
        return false;
    }

    const names = (parameter.components ?? []).map(
        (component) => component.name,
    );

    return (
        names.length === expected.length &&
        expected.every((name) => names.includes(name))
    );
};

const isMultiTargetPermissionsAction = (
    action: Pick<IProposalAction, 'inputData'>,
): boolean => {
    const { function: functionName, parameters } = action.inputData ?? {};
    const items = parameters?.[0];

    return (
        functionName === 'applyMultiTargetPermissions' &&
        parameters?.length === 1 &&
        items?.type === 'tuple[]' &&
        // The editor serialises rows by component name, so a tuple shaped differently
        // would be silently rewritten. Anything else keeps the kit's default fields.
        hasComponents(items, [
            'operation',
            'where',
            'who',
            'condition',
            'permissionId',
        ])
    );
};

/** A DAO `grant`/`revoke` call: (address _where, address _who, bytes32 _permissionId). */
const isPermissionManagerAction = (
    action: Pick<IProposalAction, 'inputData'>,
): boolean => {
    const { function: functionName, parameters } = action.inputData ?? {};

    return (
        (functionName === 'grant' || functionName === 'revoke') &&
        parameters?.length === 3 &&
        parameters[0]?.type === 'address' &&
        parameters[1]?.type === 'address' &&
        parameters[2]?.type === 'bytes32'
    );
};

/**
 * Any call that changes permissions: a single grant/revoke, or one of the bulk apply
 * actions. They carry the same risk, so they carry the same warning.
 */
const isAnyPermissionAction = (
    action: Pick<IProposalAction, 'inputData'>,
): boolean =>
    isPermissionManagerAction(action) ||
    isMultiTargetPermissionsAction(action) ||
    isSingleTargetPermissionsAction(action);

/**
 * Action-level risk warning for permission changes. Belongs to the action rather than the
 * permission field: it is about what the action does, not about one parameter's value.
 */
export const PermissionManagerRiskAlert: React.FC = () => {
    const { t } = useTranslations();

    return (
        <AlertCard
            className="w-full"
            message={t(
                'app.governance.actionComposer.permissionManagerAction.riskWarning.title',
            )}
            variant="warning"
        >
            {t(
                'app.governance.actionComposer.permissionManagerAction.riskWarning.description',
            )}
        </AlertCard>
    );
};

/**
 * Risk alert for `grant`/`revoke` actions, or undefined for anything else. Mirrors
 * {@link getPermissionManagerParameterComponents} so both surfaces stay in step.
 */
export const getPermissionManagerAlerts = (
    action: Pick<IProposalAction, 'inputData'>,
): React.ReactNode =>
    isAnyPermissionAction(action) ? <PermissionManagerRiskAlert /> : undefined;

/**
 * Component maps are cached by the values they close over. The decoder keys parameters
 * by component identity, so returning a fresh closure on every render remounts the
 * field and the input loses focus mid-typing. Caching here keeps every call site safe
 * rather than relying on each one to memoise.
 */
const componentMapCache = new Map<
    string,
    IProposalActionsDecoderProps['customParameterComponents']
>();

const cachedComponents = (
    key: string,
    build: () => IProposalActionsDecoderProps['customParameterComponents'],
) => {
    const cached = componentMapCache.get(key);

    if (cached) {
        return cached;
    }

    const built = build();
    componentMapCache.set(key, built);

    return built;
};

/**
 * Parameter overrides for permission actions.
 *
 * `editMode` is honoured because the multi-target list is read-only: attaching it in the
 * composer would remove the ability to edit an imported array, which the kit's default
 * fields still allow. `daoId` is passed through so addresses resolve to the DAO and its
 * plugin names — the decoder hands parameter components no action context of their own.
 *
 * Memoise at the call site: the multi-target entry is a closure, so a new object here
 * remounts the list on every render.
 */
export const getPermissionManagerParameterComponents = (
    action: Pick<IProposalAction, 'inputData'>,
    editMode = false,
    daoId?: string,
): IProposalActionsDecoderProps['customParameterComponents'] => {
    const daoKey = daoId ?? '';

    // Every parameter resolves, not just the ID: address parameters are named on read
    // and use the text input on edit, whichever permission action they belong to.
    const addressField = cachedComponents(`address:${daoKey}`, () => {
        const AddressField: ProposalActionsDecoderParameterComponent = (
            props,
        ) => <PermissionAddressField {...props} daoId={daoId} />;

        return { 0: AddressField, 1: AddressField };
    });
    const AddressField = addressField?.[0];

    if (isPermissionManagerAction(action)) {
        return cachedComponents(`grant:${daoKey}`, () => ({
            0: AddressField,
            1: AddressField,
            2: PermissionManagerPermissionField,
        }));
    }

    if (isMultiTargetPermissionsAction(action) && editMode) {
        return cachedComponents('multi:edit', () => ({
            0: PermissionChangesEditor,
        }));
    }

    if (isSingleTargetPermissionsAction(action) && editMode) {
        // No value is closed over here, so the identity never changes as the user types.
        return cachedComponents('single:edit', () => {
            const SingleTargetEditor: ProposalActionsDecoderParameterComponent =
                (props) => (
                    <PermissionChangesEditor {...props} hoistsTarget={true} />
                );

            return { 0: AddressField, 1: SingleTargetEditor };
        });
    }

    if (editMode) {
        return undefined;
    }

    if (isMultiTargetPermissionsAction(action)) {
        return cachedComponents(`multi:read:${daoKey}`, () => {
            const MultiTargetList: ProposalActionsDecoderParameterComponent = (
                props,
            ) => <MultiTargetPermissionsList {...props} daoId={daoId} />;

            return { 0: MultiTargetList };
        });
    }

    if (isSingleTargetPermissionsAction(action)) {
        const fallbackWhere =
            action.inputData?.parameters[0]?.value?.toString() ?? '';

        return cachedComponents(
            `single:read:${daoKey}:${fallbackWhere}`,
            () => {
                const SingleTargetList: ProposalActionsDecoderParameterComponent =
                    (props) => (
                        <MultiTargetPermissionsList
                            {...props}
                            daoId={daoId}
                            fallbackWhere={fallbackWhere}
                        />
                    );

                return { 0: AddressField, 1: SingleTargetList };
            },
        );
    }

    return undefined;
};
