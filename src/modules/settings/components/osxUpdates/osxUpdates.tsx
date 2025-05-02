import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { pluginVersionUtils } from '@/shared/utils/pluginVersionUtils';
import { Button, IconType, invariant } from '@aragon/gov-ui-kit';
import { useMemo, useState } from 'react';
import type { IUpdateContractsDialogParams } from '../../dialogs/updateContractsDialog';
import { SettingsDialogId } from '../../constants/settingsDialogId';

export interface IOsxUpdatesProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const OsxUpdates: React.FC<IOsxUpdatesProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const daoPlugins = useDaoPlugins({ daoId });

    invariant(daoPlugins != null, 'OsxUpdates: No plugins');

    const [selectedPlugin, setSelectedPlugin] = useState<IDaoPlugin>(daoPlugins[0].meta);

    const { check: createProposalGuard } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        plugin: selectedPlugin,
        daoId,
    });

    const onUpgradeClicked = () => {
        const params: ISelectPluginDialogParams = { daoId, onPluginSelected };

        open(GovernanceDialogId.SELECT_PLUGIN, { params });
    };

    const onPluginSelected = (plugin: IDaoPlugin) => {
        setSelectedPlugin(plugin);
        createProposalGuard({ plugin, onSuccess: () => handleSuccess(plugin) });
    };

    const handleSuccess = (selectedPlugin: IDaoPlugin) => {
        const params: IUpdateContractsDialogParams = {
            process: selectedPlugin,
            plugins: upgradablePlugins.map((plugin) => plugin.meta),
        };

        open(SettingsDialogId.UPDATE_CONTRACTS, { params });
    };

    const upgradablePlugins = useMemo(
        () => daoPlugins.filter((plugin) => pluginVersionUtils.pluginNeedsUpgrade(plugin.meta)),
        [daoPlugins],
    );

    if (upgradablePlugins.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col space-y-3">
            <Button onClick={onUpgradeClicked} iconLeft={IconType.RELOAD} variant="secondary">
                {t('app.settings.osxUpdates.button')}
            </Button>
            <p className="text-sm text-neutral-500">{t('app.settings.osxUpdates.description')}</p>
        </div>
    );
};
