import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
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

export interface IDaoContractInfoProps {
    daoId: string;
    plugin: IDaoPlugin;
}

export const DaoContractInfo: React.FC<IDaoContractInfoProps> = (props) => {
    const { plugin, daoId } = props;

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { blockTimestamp, transactionHash, address, release, build } = plugin;

    const { t } = useTranslations();

    const { buildEntityUrl } = useBlockExplorer();

    if (dao == null) {
        return null;
    }

    const chainId = networkDefinitions[dao.network].chainId;

    const pluginLaunchedAt = formatterUtils.formatDate(blockTimestamp * 1000, { format: DateFormat.YEAR_MONTH });

    const pluginCreationLink = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: transactionHash,
        chainId,
    });

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.settings.daoPluginInfo.plugin')}>
                <Link
                    description={addressUtils.truncateAddress(address)}
                    iconRight={IconType.LINK_EXTERNAL}
                    href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address, chainId })}
                    target="_blank"
                >
                    {t('app.settings.daoPluginInfo.pluginVersionInfo', {
                        name: daoUtils.getPluginName(plugin),
                        release,
                        build,
                    })}
                </Link>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.settings.daoPluginInfo.launchedAt')}>
                <Link href={pluginCreationLink} target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                    {pluginLaunchedAt}
                </Link>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
