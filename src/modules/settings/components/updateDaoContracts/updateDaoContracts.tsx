import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { SettingsDialogId } from '@/modules/settings/constants/settingsDialogId';
import { type IDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Button, IconType } from '@aragon/gov-ui-kit';
import type { IUpdateDaoContractsListDialogParams } from '../../dialogs/updateDaoContractsListDialog';

export interface IUpdateDaoContractsProps {
    /**
     * The DAO to check contracts updates for.
     */
    dao: IDao;
}

export const UpdateDaoContracts: React.FC<IUpdateDaoContractsProps> = (props) => {
    const { dao } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { check: createProposalGuard } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        plugin: dao.plugins[0],
        daoId: dao.id,
    });

    // Do not show the plugin selector when DAO only has one plugin
    const handleUpgradeClick = () => {
        if (dao.plugins.length === 1) {
            onPluginSelected(dao.plugins[0]);
        } else {
            const params: ISelectPluginDialogParams = { daoId: dao.id, onPluginSelected };
            open(GovernanceDialogId.SELECT_PLUGIN, { params });
        }
    };

    const onPluginSelected = (plugin: IDaoPlugin) =>
        createProposalGuard({ plugin, onSuccess: () => handlePermissionCheckSuccess(plugin) });

    const handlePermissionCheckSuccess = (plugin: IDaoPlugin) => {
        const params: IUpdateDaoContractsListDialogParams = { plugin, daoId: dao.id };
        open(SettingsDialogId.UPDATE_DAO_CONTRACTS_LIST, { params });
    };

    const availableUpdates = daoUtils.hasAvailableUpdates(dao);

    if (!availableUpdates.osx && !availableUpdates.plugins) {
        return null;
    }

    return (
        <div className="flex flex-col space-y-3">
            <Button onClick={handleUpgradeClick} iconLeft={IconType.RELOAD} variant="secondary" size="md">
                {t('app.settings.updateDaoContracts.button')}
            </Button>
            <p className="text-sm text-neutral-500">{t('app.settings.updateDaoContracts.description')}</p>
        </div>
    );
};
