import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    addressUtils,
    ChainEntityType,
    DateFormat,
    formatterUtils,
    type IDefinitionSetting,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { useDaoPlugins } from '../useDaoPlugins';

export interface IUseDaoPluginInfoParams {
    /**
     * ID of the DAO to get the plugin info for.
     */
    daoId: string;
    /**
     * Address of the plugin to build the info for.
     */
    address: string;
    /**
     * Additional settings to be appended to the plugin info.
     */
    settings?: IDefinitionSetting[];
}

export const useDaoPluginInfo = (params: IUseDaoPluginInfoParams): IDefinitionSetting[] => {
    const { daoId, address, settings = [] } = params;

    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const plugin = useDaoPlugins({ daoId, pluginAddress: address })?.[0];

    if (dao == null || plugin == null) {
        return settings;
    }

    const { blockTimestamp, transactionHash, release, build } = plugin.meta;
    const pluginLaunchedAt = formatterUtils.formatDate(blockTimestamp * 1000, { format: DateFormat.YEAR_MONTH })!;

    const { id: chainId } = networkDefinitions[dao.network];
    const pluginCreationLink = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: transactionHash, chainId });

    const name = daoUtils.getPluginName(plugin.meta);
    const pluginLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address, chainId });

    return [
        {
            term: t('app.shared.daoPluginInfo.plugin'),
            description: t('app.shared.daoPluginInfo.pluginVersionInfo', { name, release, build }),
            link: { href: pluginLink, isExternal: true },
            copyValue: address,
            definition: addressUtils.truncateAddress(address),
        },
        {
            term: t('app.shared.daoPluginInfo.launchedAt'),
            link: { href: pluginCreationLink },
            definition: pluginLaunchedAt,
        },
        ...settings,
    ];
};
