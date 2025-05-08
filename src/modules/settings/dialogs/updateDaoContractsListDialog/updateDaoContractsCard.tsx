import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IPluginInfo } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { addressUtils, DataList, IconType, Link } from '@aragon/gov-ui-kit';

interface IUpdateDaoContractsCardProps {
    /**
     * The plugin to be updated.
     */
    plugin: IDaoPlugin;
}

export const UpdateDaoContractsCard: React.FC<IUpdateDaoContractsCardProps> = (props) => {
    const { plugin } = props;
    const { address, subdomain, release, build } = plugin;

    const { t } = useTranslations();

    const target = pluginRegistryUtils.getPlugin(subdomain) as IPluginInfo;
    const { release: targetRelease, build: targetBuild } = target.installVersion;

    const pluginName = daoUtils.getPluginName(plugin);
    const parsedSubdomain = daoUtils.parsePluginSubdomain(plugin.subdomain);
    const fromVersion = `${parsedSubdomain} v${release}.${build}`;
    const toVersion = `${parsedSubdomain} v${targetRelease.toString()}.${targetBuild.toString()}`;

    return (
        <DataList.Item className="flex flex-col gap-6 py-6">
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <p className="text-neutral-800">{pluginName}</p>
                    <p className="text-neutral-500">{addressUtils.truncateAddress(address)}</p>
                </div>
                <p className="text-neutral-500">
                    {t('app.settings.updateDaoContractsCard.versionUpdate', {
                        from: fromVersion,
                        to: toVersion,
                    })}
                </p>
            </div>
            <Link href={target.releaseNotesUrl} target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                {t('app.settings.updateDaoContractsCard.releaseNotes')}
            </Link>
        </DataList.Item>
    );
};
