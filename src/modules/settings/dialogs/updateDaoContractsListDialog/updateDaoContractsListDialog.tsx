import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import type { IPluginInfo } from '@/shared/types';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginVersionUtils } from '@/shared/utils/pluginVersionUtils';
import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { UpdateDaoContractsCard } from './updateDaoContractsCard';

export interface IUpdateDaoContractsListDialogParams {
    /**
     * The process that was selected to publish the proposal.
     */
    process: IDaoPlugin;
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
    const { close } = useDialogContext();

    invariant(location.params != null, 'UpdateDaoContractsListDialog: required parameters must be set.');

    const { process, daoId } = location.params;

    const daoPlugins = useDaoPlugins({ daoId })!;

    const pluginsToUpdate = daoPlugins.filter((plugin) => {
        const target = pluginRegistryUtils.getPlugin(plugin.meta.subdomain) as IPluginInfo | undefined;

        return pluginVersionUtils.isLessThan(plugin.meta, target?.installVersion);
    });

    const plugins = pluginsToUpdate.map((plugin) => plugin.meta);

    const handlePrimaryAction = () => {
        // TODO: Open publish proposal dialog
        // eslint-disable-next-line no-console
        console.log('Publish proposal for process', process);
        close();
    };

    return (
        <>
            <Dialog.Header onClose={close} title={t('app.settings.updateDaoContractsListDialog.title')} />
            <Dialog.Content description={t('app.settings.updateDaoContractsListDialog.description')}>
                {plugins.map((plugin) => (
                    <UpdateDaoContractsCard key={plugin.address} plugin={plugin} />
                ))}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.settings.updateDaoContractsListDialog.action.confirm'),
                    onClick: handlePrimaryAction,
                }}
                secondaryAction={{
                    label: t('app.settings.updateDaoContractsListDialog.action.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
