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

export interface IUpgradeOsxProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const UpgradeOsx: React.FC<IUpgradeOsxProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const daoPlugins = useDaoPlugins({ daoId });

    invariant(daoPlugins != null, 'UpgradeOsx: daoPlugins is undefined');

    const [selectedPlugin, setSelectedPlugin] = useState<IDaoPlugin>(daoPlugins[0].meta);

    const { check: createProposalGuard } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        plugin: selectedPlugin,
        daoId,
    });

    const onUpgradeClicked = () => {
        const params: ISelectPluginDialogParams = {
            daoId,
            onPluginSelected: handlePluginSelected,
        };
        open(GovernanceDialogId.SELECT_PLUGIN, { params });
    };

    const handlePluginSelected = (plugin: IDaoPlugin) => {
        setSelectedPlugin(plugin);
        createProposalGuard({ plugin, onSuccess: () => handleSuccess(plugin) });
    };

    const handleSuccess = (selectedPlugin: IDaoPlugin) => {
        console.log('handleSuccess', selectedPlugin);
    };

    const upgradablePlugins = useMemo(
        () => daoPlugins.filter((plugin) => pluginVersionUtils.needsUpgrade(plugin.meta)),
        [daoPlugins],
    );

    if (upgradablePlugins.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col space-y-3">
            <Button onClick={onUpgradeClicked} iconLeft={IconType.RELOAD} variant="secondary">
                {t('app.settings.upgradeOsx.button')}
            </Button>
            <p className="text-sm text-neutral-500">{t('app.settings.upgradeOsx.description')}</p>
        </div>
    );
};
