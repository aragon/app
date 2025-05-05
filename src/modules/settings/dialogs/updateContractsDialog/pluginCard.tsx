import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IPluginInfo } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { addressUtils, Card, IconType, Link } from '@aragon/gov-ui-kit';

interface IPluginCardProps {
    /**
     * The plugin to be updated.
     */
    plugin: IDaoPlugin;
}

export const PluginCard: React.FC<IPluginCardProps> = (props) => {
    const { plugin } = props;
    const { address, subdomain, release, build } = plugin;

    const { t } = useTranslations();

    const target = pluginRegistryUtils.getPlugin(subdomain) as IPluginInfo;
    const { release: targetRelease, build: targetBuild } = target.installVersion;

    const pluginName = daoUtils.getPluginName(plugin);
    const fromVersion = `${pluginName} v${release}.${build}`;
    const toVersion = `${pluginName} v${targetRelease.toString()}.${targetBuild.toString()}`;

    return (
        <Card className="border border-neutral-100 p-6 shadow-neutral-sm">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <p className="text-neutral-800">{pluginName}</p>
                        <p className="text-neutral-500">{addressUtils.truncateAddress(address)}</p>
                    </div>
                    <p className="text-neutral-500">
                        {t('app.settings.updateContractsDialog.plugin.update', { from: fromVersion, to: toVersion })}
                    </p>
                </div>
                <Link href={target.releaseNotesUrl} target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                    {t('app.settings.updateContractsDialog.plugin.link')}
                </Link>
            </div>
        </Card>
    );
};
