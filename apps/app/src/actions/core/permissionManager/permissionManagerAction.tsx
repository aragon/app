'use client';

import {
    addressUtils,
    IconType,
    InputText,
    type IProposalAction,
    type IProposalActionInputDataParameter,
    type IProposalActionsDecoderParameterComponentProps,
    type IProposalActionsDecoderProps,
    ProposalActionsDecoderMode,
    Tag,
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
    info: addressUtils.truncateHash(id),
}));

type PermissionManagerFormValues = Record<string, string>;

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
            rules: { required: true },
            sanitizeMode: 'none',
        },
    );
    const permissionId = permissionField.value ?? '';
    const selectedPermission = permissionOptions.find(
        ({ id }) => id.toLowerCase() === permissionId.toLowerCase(),
    );

    return (
        <AutocompleteInput
            alert={permissionField.alert}
            helpText={
                permissionId ||
                t(
                    'app.governance.actionComposer.permissionManagerAction.permission.helpText',
                )
            }
            items={permissionItems}
            label={t(
                'app.governance.actionComposer.permissionManagerAction.permission.label',
            )}
            name={permissionField.name}
            onBlur={permissionField.onBlur}
            onChange={permissionField.onChange}
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
 * Read-only rendering of the permission parameter. Keeps the decoder's own text
 * field untouched (`name (type)` label, natspec notice as help text, raw bytes32
 * value) and adds the resolved permission name as a tag underneath. Unknown hashes
 * render no tag.
 */
const PermissionManagerPermissionDisplay: React.FC<{
    parameter: IProposalActionInputDataParameter;
    permissionId: string;
}> = ({ parameter, permissionId }) => {
    const knownPermission = permissionOptions.find(
        ({ id }) => id.toLowerCase() === permissionId.toLowerCase(),
    );

    const label = (
        <>
            {parameter.name}{' '}
            <span className="text-neutral-500">({parameter.type})</span>
        </>
    );

    return (
        <div className="flex flex-col gap-2">
            <InputText
                disabled={true}
                helpText={parameter.notice}
                label={label}
                value={permissionId}
            />
            {knownPermission && (
                <Tag
                    className="w-fit"
                    label={knownPermission.name}
                    variant="success"
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

const permissionParameterComponents = {
    2: PermissionManagerPermissionField,
};

export const getPermissionManagerParameterComponents = (
    action: Pick<IProposalAction, 'inputData'>,
): IProposalActionsDecoderProps['customParameterComponents'] => {
    const { function: functionName, parameters } = action.inputData ?? {};
    const isPermissionManagerAction =
        (functionName === 'grant' || functionName === 'revoke') &&
        parameters?.length === 3 &&
        parameters[0]?.type === 'address' &&
        parameters[1]?.type === 'address' &&
        parameters[2]?.type === 'bytes32';

    return isPermissionManagerAction
        ? permissionParameterComponents
        : undefined;
};
