import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { SettingsDialogId } from '@/modules/settings/constants/settingsDialogId';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import type { IPluginInfo } from '@/shared/types';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginVersionUtils } from '@/shared/utils/pluginVersionUtils';
import { Button, IconType } from '@aragon/gov-ui-kit';
import type { IUpdateDaoContractsListDialogParams } from '../../dialogs/updateDaoContractsListDialog';

export interface IUpdateDaoContractsProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const UpdateDaoContracts: React.FC<IUpdateDaoContractsProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const daoPlugins = useDaoPlugins({ daoId })!;

    const { check: createProposalGuard } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        plugin: daoPlugins[0].meta,
        daoId,
    });

    const handleUpgradeClick = () => {
        const params: ISelectPluginDialogParams = { daoId, onPluginSelected };

        open(GovernanceDialogId.SELECT_PLUGIN, { params });
    };

    const onPluginSelected = (plugin: IDaoPlugin) => {
        createProposalGuard({ plugin, onSuccess: () => handlePermissionCheckSuccess(plugin) });
    };

    const handlePermissionCheckSuccess = (selectedPlugin: IDaoPlugin) => {
        const params: IUpdateDaoContractsListDialogParams = { process: selectedPlugin, daoId };

        open(SettingsDialogId.UPDATE_DAO_CONTRACTS, { params });
    };

    const showUpdateButton = daoPlugins.some((plugin) => {
        const target = pluginRegistryUtils.getPlugin(plugin.meta.subdomain) as IPluginInfo | undefined;

        return pluginVersionUtils.isLessThan(plugin.meta, target?.installVersion);
    });

    if (!showUpdateButton) {
        return null;
    }

    return (
        <div className="flex flex-col space-y-3">
            <Button onClick={handleUpgradeClick} iconLeft={IconType.RELOAD} variant="secondary">
                {t('app.settings.updateDaoContracts.button')}
            </Button>
            <p className="text-sm text-neutral-500">{t('app.settings.updateDaoContracts.description')}</p>
        </div>
    );
};
