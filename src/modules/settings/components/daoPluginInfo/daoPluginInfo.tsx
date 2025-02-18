import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
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
} from '@aragon/gov-ui-kit';

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
    const { buildEntityUrl } = useBlockExplorer();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    if (dao == null) {
        return null;
    }

    const { blockTimestamp, transactionHash, description, links, name, processKey, address } = plugin;
    const pluginLaunchedAt = formatterUtils.formatDate(blockTimestamp * 1000, { format: DateFormat.YEAR_MONTH });

    const { id: chainId } = networkDefinitions[dao.network];
    const pluginCreationLink = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: transactionHash, chainId });

    return (
        <div className="flex flex-col gap-y-6">
            {description && <p className="text-neutral-500">{description}</p>}
            {links?.map((resource: IResource, index: number) => (
                <div className="flex flex-col gap-y-3" key={index}>
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
            <DefinitionList.Container>
                {name && (
                    <DefinitionList.Item
                        term={t(
                            type === PluginType.PROCESS
                                ? 'app.settings.daoPluginInfo.processName'
                                : 'app.settings.daoPluginInfo.bodyName',
                        )}
                    >
                        <p className="text-neutral-500">{daoUtils.getPluginName(plugin)}</p>
                    </DefinitionList.Item>
                )}
                {processKey && type === PluginType.PROCESS && (
                    <DefinitionList.Item term={t('app.settings.daoPluginInfo.processKey')} className="text-neutral-500">
                        <p className="uppercase text-neutral-500"> {processKey}</p>
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item term={t('app.settings.daoPluginInfo.plugin')}>
                    <Link
                        description={addressUtils.truncateAddress(address)}
                        iconRight={IconType.LINK_EXTERNAL}
                        href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address, chainId })}
                        target="_blank"
                    >
                        {t('app.settings.daoPluginInfo.pluginVersionInfo', {
                            name: daoUtils.getPluginName(plugin),
                            release: plugin.release,
                            build: plugin.build,
                        })}
                    </Link>
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.settings.daoPluginInfo.launchedAt')}>
                    <Link href={pluginCreationLink} target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                        {pluginLaunchedAt}
                    </Link>
                </DefinitionList.Item>
            </DefinitionList.Container>
        </div>
    );
};
