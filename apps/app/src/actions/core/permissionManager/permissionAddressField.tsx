'use client';

import {
    addressUtils,
    DefinitionList,
    InputText,
    type IProposalActionsDecoderParameterComponentProps,
    ProposalActionsDecoderMode,
} from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useFormField } from '@/shared/hooks/useFormField';
import { daoUtils } from '@/shared/utils/daoUtils';

const copyPrefix =
    'app.governance.actionComposer.permissionManagerAction.multiTarget';

const getFieldPath = (fieldName: string, formPrefix?: string): string =>
    [formPrefix, fieldName].filter(Boolean).join('.');

export interface IPermissionAddressFieldProps
    extends IProposalActionsDecoderParameterComponentProps {
    /**
     * DAO the action belongs to, used to name the address.
     */
    daoId?: string;
}

const PermissionAddressEdit: React.FC<IPermissionAddressFieldProps> = ({
    parameter,
    fieldName,
    formPrefix,
}) => {
    const { t } = useTranslations();
    const field = useFormField<Record<string, string>, string>(
        getFieldPath(fieldName, formPrefix),
        {
            // The ABI names the parameter; do not invent a label for it.
            label: parameter.name,
            rules: {
                required: true,
                // Same check the kit's default decoder field applies to address
                // parameters, so replacing it does not weaken validation.
                validate: (value?: string) =>
                    addressUtils.isAddress(value, { strict: true }) ||
                    t(
                        'app.governance.actionComposer.permissionManagerAction.multiTarget.invalidAddress',
                    ),
            },
            sanitizeMode: 'none',
        },
    );

    return (
        <InputText
            alert={field.alert}
            helpText={parameter.notice}
            label={`${parameter.name} (${parameter.type})`}
            name={field.name}
            onBlur={field.onBlur}
            onChange={field.onChange}
            value={field.value ?? ''}
            variant={field.variant}
        />
    );
};

/**
 * Names an address using what the app already knows: the DAO itself, then its plugins.
 * Returns undefined when nothing matches, so the raw address stays the value rather than
 * the account being presented as anonymous.
 */
const PermissionAddressRead: React.FC<
    IPermissionAddressFieldProps & { address: string }
> = ({ parameter, address, daoId }) => {
    const { t } = useTranslations();
    const daoPlugins = useDaoPlugins({ daoId: daoId ?? '' });

    const resolveLabel = (): string | undefined => {
        if (!(address && daoId)) {
            return undefined;
        }

        if (
            addressUtils.isAddressEqual(
                address,
                daoUtils.parseDaoId(daoId).address,
            )
        ) {
            return t(`${copyPrefix}.thisDao`);
        }

        const plugin = daoPlugins?.find((item) =>
            addressUtils.isAddressEqual(item.meta.address, address),
        );

        return plugin ? daoUtils.getPluginName(plugin.meta) : undefined;
    };

    const label = resolveLabel();

    return (
        <DefinitionList.Container>
            <DefinitionList.Item
                copyValue={address || undefined}
                description={
                    label
                        ? [
                              parameter.notice,
                              addressUtils.truncateAddress(address),
                          ]
                              .filter(Boolean)
                              .join(' · ')
                        : parameter.notice
                }
                term={`${parameter.name} (${parameter.type})`}
            >
                {label ?? address}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};

const PermissionAddressWatch: React.FC<IPermissionAddressFieldProps> = (
    props,
) => {
    const address = useWatch<Record<string, string>>({
        name: getFieldPath(props.fieldName, props.formPrefix),
    });

    return <PermissionAddressRead {...props} address={address ?? ''} />;
};

/**
 * `_where` / `_who` on a permission action. Editing uses the address input so ENS works
 * and the value is validated; reading names the address instead of showing bare hex.
 */
export const PermissionAddressField: React.FC<IPermissionAddressFieldProps> = (
    props,
) => {
    if (props.mode === ProposalActionsDecoderMode.EDIT) {
        return <PermissionAddressEdit {...props} />;
    }

    if (props.mode === ProposalActionsDecoderMode.WATCH) {
        return <PermissionAddressWatch {...props} />;
    }

    return (
        <PermissionAddressRead
            {...props}
            address={props.parameter.value?.toString() ?? ''}
        />
    );
};
