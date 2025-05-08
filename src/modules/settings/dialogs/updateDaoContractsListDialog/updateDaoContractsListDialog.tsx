import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IPluginInfo } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { SettingsDialogId } from '../../constants/settingsDialogId';
import type { IPrepareDaoContractsUpdateDialogParams } from '../prepareDaoContractsUpdateDialog';
import { UpdateDaoContractsCard } from './updateDaoContractsCard';

export interface IUpdateDaoContractsListDialogParams {
    /**
     * The process that was selected to publish the proposal.
     */
    plugin: IDaoPlugin;
    /**
     * The ID of the DAO.
     */
    daoId: string;
}

export interface IUpdateDaoContractsListDialogProps
    extends IDialogComponentProps<IUpdateDaoContractsListDialogParams> {}

export const UpdateDaoContractsListDialog: React.FC<IUpdateDaoContractsListDialogProps> = (props) => {
    const { location } = props;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();

    invariant(location.params != null, 'UpdateDaoContractsListDialog: required parameters must be set.');
    const { plugin, daoId } = location.params;

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    invariant(dao != null, 'UpdateDaoContractsListDialog: DAO must be defined.');

    const hasOsxUpdate = daoUtils.hasAvailableOsxUpdate(dao);
    const newProtocolVersion = networkDefinitions[dao.network].protocolVersion;
    const pluginUpdates = daoUtils.getAvailablePluginUpdates(dao);

    const handleConfimClick = () => {
        const params: IPrepareDaoContractsUpdateDialogParams = { daoId, plugin };
        open(SettingsDialogId.PREPARE_DAO_CONTRACTS_UPDATE, { params });
    };

    return (
        <>
            <Dialog.Header onClose={close} title={t('app.settings.updateDaoContractsListDialog.title')} />
            <Dialog.Content description={t('app.settings.updateDaoContractsListDialog.description')}>
                <div className="flex flex-col gap-3 pb-6">
                    {hasOsxUpdate && (
                        <UpdateDaoContractsCard
                            key="osx"
                            name={t('app.settings.updateDaoContractsListDialog.osxUpdate.name')}
                            smartContractName={t(
                                'app.settings.updateDaoContractsListDialog.osxUpdate.smartContractName',
                            )}
                            address={dao.address}
                            currentVersion={dao.version}
                            newVersion={newProtocolVersion}
                        />
                    )}
                    {pluginUpdates.map((plugin) => (
                        <UpdateDaoContractsCard
                            key={plugin.address}
                            name={daoUtils.getPluginName(plugin)}
                            smartContractName={daoUtils.parsePluginSubdomain(plugin.subdomain)}
                            address={plugin.address}
                            currentVersion={plugin}
                            newVersion={(pluginRegistryUtils.getPlugin(plugin.subdomain) as IPluginInfo).installVersion}
                        />
                    ))}
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.settings.updateDaoContractsListDialog.action.confirm'),
                    onClick: handleConfimClick,
                }}
                secondaryAction={{
                    label: t('app.settings.updateDaoContractsListDialog.action.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
