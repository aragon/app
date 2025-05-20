import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, ChainEntityType, Clipboard, DefinitionList, Link, useBlockExplorer } from '@aragon/gov-ui-kit';

export interface IDaoVersionInfoProps {
    /**
     * Dao to display the info for.
     */
    dao: IDao;
}

export const DaoVersionInfo: React.FC<IDaoVersionInfoProps> = (props) => {
    const { dao } = props;
    const { t } = useTranslations();

    const { id: chainId } = networkDefinitions[dao.network];
    const { buildEntityUrl } = useBlockExplorer();

    const daoLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao.address, chainId });
    const processPlugins = useDaoPlugins({ daoId: dao.id, type: PluginType.PROCESS, includeSubPlugins: true });

    return (
        <DefinitionList.Container>
            <DefinitionList.Item
                term={t('app.settings.daoVersionInfo.osLabel')}
                description={t('app.settings.daoVersionInfo.osValue', { version: dao.version })}
            >
                <Clipboard copyValue={dao.address} variant="avatar">
                    <Link href={daoLink}>{addressUtils.truncateAddress(dao.address)}</Link>
                </Clipboard>
            </DefinitionList.Item>
            {processPlugins?.map((plugin) => (
                <DefinitionList.Item
                    key={plugin.uniqueId}
                    term={daoUtils.getPluginName(plugin.meta)}
                    description={t('app.settings.daoVersionInfo.governanceValue', {
                        name: daoUtils.getPluginName(plugin.meta),
                        release: plugin.meta.release,
                        build: plugin.meta.build,
                    })}
                >
                    <Clipboard copyValue={plugin.meta.address} variant="avatar">
                        <Link
                            href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: plugin.meta.address, chainId })}
                        >
                            {addressUtils.truncateAddress(plugin.meta.address)}
                        </Link>
                    </Clipboard>
                </DefinitionList.Item>
            ))}
        </DefinitionList.Container>
    );
};
