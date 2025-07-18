import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
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

export interface IDaoProcessDetailsInfoProps {
    /**
     * The DAO plugin associated with the process details.
     */
    plugin: IDaoPlugin;
    /**
     * The DAO associated with the process details.
     */
    dao: IDao;
}

export const DaoProcessDetailsInfo: React.FC<IDaoProcessDetailsInfoProps> = (props) => {
    const { plugin, dao } = props;

    const { t } = useTranslations();

    const { id: chainId } = networkDefinitions[dao.network];
    const { buildEntityUrl } = useBlockExplorer();

    const pluginLaunchedAt = formatterUtils.formatDate(plugin.blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH,
    });

    const pluginCreationLink = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: plugin.transactionHash,
        chainId,
    });

    const versionInfo = `${daoUtils.parsePluginSubdomain(plugin.subdomain)} v${plugin.release}.${plugin.build}`;

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term="Plugin name">
                <p className="text-neutral-500">{daoUtils.getPluginName(plugin)}</p>
            </DefinitionList.Item>
            <DefinitionList.Item term="Process key">
                <p className="text-neutral-500">{plugin.slug.toUpperCase()}</p>
            </DefinitionList.Item>
            <DefinitionList.Item
                term="Plugin address"
                copyValue={plugin.address}
                link={{
                    href: buildEntityUrl({
                        type: ChainEntityType.ADDRESS,
                        id: plugin.address,
                        chainId,
                    }),
                }}
                description={versionInfo}
            >
                {addressUtils.truncateAddress(plugin.address)}
            </DefinitionList.Item>
            <DefinitionList.Item term="Launched at" link={{ href: pluginCreationLink }}>
                {pluginLaunchedAt}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
