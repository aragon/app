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
} from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { AutocompleteInput } from '@/shared/components/forms/autocompleteInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';

const permissionOptions = permissionNameUtils.getKnownPermissions();
const permissionItems = permissionOptions.map(({ id, name }) => ({
    id,
    name,
    icon: IconType.APP_PERMISSIONS,
    // Permission names are jargon on their own, so the second line carries a description
    // where we have one and falls back to the hash the name maps to.
    info:
        permissionNameUtils.getPermissionDescription(name) ??
        addressUtils.truncateHash(id),
}));

type PermissionManagerFormValues = Record<string, string>;

/** Synthetic option letting a permission outside the dictionary be entered by hash. */
const customPermissionItemId = 'custom-permission-id';
const permissionIdRegex = /^0x[0-9a-f]{64}$/iu;

const PermissionManagerPermissionEditField: React.FC<
    IProposalActionsDecoderParameterComponentProps
> = ({ fieldName, formPrefix }) => {
    const { t } = useTranslations();
    const resolvedFieldName = [formPrefix, fieldName].filter(Boolean).join('.');
    const permissionField = useFormField<PermissionManagerFormValues, string>(
        resolvedFieldName,
        {
            label: t(
                'app.governance.actionComposer.permissionManagerAction.permission.label',
            ),
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
            return addressUtils.truncateHash(permissionId);
        }

        return t(
            isValidId
                ? 'app.governance.actionComposer.permissionManagerAction.permission.unknown'
                : 'app.governance.actionComposer.permissionManagerAction.permission.invalid',
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
            label={t(
                'app.governance.actionComposer.permissionManagerAction.permission.label',
            )}
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
    isPermissionManagerAction(action) ? (
        <PermissionManagerRiskAlert />
    ) : undefined;

const permissionParameterComponents = {
    2: PermissionManagerPermissionField,
};

export const getPermissionManagerParameterComponents = (
    action: Pick<IProposalAction, 'inputData'>,
): IProposalActionsDecoderProps['customParameterComponents'] =>
    isPermissionManagerAction(action)
        ? permissionParameterComponents
        : undefined;
