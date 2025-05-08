import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { SettingsDialogId } from '@/modules/settings/constants/settingsDialogId';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
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

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { check: createProposalGuard } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        plugin: dao!.plugins[0],
        daoId,
    });

    const handleUpgradeClick = () => {
        // If there is only one plugin then no need to show the select plugin dialog
        if (daoPlugins.length === 1) {
            onPluginSelected(daoPlugins[0].meta);
            return;
        }
        const params: ISelectPluginDialogParams = { daoId, onPluginSelected };
        open(GovernanceDialogId.SELECT_PLUGIN, { params });
    };

    const onPluginSelected = (plugin: IDaoPlugin) =>
        createProposalGuard({ plugin, onSuccess: () => handlePermissionCheckSuccess(plugin) });

    const handlePermissionCheckSuccess = (plugin: IDaoPlugin) => {
        const params: IUpdateDaoContractsListDialogParams = { plugin, daoId };
        open(SettingsDialogId.UPDATE_DAO_CONTRACTS_LIST, { params });
    };

    const availableUpdates = daoUtils.hasAvailableUpdates(dao);

    if (!availableUpdates.osx && !availableUpdates.plugins) {
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
