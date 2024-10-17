import { type IDaoPlugin, type Network } from '@/shared/api/daoService';
import { type IResource } from '@/shared/api/daoService/domain/resource';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    addressUtils,
    ChainEntityType,
    DateFormat,
    DefinitionList,
    formatterUtils,
    IconType,
    Link,
    useBlockExplorer,
} from '@aragon/ods';

export interface IDaoPlugInfoProps {
    /**
     * The DAO plugin to display information for.
     */
    plugin: IDaoPlugin;
    /**
     * The type of plugin.
     */
    type: PluginType;
    /**
     * The DAO ID.
     */
    daoId: string;
}

export const DaoPluginInfo: React.FC<IDaoPlugInfoProps> = (props) => {
    const { plugin, type, daoId } = props;

    const { t } = useTranslations();

    const networkName = daoId?.split('-').slice(0, 2).join('-') as Network;
    const chainId = networkDefinitions[networkName].chainId;

    const { buildEntityUrl } = useBlockExplorer();

    const pluginLaunchedAt = formatterUtils.formatDate(plugin.blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH,
    });
    const pluginCreationLink = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: plugin.address, chainId });

    return (
        <>
            <div className="gap-y-4">
                {plugin.description && <p className="text-neutral-500">{plugin.description}</p>}
                {plugin.resources?.map((resource: IResource, index: number) => (
                    <div key={index}>
                        <Link
                            description={resource.url}
                            href={resource.url}
                            target="_blank"
                            iconRight={IconType.LINK_EXTERNAL}
                        >
                            {resource.name}
                        </Link>
                    </div>
                ))}
            </div>
            <DefinitionList.Container>
                {plugin.name && (
                    <DefinitionList.Item
                        term={t(
                            type === PluginType.PROCESS
                                ? 'app.settings.details.processName'
                                : 'app.settings.details.bodyName',
                        )}
                    >
                        <p className="text-neutral-500">{daoUtils.getPluginName(plugin)}</p>
                    </DefinitionList.Item>
                )}
                {type === PluginType.PROCESS && plugin.processKey && (
                    <DefinitionList.Item term={t('app.settings.details.processKey')} className="text-neutral-500">
                        <p className="text-neutral-500"> {plugin.processKey}</p>
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item term={t('app.settings.details.plugin')}>
                    <Link
                        description={addressUtils.truncateAddress(plugin.address)}
                        iconRight={IconType.LINK_EXTERNAL}
                        href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: plugin.address, chainId })}
                        target="_blank"
                    >
                        {t('app.settings.details.pluginVersionInfo', {
                            name: daoUtils.getPluginName(plugin),
                            release: plugin.release,
                            build: plugin.build,
                        })}
                    </Link>
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.settings.details.launchedAt')}>
                    <Link href={pluginCreationLink} target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                        {pluginLaunchedAt}
                    </Link>
                </DefinitionList.Item>
            </DefinitionList.Container>
        </>
    );
};
