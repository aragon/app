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
    useBlockExplorer,
} from '@aragon/gov-ui-kit';

export interface IDaoPluginInfoContractProps {
    /**
     * The ID of the DAO.
     */
    daoId: string;
    /**
     * The plugin to show the contract information for
     */
    plugin: IDaoPlugin;
}

export const DaoPluginInfoContract: React.FC<IDaoPluginInfoContractProps> = (props) => {
    const { plugin, daoId } = props;

    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    if (dao == null) {
        return null;
    }

    const { blockTimestamp, transactionHash, address, release, build } = plugin;
    const pluginLaunchedAt = formatterUtils.formatDate(blockTimestamp * 1000, { format: DateFormat.YEAR_MONTH });

    const { id: chainId } = networkDefinitions[dao.network];
    const pluginCreationLink = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: transactionHash, chainId });

    const pluginName = daoUtils.getPluginName(plugin);
    const pluginLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address, chainId });

    return (
        <DefinitionList.Container>
            <DefinitionList.Item
                term={t('app.settings.daoPluginInfo.contract.plugin')}
                link={{ href: pluginLink, description: addressUtils.truncateAddress(address) }}
            >
                {t('app.settings.daoPluginInfo.contract.pluginVersionInfo', { name: pluginName, release, build })}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.settings.daoPluginInfo.contract.launchedAt')}
                link={{ href: pluginCreationLink }}
            >
                {pluginLaunchedAt}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
