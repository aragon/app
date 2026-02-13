import { DialogAlert, DialogAlertFooter, invariant } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { policyPluginRegistryUtils } from '@/modules/capitalFlow/utils/policyPluginRegistryUtils';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import type { IDaoPlugin, IDaoPolicy } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IPluginEventLog } from '../../api/settingsService';
import { SettingsDialogId } from '../../constants/settingsDialogId';
import type { IPreparePluginUninstallationDialogParams } from '../preparePluginUninstallationDialog';
import { preparePluginUninstallationDialogUtils } from '../preparePluginUninstallationDialog/preparePluginUninstallationDialogUtils';

export interface IUninstallPluginAlertDialogParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Plugin to be uninstalled.
     */
    uninstallPlugin: IDaoPlugin | IDaoPolicy;
    /**
     *  Tx log for UninstallationPrepared event, if available. This means that
     *  the plugin uninstallation was already prepared but not applied yet.
     */
    uninstallationPreparedEventLog?: IPluginEventLog;
}

export interface IUninstallPluginAlertDialogProps
    extends IDialogComponentProps<IUninstallPluginAlertDialogParams> {}

export const UninstallPluginAlertDialog: React.FC<
    IUninstallPluginAlertDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'UninstallPluginAlertDialog: required parameters must be set.',
    );

    const { daoId, uninstallPlugin, uninstallationPreparedEventLog } =
        location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const isPolicy = policyPluginRegistryUtils.isPolicy(uninstallPlugin);
    const translationNamespace = isPolicy
        ? 'app.settings.uninstallPolicyAlertDialog'
        : 'app.settings.uninstallPluginAlertDialog';
    const uninstallTargetName =
        preparePluginUninstallationDialogUtils.getUninstallTargetName(
            uninstallPlugin,
        );

    const [selectedPlugin, setSelectedPlugin] = useState<IDaoPlugin>();

    const handleGuardSuccess = (proposalPlugin: IDaoPlugin) => {
        const params: IPreparePluginUninstallationDialogParams = {
            daoId,
            uninstallPlugin,
            proposalPlugin,
            uninstallationPreparedEventLog,
        };
        open(SettingsDialogId.PREPARE_PLUGIN_UNINSTALLATION, { params });
    };

    const handlePluginSelected = (proposalPlugin: IDaoPlugin) => {
        setSelectedPlugin(proposalPlugin);
        createProposalGuard({
            plugin: proposalPlugin,
            onSuccess: () => handleGuardSuccess(proposalPlugin),
        });
    };

    const handleSelectPluginClick = () => {
        const excludePluginIds =
            !isPolicy && uninstallPlugin.slug != null
                ? [uninstallPlugin.slug]
                : [];
        const params: ISelectPluginDialogParams = {
            daoId,
            excludePluginIds,
            onPluginSelected: handlePluginSelected,
            fullExecuteOnly: true,
        };
        open(GovernanceDialogId.SELECT_PLUGIN, { params });
    };

    const { check: createProposalGuard } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        plugin: selectedPlugin,
        daoId,
    });

    return (
        <>
            <DialogAlert.Header
                title={t(`${translationNamespace}.title`, {
                    name: uninstallTargetName,
                    slug: isPolicy
                        ? undefined
                        : uninstallPlugin.slug.toUpperCase(),
                })}
            />
            <DialogAlert.Content>
                <div className="flex flex-col gap-y-4 pb-4 font-normal text-base text-neutral-500 leading-normal">
                    <p>{t(`${translationNamespace}.description.1`)}</p>
                    <p>{t(`${translationNamespace}.description.2`)}</p>
                </div>
            </DialogAlert.Content>
            <DialogAlertFooter
                actionButton={{
                    label: t(`${translationNamespace}.action.select`),
                    onClick: handleSelectPluginClick,
                }}
                cancelButton={{
                    label: t(`${translationNamespace}.action.cancel`),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
