import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
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
    const { open } = useDialogContext();

    invariant(location.params != null, 'UpdateDaoContractsListDialog: required parameters must be set.');

    const { plugin, daoId } = location.params;

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const pluginUpdates = daoUtils.getAvailablePluginUpdates(dao);

    const handleConfimClick = () => {
        const params: IPrepareDaoContractsUpdateDialogParams = { daoId, plugin };
        open(SettingsDialogId.PREPARE_DAO_CONTRACTS_UPDATE, { params });
    };

    return (
        <>
            <Dialog.Header onClose={close} title={t('app.settings.updateDaoContractsListDialog.title')} />
            <Dialog.Content description={t('app.settings.updateDaoContractsListDialog.description')}>
                {pluginUpdates.map((plugin) => (
                    <UpdateDaoContractsCard key={plugin.address} plugin={plugin} />
                ))}
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
