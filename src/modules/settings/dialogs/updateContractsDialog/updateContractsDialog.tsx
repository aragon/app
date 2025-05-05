import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import type { IPluginInfo } from '@/shared/types';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginVersionUtils } from '@/shared/utils/pluginVersionUtils';
import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { PluginCard } from './pluginCard';

export interface IUpdateContractsDialogParams {
    /**
     * The process that was selected to publish the proposal.
     */
    process: IDaoPlugin;
    /**
     * The ID of the DAO.
     */
    daoId: string;
}

export interface IUpdateContractsDialogProps extends IDialogComponentProps<IUpdateContractsDialogParams> {}

export const UpdateContractsDialog: React.FC<IUpdateContractsDialogProps> = (props) => {
    const { location } = props;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    invariant(location.params != null, 'UpdateContractsDialog: required parameters must be set.');

    const { process, daoId } = location.params;

    const daoPlugins = useDaoPlugins({ daoId })!;

    const pluginsToUpdate = daoPlugins.filter((plugin) => {
        const target = pluginRegistryUtils.getPlugin(plugin.meta.subdomain) as IPluginInfo | undefined;

        return pluginVersionUtils.isLessThan(plugin.meta, target?.installVersion);
    });

    const plugins = pluginsToUpdate.map((plugin) => plugin.meta);

    const onPropose = () => {
        // TODO: Open publish proposal dialog
        console.log('plugins', plugins);
        console.log('process', process);
    };

    return (
        <>
            <Dialog.Header onClose={close} title={t('app.settings.updateContractsDialog.title')} />
            <Dialog.Content description={t('app.settings.updateContractsDialog.description')}>
                {plugins.map((plugin) => (
                    <PluginCard key={plugin.address} plugin={plugin} />
                ))}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.settings.updateContractsDialog.action.confirm'),
                    onClick: onPropose,
                }}
                secondaryAction={{
                    label: t('app.settings.updateContractsDialog.action.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
